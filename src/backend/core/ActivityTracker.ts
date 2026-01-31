import * as vscode from 'vscode';
import { MetricsStore } from './MetricsStore';

/**
 * ActivityTracker is the main 'sensor' of the extension.
 * It hooks into the VS Code API to monitor user interactions, document changes, 
 * and system events, translating them into granular metrics.
 * 
 * Strategy: 
 * 1. Event-based: Immediate capture of high-intent actions (saves, edits, terminal use).
 * 2. Polling-based: Periodic check for 'active' status to estimate coding duration.
 */
export class ActivityTracker {
  private metricsStore: MetricsStore;
  private disposables: vscode.Disposable[] = [];
  private lastActiveTime: number = Date.now();
  private focusSessionStart: number | null = null;
  private sessionStart: number = Date.now();
  private readonly FOCUS_THRESHOLD_MS = 25 * 60 * 1000; // 25 minutes
  private lastTypingTime = 0;
  private trackingInterval?: NodeJS.Timeout;
  private lastActivityPatternMinute = -1;
  private lastDefinitionTime = 0;
  private lastFormatTime = 0;
  private lastQuickFixTime = 0;

    constructor(metricsStore: MetricsStore) {
        this.metricsStore = metricsStore;
        this.registerListeners();
    }

  /**
   * Registers all relevant VS Code event listeners.
   * Most metrics are captured here via disposables for clean cleanup on deactivate.
   */
  private registerListeners() {
    // 1. File Edits, Languages & Lines
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(
        (e: vscode.TextDocumentChangeEvent) => {
          if (e.document.uri.scheme === "file" && e.contentChanges.length > 0) {
            // Track file edit
            this.metricsStore.recordFileEdit(
              e.document.uri.fsPath,
              e.document.languageId,
            );

            // Track lines added/deleted and edits
            let linesAdded = 0;
            let linesDeleted = 0;
            for (const change of e.contentChanges) {
              const addedLines = change.text.split("\n").length - 1;
              const deletedLines =
                change.range.end.line - change.range.start.line;
              linesAdded += addedLines;
              linesDeleted += deletedLines;
            }

            this.metricsStore.incrementCounter("linesAdded", linesAdded);
            this.metricsStore.incrementCounter("linesDeleted", linesDeleted);
            if (e.contentChanges.length <= 500) {
              this.metricsStore.incrementCounter(
                "totalEdits",
                e.contentChanges.length,
              );
            }

            // Track hourly and daily activity
            this.recordActivityPattern();

            this.updateActivity();
          }

          const now = Date.now();

          // Heuristic IntelliSense accept detection
          const insertedText = e.contentChanges[0].text;

          if (
            e.contentChanges.length === 1 &&
            insertedText.length > 1 &&
            insertedText.length < 80 &&
            now - this.lastTypingTime < 500
          ) {
            this.metricsStore.incrementCounter("intellisenseAccepts");
          }

          this.lastTypingTime = now;
        },
      ),
    );

    // 2. File Creation
    this.disposables.push(
      vscode.workspace.onDidCreateFiles((e: vscode.FileCreateEvent) => {
        this.metricsStore.incrementCounter("filesCreated", e.files.length);
      }),
    );

    // 3. File Deletion
    this.disposables.push(
      vscode.workspace.onDidDeleteFiles((e: vscode.FileDeleteEvent) => {
        this.metricsStore.incrementCounter("filesDeleted", e.files.length);
      }),
    );

    // 2. Debug Sessions
    this.disposables.push(
      vscode.debug.onDidStartDebugSession(() => {
        console.log("[ActivityTracker] Debug session started");
        this.metricsStore.incrementCounter("debugSessions");
        this.updateActivity();
      }),
    );

    // 3. Terminal Launches
    this.disposables.push(
      vscode.window.onDidOpenTerminal(() => {
        console.log("[ActivityTracker] Terminal opened");
        this.metricsStore.incrementCounter("terminalLaunches");
        this.updateActivity();
      }),
    );

    // 4. Task/Build Failures (Heuristic: Task ends with non-zero exit code)
    this.disposables.push(
      vscode.tasks.onDidEndTaskProcess((e: vscode.TaskProcessEndEvent) => {
        console.log(
          `[ActivityTracker] Task ended with exit code ${e.exitCode}`,
        );
        this.metricsStore.incrementCounter("testRuns"); // Assume tasks are often tests/builds
        if (e.exitCode !== 0) {
          this.metricsStore.incrementCounter("failedBuilds");
        }
        this.updateActivity();
      }),
    );

