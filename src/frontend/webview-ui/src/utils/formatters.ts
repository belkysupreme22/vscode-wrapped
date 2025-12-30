/**
 * Formatting utilities for the webview UI
 */

export function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

export function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = minutes / 60;
    if (Number.isInteger(hrs)) return `${hrs} hrs`;
    return `${hrs.toFixed(1)} hrs`;
}

export function formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return hour + ' AM';
    if (hour === 12) return '12 PM';
    return (hour - 12) + ' PM';
}

export function getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
}

export function getLanguageIcon(language: string): string {
    const map: Record<string, string> = {
        'typescript': '📘',
        'javascript': '📒',
        'python': '🐍',
        'rust': '🦀',
        'go': '🐹',
        'java': '☕',
        'c': '🇨',
        'cpp': '🇨++',
        'csharp': '#️⃣',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'markdown': '📝',
        'sql': '💾',
        'php': '🐘',
        'ruby': '💎',
        'swift': '🕊️',
        'kotlin': '🅺',
        'dart': '🎯'
    };
    return map[language.toLowerCase()] || '📄';
}

export function getAchievementIcon(achievement: string): string {
    const map: Record<string, string> = {
        'Night Owl': '🦉',
        'Early Bird': '🐦',
        'Weekend Warrior': '⚔️',
        'Streak Master': '🔥',
        'Debugger': '🐛',
        'Speed Demon': '⚡',
        'Polyglot': '🌍',
        'Focus Master': '🎯',
        'Code Cleaner': '🧹',
        'Git Guru': '🎓'
    };
    return map[achievement] || '🏆';
}

export function getWelcomeMessage(daysOpened: number): string {
    if (daysOpened <= 1) return 'Your Day in Code';
    if (daysOpened < 7) return 'Your Recent Activity';
    if (daysOpened < 14) return 'Your Week in Code';
    if (daysOpened < 45) return 'Your Month in Code';
    if (daysOpened < 300) return 'Your Year So Far';
    return 'Your Year in Code';
}
