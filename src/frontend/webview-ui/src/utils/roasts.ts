import { AggregatedMetrics } from '../types/metrics';
import { formatNumber, formatHour } from '../utils/formatters';

export function generateRoasts(m: AggregatedMetrics): Record<number, string> {
    const roasts: Record<number, string> = {};
    
    // 0: Welcome
    roasts[0] = "Oh look, someone wants validation for sitting in a chair all year.";

    // 1: Time
    if (m.daysOpened > 300) roasts[1] = `You opened VS Code ${m.daysOpened} days. Do you have a home? Or is this it?`;
    else if (m.daysOpened < 50) roasts[1] = `${m.daysOpened} days? I've seen npm installs take longer than your entire year of coding.`;
    else roasts[1] = `${m.daysOpened} days. Mediocrity at its finest.`;
    
    // 2: Code Written
    if (m.totalLinesAdded > 50000) roasts[2] = `${formatNumber(m.totalLinesAdded)} lines? Quantity over quality, I see.`;
    else if (m.totalLinesAdded < 1000) roasts[2] = `Only ${formatNumber(m.totalLinesAdded)} lines? My grandma writes more code, and she's dead.`;
    else roasts[2] = `${formatNumber(m.totalLinesAdded)} lines added. ${formatNumber(m.totalLinesDeleted)} deleted. At least you're learning.`;

    // 3: Languages List
    roasts[3] = `${m.topLanguages.length} languages. Jack of all trades, master of none.`;

    // 4: Top Language
    const topLang = m.topLanguages[0]?.language || 'text';
    if (topLang === 'typescript') roasts[4] = "TypeScript? You probably spend more time fighting the linter than writing code.";
    else if (topLang === 'javascript') roasts[4] = "JavaScript. Because who needs type safety when you have 'undefined is not a function'?";
    else if (topLang === 'python') roasts[4] = "Python. Significant whitespace is the only structure in your life.";
    else if (topLang === 'rust') roasts[4] = "Rust. We get it, you're better than us. Rewrite it all, why don't you?";
    else roasts[4] = `${topLang}? That's... a choice.`;

    // 5: Productivity
    roasts[5] = `Most productive at ${formatHour(m.mostProductiveHour)}? Let me guess, that's when the coffee kicks in.`;

    // 6: Tools
    roasts[6] = `${formatNumber(m.totalIntelliSenseAccepts)} IntelliSense accepts. Can't even remember function names, can you?`;

    // 7: Debugging
    if (m.totalDebugSessions > 100) roasts[7] = `You debugged ${m.totalDebugSessions} times. If 'Ctrl+Z' was a currency, you'd be a billionaire.`;
    else roasts[7] = `Only ${m.totalDebugSessions} debug sessions? You're either a genius or too scared to compile.`;

    // 8: Focus
    roasts[8] = `${m.totalFocusBlocks} focus blocks. Impressive. Now if only you could focus on writing good code.`;

    // 9: Achievements
    roasts[9] = m.achievements.length > 0 ? "Achievements unlocked! Too bad they don't pay the bills." : "No achievements? Shocking.";

    // 10: Closing
    roasts[10] = "See you next year. Try to break fewer things.";
    
    return roasts;
}
