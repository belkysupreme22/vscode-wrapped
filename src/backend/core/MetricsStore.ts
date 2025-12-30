import * as vscode from 'vscode';
import { DailyMetrics, AggregatedMetrics } from '../models/types';
import { getHash } from '../utils/crypto';
import { calculateAchievements } from '../utils/achievements';

/**
 * MetricsStore serves as the primary data access layer (DAL) for the extension.
 * It handles the persistence of daily development activity and provides methods 
 * for aggregating this raw data into user-facing metrics.
 * 
 * Design Pattern: Singleton-like access via ExtensionContext, focused on 
 * thread-safe (atomic) updates to the VS Code globalState.
 */
export class MetricsStore {
    private static readonly STORAGE_KEY = 'yourYearInCode.metrics';
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    private getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Atomically updates the metrics for the current day.
     * Uses a functional update pattern to prevent race conditions during 
     * multiple rapid-fire events (e.g., fast typing or multiple file saves).
     */
    public async updateDailyMetric(updateFn: (metrics: DailyMetrics) => void): Promise<void> {
        const today = this.getTodayDate();
        const allMetrics = this.context.globalState.get<Record<string, DailyMetrics>>(MetricsStore.STORAGE_KEY, {});
        
        if (!allMetrics[today]) {
            console.log(`[MetricsStore] Creating new daily metrics for ${today}`);
            allMetrics[today] = {
                date: today,
                filesEdited: [],
                languages: {},
                debugSessions: 0,
                testRuns: 0,
                failedBuilds: 0,
                terminalLaunches: 0,
                searches: 0,
                snippetExpansions: 0,
                refactorCommands: 0,
                focusBlocks: 0,
                codingTimeMinutes: 0,
                projects: [],
                linesAdded: 0,
                linesDeleted: 0,
                totalEdits: 0,
                filesCreated: 0,
                filesDeleted: 0,
                hourlyActivity: {},
                dayOfWeekActivity: {},
                lateNightMinutes: 0,
                weekendMinutes: 0,
                longestSessionMinutes: 0,
                intellisenseAccepts: 0,
                goToDefinitionCount: 0,
                formatDocumentCount: 0,
                quickFixesApplied: 0
            };
        }

        updateFn(allMetrics[today]);
        await this.context.globalState.update(MetricsStore.STORAGE_KEY, allMetrics);
    }

    public async incrementCounter(metric: keyof Omit<DailyMetrics, 'date' | 'filesEdited' | 'languages' | 'projects'>, amount: number = 1): Promise<void> {
        await this.updateDailyMetric((metrics) => {
            (metrics[metric] as number) += amount;
        });
    }

    public async recordFileEdit(filePath: string, languageId: string): Promise<void> {
        const hashedPath = getHash(filePath);
        await this.updateDailyMetric((metrics) => {
            if (!metrics.filesEdited.includes(hashedPath)) {
                metrics.filesEdited.push(hashedPath);
            }
            metrics.languages[languageId] = (metrics.languages[languageId] || 0) + 1;
        });
    }

    public async recordProject(folderPath: string): Promise<void> {
        const hashedPath = getHash(folderPath);
        await this.updateDailyMetric((metrics) => {
            if (!metrics.projects.includes(hashedPath)) {
                metrics.projects.push(hashedPath);
            }
        });
    }

