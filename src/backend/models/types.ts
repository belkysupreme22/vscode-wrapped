/**
 * Type definitions for VS Code Wrapped metrics
 */

export interface DailyMetrics {
    date: string; // YYYY-MM-DD
    filesEdited: string[]; // Hashed paths
    languages: Record<string, number>; // Language ID -> usage count
    debugSessions: number;
    testRuns: number;
    failedBuilds: number;
    terminalLaunches: number;
    searches: number;
    snippetExpansions: number;
    refactorCommands: number;
    focusBlocks: number; // >25 min sessions
    codingTimeMinutes: number; // Rough estimate
    projects: string[]; // Hashed workspace folders
    linesAdded: number;
    linesDeleted: number;
    totalEdits: number;
    filesCreated: number;
    filesDeleted: number;
    hourlyActivity: Record<number, number>; // Hour (0-23) -> activity count
    dayOfWeekActivity: Record<number, number>; // Day (0-6) -> activity count
    lateNightMinutes: number; // Minutes coded after midnight (12am-5am)
    weekendMinutes: number; // Minutes coded on Sat/Sun
    longestSessionMinutes: number;
    intellisenseAccepts: number;
    goToDefinitionCount: number;
    formatDocumentCount: number;
    quickFixesApplied: number;
}

export interface AggregatedMetrics {
    year: number;
    month?: number;
    daysOpened: number;
    longestStreak: number;
    streak: number;
    totalCodingTimeMinutes: number;
    topLanguages: { language: string; count: number }[];
    totalDebugSessions: number;
    totalTestRuns: number;
    totalFailedBuilds: number;
    totalTerminalLaunches: number;
    totalSearches: number;
    totalSnippetExpansions: number;
    totalRefactorCommands: number;
    totalFocusBlocks: number;
    uniqueFilesCount: number;
    uniqueProjectsCount: number;
    totalLinesAdded: number;
    totalLinesDeleted: number;
    netLines: number;
    totalEdits: number;
    totalFilesCreated: number;
    totalFilesDeleted: number;
    mostProductiveHour: number | null; // 0-23 or null if no activity
    mostProductiveDay: number | null; // 0-6 (0=Sunday) or null if no activity
    lateNightSessionCount: number;
    totalLateNightMinutes: number;
    weekendCodingPercentage: number; // 0-100
    longestSessionMinutes: number;
    totalIntelliSenseAccepts: number;
    totalGoToDefinition: number;
    totalFormatDocument: number;
    totalQuickFixes: number;
    activityByHour: Record<number, number>;
    activityByDay: Record<number, number>;
    
    // Achievements
    achievements: string[]; // Badge names
    dailyHistory: { date: string; count: number }[];
}