    // 5. Projects
    if (vscode.workspace.workspaceFolders) {
      vscode.workspace.workspaceFolders.forEach(
        (folder: vscode.WorkspaceFolder) => {
          this.metricsStore.recordProject(folder.uri.fsPath);
        },
      );
    }
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(
        (e: vscode.WorkspaceFoldersChangeEvent) => {
          e.added.forEach((folder: vscode.WorkspaceFolder) => {
            this.metricsStore.recordProject(folder.uri.fsPath);
          });
        },
      ),
    );

    // 6. Focus Blocks (Simple tracking)
    this.disposables.push(
      vscode.window.onDidChangeWindowState((e: vscode.WindowState) => {
        if (e.focused) {
          console.log("[ActivityTracker] Window focused");
          this.focusSessionStart = Date.now();
        } else {
          console.log("[ActivityTracker] Window blurred");
          if (this.focusSessionStart) {
            const duration = Date.now() - this.focusSessionStart;
            if (duration > this.FOCUS_THRESHOLD_MS) {
              console.log(
                `[ActivityTracker] Focus block recorded: ${duration}ms`,
              );
              this.metricsStore.incrementCounter("focusBlocks");
            }
            this.focusSessionStart = null;
          }
        }
      }),
    );

    // 7. Command tracking for Go to Definition, Format, Quick Fixes
    this.disposables.push(
      vscode.languages.registerDefinitionProvider(
        { scheme: "file" },
        {
          provideDefinition: () => {
            const now = Date.now();
            if (now - this.lastDefinitionTime > 1000) {
              this.metricsStore.incrementCounter("goToDefinitionCount");
              this.lastDefinitionTime = now;
            }
            return null;
          },
        },
      ),
    );

    this.disposables.push(
      vscode.languages.registerDocumentFormattingEditProvider(
        { scheme: "file" },
        {
          provideDocumentFormattingEdits: () => {
            const now = Date.now();
            if (now - this.lastFormatTime > 1000) {
              // 1 second debounce
              this.metricsStore.incrementCounter("formatDocumentCount");
              this.lastFormatTime = now;
            }
            return [];
          },
        },
      ),
    );

    this.disposables.push(
      vscode.languages.registerCodeActionsProvider(
        { scheme: "file" },
        {
          provideCodeActions: () => {
            const now = Date.now();
            if (now - this.lastQuickFixTime > 1000) {
              // 1 second debounce
              this.metricsStore.incrementCounter("quickFixesApplied");
              this.lastQuickFixTime = now;
            }
            return [];
          },
        },
        {
          providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
        },
      ),
    );
  }

  private recordActivityPattern() {
    const now = new Date();
    const minute = now.getMinutes();
    if (minute === this.lastActivityPatternMinute) return;

    this.lastActivityPatternMinute = minute;

    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    this.metricsStore.updateDailyMetric((metrics) => {
      metrics.hourlyActivity[hour] = (metrics.hourlyActivity[hour] || 0) + 1;
      metrics.dayOfWeekActivity[dayOfWeek] =
        (metrics.dayOfWeekActivity[dayOfWeek] || 0) + 1;
    });
  }

  private updateActivity() {
    const now = Date.now();
    if (now - this.lastActiveTime >= 2 * 60 * 1000) {
      this.sessionStart = now;
    }
    this.lastActiveTime = now;
  }

  // Polling for coding time and session tracking
  /**
   * Starts the 60-second polling interval for coding duration.
   *
   * Heuristic: If activity happened within the last 2 minutes, we count the
   * current minute as 'active' coding time. This filters out idling or
   * passive reading sessions.
   */
  public startTracking() {
    this.trackingInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastActiveTime < 2 * 60 * 1000) {
        // Active in last 2 mins
        const currentDate = new Date();
        const hour = currentDate.getHours();
        const dayOfWeek = currentDate.getDay();

        // Increment coding time
        this.metricsStore.incrementCounter("codingTimeMinutes", 1);

        // Track late night coding (12am-5am)
        if (hour >= 0 && hour < 5) {
          this.metricsStore.incrementCounter("lateNightMinutes", 1);
        }

        // Track weekend coding (Saturday=6, Sunday=0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          this.metricsStore.incrementCounter("weekendMinutes", 1);
        }

        // Track session length
        const sessionDuration = Math.floor(
          (now - this.sessionStart) / (60 * 1000),
        );
        this.metricsStore.updateDailyMetric((metrics) => {
          if (sessionDuration > metrics.longestSessionMinutes) {
            metrics.longestSessionMinutes = sessionDuration;
          }
        });
      } else {
        // Session ended, reset
        this.sessionStart = now;
      }

      if (this.focusSessionStart) {
        const duration = now - this.focusSessionStart;
        if (duration > this.FOCUS_THRESHOLD_MS) {
          this.metricsStore.incrementCounter("focusBlocks");
          this.focusSessionStart = now; // prevent double count
        }
      }
    }, 60 * 1000); // Check every minute
  }

  public dispose() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
    this.disposables.forEach((d) => d.dispose());
  }
}