    /**
     * Aggregates raw daily data into a cohesive 'Wrapped' story.
     * 
     * @param year The target year for the recap.
     * @param month Optional specific month filter.
     * @param timeRange Controls the aggregation window (days, weeks, or full year).
     * 
     * Architecture Note: This is an O(N) operation where N is the number of 
     * recorded days. It performs complex calculations like streak detection, 
     * language weighting, and peak productivity hours in a single pass.
     */
    public getAggregatedMetrics(year: number, month?: number, timeRange?: 'daily' | 'weekly' | 'monthly' | 'yearly'): AggregatedMetrics {
        console.log(`[MetricsStore] Aggregating metrics for Year: ${year}, Month: ${month}, TimeRange: ${timeRange || 'yearly'}`);
        const allMetrics = this.context.globalState.get<Record<string, DailyMetrics>>(MetricsStore.STORAGE_KEY, {});
        
        const now = new Date();
        let relevantDates: string[];
        
        if (timeRange === 'daily') {
            // Only today
            const today = this.getTodayDate();
            relevantDates = Object.keys(allMetrics).filter(date => date === today);
            
        } else if (timeRange === 'weekly') {
            // Last 7 days
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            relevantDates = Object.keys(allMetrics).filter(date => {
                const d = new Date(date);
                return d >= weekAgo && d <= now;
            });
            
        } else if (timeRange === 'monthly') {
            // Current month (or specified month)
            relevantDates = Object.keys(allMetrics).filter(date => {
                const d = new Date(date);
                const targetMonth = month !== undefined ? month : now.getMonth() + 1;
                return d.getFullYear() === year && d.getMonth() + 1 === targetMonth;
            });
            
        } else {
            // Yearly (default - existing logic)
            relevantDates = Object.keys(allMetrics).filter(date => {
                const d = new Date(date);
                const matchesYear = d.getFullYear() === year;
                const matchesMonth = month === undefined || d.getMonth() + 1 === month;
                return matchesYear && matchesMonth;
            });
        }

        const aggregated: AggregatedMetrics = {
            year,
            month,
            daysOpened: relevantDates.length,
            longestStreak: 0,
            totalCodingTimeMinutes: 0,
            topLanguages: [],
            totalDebugSessions: 0,
            totalTestRuns: 0,
            totalFailedBuilds: 0,
            totalTerminalLaunches: 0,
            totalSearches: 0,
            totalSnippetExpansions: 0,
            totalRefactorCommands: 0,
            totalFocusBlocks: 0,
            uniqueFilesCount: 0,
            uniqueProjectsCount: 0,
            totalLinesAdded: 0,
            totalLinesDeleted: 0,
            netLines: 0,
            totalEdits: 0,
            totalFilesCreated: 0,
            totalFilesDeleted: 0,
            mostProductiveHour: 0,
            mostProductiveDay: 0,
            streak: 0,
            lateNightSessionCount: 0,
            totalLateNightMinutes: 0,
            weekendCodingPercentage: 0,
            longestSessionMinutes: 0,
            totalIntelliSenseAccepts: 0,
            totalGoToDefinition: 0,
            totalFormatDocument: 0,
            totalQuickFixes: 0,
            activityByHour: {},
            activityByDay: {},
            achievements: [],
            dailyHistory: []
        };

        const uniqueFiles = new Set<string>();
        const uniqueProjects = new Set<string>();
        const languageCounts: Record<string, number> = {};
        const hourlyActivityCounts: Record<number, number> = {};
        const dayOfWeekActivityCounts: Record<number, number> = {};
        let currentStreak = 0;
        let maxStreak = 0;
        let lastDate: Date | null = null;
        let totalWeekendMinutes = 0;
        let lateNightSessionCount = 0;
        let totalLateNightMinutes = 0;

        // Sort dates for streak calculation
        relevantDates.sort();

        for (const dateStr of relevantDates) {
            const dayMetrics = allMetrics[dateStr];
            
            // Streak calculation
            const currentDate = new Date(dateStr);
            if (lastDate) {
                const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            lastDate = currentDate;

            // Aggregation - existing metrics
            aggregated.totalDebugSessions += dayMetrics.debugSessions || 0;
            aggregated.totalTestRuns += dayMetrics.testRuns || 0;
            aggregated.totalFailedBuilds += dayMetrics.failedBuilds || 0;
            aggregated.totalTerminalLaunches += dayMetrics.terminalLaunches || 0;
            aggregated.totalSearches += dayMetrics.searches || 0;
            aggregated.totalSnippetExpansions += dayMetrics.snippetExpansions || 0;
            aggregated.totalRefactorCommands += dayMetrics.refactorCommands || 0;
            aggregated.totalFocusBlocks += dayMetrics.focusBlocks || 0;
            aggregated.totalCodingTimeMinutes += dayMetrics.codingTimeMinutes || 0;
            aggregated.totalLinesAdded += dayMetrics.linesAdded || 0;
            aggregated.totalLinesDeleted += dayMetrics.linesDeleted || 0;
            aggregated.totalEdits += dayMetrics.totalEdits || 0;
            aggregated.totalFilesCreated += dayMetrics.filesCreated || 0;
            aggregated.totalFilesDeleted += dayMetrics.filesDeleted || 0;
            aggregated.totalIntelliSenseAccepts += dayMetrics.intellisenseAccepts || 0;
            aggregated.totalGoToDefinition += dayMetrics.goToDefinitionCount || 0;
            aggregated.totalFormatDocument += dayMetrics.formatDocumentCount || 0;
            aggregated.totalQuickFixes += dayMetrics.quickFixesApplied || 0;
            
            // Track longest session
            if ((dayMetrics.longestSessionMinutes || 0) > aggregated.longestSessionMinutes) {
                aggregated.longestSessionMinutes = dayMetrics.longestSessionMinutes || 0;
            }
            
            // Track late night sessions
            if ((dayMetrics.lateNightMinutes || 0) > 0) {
                lateNightSessionCount++;
                totalLateNightMinutes += dayMetrics.lateNightMinutes || 0;
            }
            
            // Track weekend minutes
            totalWeekendMinutes += dayMetrics.weekendMinutes || 0;
            
            // Aggregate hourly activity
            Object.entries(dayMetrics.hourlyActivity || {}).forEach(([hour, count]) => {
                hourlyActivityCounts[Number(hour)] = (hourlyActivityCounts[Number(hour)] || 0) + count;
            });
            
            // Aggregate day of week activity
            Object.entries(dayMetrics.dayOfWeekActivity || {}).forEach(([day, count]) => {
                dayOfWeekActivityCounts[Number(day)] = (dayOfWeekActivityCounts[Number(day)] || 0) + count;
            });

            dayMetrics.filesEdited.forEach((f: string) => uniqueFiles.add(f));
            dayMetrics.projects.forEach((p: string) => uniqueProjects.add(p));

            (Object.entries(dayMetrics.languages) as [string, number][]).forEach(([lang, count]) => {
                languageCounts[lang] = (languageCounts[lang] || 0) + count;
            });
        }

        // Final calculations
        aggregated.longestStreak = maxStreak;
        aggregated.uniqueFilesCount = uniqueFiles.size;
        aggregated.uniqueProjectsCount = uniqueProjects.size;
        aggregated.topLanguages = Object.entries(languageCounts)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count);
        
        // Calculate derived metrics
        aggregated.netLines = aggregated.totalLinesAdded - aggregated.totalLinesDeleted;
        aggregated.lateNightSessionCount = lateNightSessionCount;
        aggregated.totalLateNightMinutes = totalLateNightMinutes;
        aggregated.weekendCodingPercentage = aggregated.totalCodingTimeMinutes > 0
            ? Math.round((totalWeekendMinutes / aggregated.totalCodingTimeMinutes) * 100)
            : 0;
        
        // Find most productive hour
        const maxHourActivity = Math.max(...Object.values(hourlyActivityCounts), 0);
        aggregated.mostProductiveHour = maxHourActivity > 0
            ? Number(Object.keys(hourlyActivityCounts).find(h => hourlyActivityCounts[Number(h)] === maxHourActivity) || 0)
            : 0;
        
        // Find most productive day of week
        const maxDayActivity = Math.max(...Object.values(dayOfWeekActivityCounts), 0);
        aggregated.mostProductiveDay = maxDayActivity > 0
            ? Number(Object.keys(dayOfWeekActivityCounts).find(d => dayOfWeekActivityCounts[Number(d)] === maxDayActivity) || 0)
            : 0;
        
        // Pass the hourly and daily activity to frontend
        aggregated.activityByHour = hourlyActivityCounts;
        aggregated.activityByDay = dayOfWeekActivityCounts;
        
        // Set streak (using longestStreak for now as it's what we have)
        aggregated.streak = maxStreak;

        // Populate daily history for graphs
        aggregated.dailyHistory = relevantDates.map(dateStr => {
            const m = allMetrics[dateStr];
            return {
                date: dateStr,
                count: (m.totalEdits || 0) + (m.linesAdded || 0) + (m.linesDeleted || 0)
            };
        });
        
        // Calculate achievements
        aggregated.achievements = calculateAchievements(aggregated);

        return aggregated;
    }
    
    // For debugging/export
    public getAllRawMetrics(): Record<string, DailyMetrics> {
         return this.context.globalState.get<Record<string, DailyMetrics>>(MetricsStore.STORAGE_KEY, {});
    }
}
