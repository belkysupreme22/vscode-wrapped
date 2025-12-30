import { AggregatedMetrics } from '../models/types';

/**
 * Achievement calculation logic
 */

export function calculateAchievements(metrics: AggregatedMetrics): string[] {
    const achievements: string[] = [];
    
    // Night Owl - >30% coding after midnight
    if (metrics.lateNightSessionCount > metrics.daysOpened * 0.3) {
        achievements.push('Night Owl');
    }
    
    // Weekend Warrior - >30% coding on weekends
    if (metrics.weekendCodingPercentage > 30) {
        achievements.push('Weekend Warrior');
    }
    
    // Streak Master - 30+ day streak
    if (metrics.longestStreak >= 30) {
        achievements.push('Streak Master');
    }
    
    // Debugger - 100+ debug sessions
    if (metrics.totalDebugSessions >= 100) {
        achievements.push('Debugger');
    }
    
    // Speed Demon - 10,000+ lines in a year
    if (metrics.totalLinesAdded >= 10000) {
        achievements.push('Speed Demon');
    }
    
    // Polyglot - 10+ languages
    if (metrics.topLanguages.length >= 10) {
        achievements.push('Polyglot');
    }
    
    // Focus Master - 50+ focus blocks
    if (metrics.totalFocusBlocks >= 50) {
        achievements.push('Focus Master');
    }
    
    // Code Cleaner - More deletes than adds
    if (metrics.totalLinesDeleted > metrics.totalLinesAdded) {
        achievements.push('Code Cleaner');
    }
    
    // Early Bird - Most productive hour is before 7am
    if (metrics.mostProductiveHour >= 5 && metrics.mostProductiveHour < 7) {
        achievements.push('Early Bird');
    }
    
    return achievements;
}
