import * as vscode from 'vscode';
import { MetricsStore } from '../../backend/core/MetricsStore';
import { AggregatedMetrics } from '../../backend/models/types';

/**
 * RecapPanel is the View-Controller for the extension's webview.
 * It manages the lifecycle of the VS Code WebviewPanel and handles 
 * the bidirectional communication between the Node.js extension host 
 * and the browser-based React frontend.
 * 
 * Responsibilities:
 * 1. Injecting HTML/JS bundles into the panel.
 * 2. Dispatching metrics data to the frontend.
 * 3. Handling UI-triggered commands (like JSON downloads).
 */
export class RecapPanel {
    public static currentPanel: RecapPanel | undefined;
    public static readonly viewType = 'yourYearInCodeRecap';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _metricsStore: MetricsStore;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, metricsStore: MetricsStore) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (RecapPanel.currentPanel) {
            RecapPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        console.log('[RecapPanel] Creating new webview panel');
        const panel = vscode.window.createWebviewPanel(
            RecapPanel.viewType,
            'VS Code Wrapped',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist', 'webview')]
            }
        );

        RecapPanel.currentPanel = new RecapPanel(panel, extensionUri, metricsStore);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, metricsStore: MetricsStore) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._metricsStore = metricsStore;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view state changes
        this._panel.onDidChangeViewState(
            (e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: any) => {
                console.log(`[RecapPanel] Received message: ${message.command}`);
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'refresh':
                        this._update();
                        return;
                    case 'ready':
                        this._sendData();
                        return;
                    case 'downloadStory':
                        this._handleDownload(message.data);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private async _handleDownload(metrics: any) {
        const options: vscode.SaveDialogOptions = {
            defaultUri: vscode.Uri.file(`vs-code-wrapped-${new Date().getFullYear()}.json`),
            filters: {
                'JSON': ['json']
            },
            title: 'Export your coding story'
        };

        const fileUri = await vscode.window.showSaveDialog(options);
        if (fileUri) {
            try {
                const encoder = new TextEncoder();
                const content = encoder.encode(JSON.stringify(metrics, null, 2));
                await vscode.workspace.fs.writeFile(fileUri, content);
                vscode.window.showInformationMessage(`Story exported successfully to ${fileUri.fsPath}`);
            } catch (err: any) {
                vscode.window.showErrorMessage(`Failed to export story: ${err.message}`);
            }
        }
    }

    private async _sendData() {
        console.log('[RecapPanel] Sending data to webview');
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        // Determine time range based on available data
        const allMetrics = this._metricsStore.getAllRawMetrics();
        const yearDates = Object.keys(allMetrics).filter(date => {
            const d = new Date(date);
            return d.getFullYear() === year;
        });
        const daysCount = yearDates.length;
        // const daysCount = 0;
        
        let timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly';
        let metrics: AggregatedMetrics;
        
        if (daysCount === 0) {
            // No data yet - use mock data
            timeRange = 'yearly';
            console.log('[RecapPanel] No data available, using MOCK data');
            metrics = this.getMockMetrics();
        } else if (now.getMonth() === 11) {
            // It's December! Force Yearly recap for the "Wrapped" experience
            timeRange = 'yearly';
            console.log(`[RecapPanel] December detected! Showing YEARLY stats (${daysCount} days of data)`);
            metrics = this._metricsStore.getAggregatedMetrics(year, undefined, timeRange);
        } else if (daysCount < 7) {
            // Recent activity - aggregate all of it so far (cumulative) instead of daily
            timeRange = 'yearly';
            console.log(`[RecapPanel] Showing RECENT stats cumulative (${daysCount} days of data)`);
            metrics = this._metricsStore.getAggregatedMetrics(year, undefined, timeRange);
        } else if (daysCount < 30) {
            // Less than a month - show weekly
            timeRange = 'weekly';
            console.log('[RecapPanel] Showing WEEKLY stats (last 7 days)');
            metrics = this._metricsStore.getAggregatedMetrics(year, month, timeRange);
        } else if (daysCount < 90) {
            // Less than 3 months - show monthly
            timeRange = 'monthly';
            console.log('[RecapPanel] Showing MONTHLY stats (current month)');
            metrics = this._metricsStore.getAggregatedMetrics(year, month, timeRange);
        } else {
            // 90+ days - show yearly
            timeRange = 'yearly';
            console.log('[RecapPanel] Showing YEARLY stats (full year)');
            metrics = this._metricsStore.getAggregatedMetrics(year, undefined, timeRange);
        }

        this._panel.webview.postMessage({ 
            command: 'updateMetrics', 
            data: { ...metrics, timeRange } 
        });
    }
    
    private getMockMetrics(): AggregatedMetrics {
        return {
            year: 2025,
            daysOpened: 142,
            longestStreak: 12,
            streak: 12,
            totalCodingTimeMinutes: 4500,
            topLanguages: [
                { language: 'rust', count: 2300 },
                { language: 'typescript', count: 1500 },
                { language: 'python', count: 800 },
                { language: 'javascript', count: 250 },
                { language: 'html', count: 180 },
                { language: 'css', count: 150 }
            ],
            totalDebugSessions: 45,
            totalTestRuns: 120,
            totalFailedBuilds: 88,
            totalTerminalLaunches: 80,
            totalSearches: 200,
            totalSnippetExpansions: 50,
            totalRefactorCommands: 10,
            totalFocusBlocks: 25,
            uniqueFilesCount: 300,
            uniqueProjectsCount: 5,
            
            // New MVP metrics
            totalLinesAdded: 15420,
            totalLinesDeleted: 8230,
            netLines: 7190,
            totalEdits: 3240,
            totalFilesCreated: 45,
            totalFilesDeleted: 12,
            mostProductiveHour: 14, // 2 PM
            mostProductiveDay: 5, // Tuesday
            lateNightSessionCount: 18,
            totalLateNightMinutes: 450,
            weekendCodingPercentage: 25,
            longestSessionMinutes: 180, // 3 hours
            totalIntelliSenseAccepts: 1250,
            totalGoToDefinition: 340,
            totalFormatDocument: 89,
            totalQuickFixes: 156,
            activityByHour: { 14: 50 },
            activityByDay: { 2: 100 },
            achievements: ['Night Owl', 'Weekend Warrior', 'Speed Demon', 'Polyglot'],
            dailyHistory: this.generateMockDailyHistory()
        };
    }

    private generateMockDailyHistory(): { date: string, count: number }[] {
        const history = [];
        const now = new Date();
        // Generate last 365 days for the yearly view mock
        for (let i = 365; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            history.push({
                date: d.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 50)
            });
        }
        return history;
    }

    public dispose() {
        RecapPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // The JS and CSS are in dist/webview/assets/
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', 'index.css')
        );

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
                <link href="${styleUri}" rel="stylesheet">
                <title>VS Code Wrapped</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
