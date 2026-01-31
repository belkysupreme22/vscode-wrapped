import { AggregatedMetrics } from "../types/metrics";
import { formatNumber, formatHour } from "../utils/formatters";

export function generateRoasts(m: AggregatedMetrics): Record<number, string> {
  const roasts: Record<number, string> = {};

  // 0: Welcome
  roasts[0] =
    "Oh look, someone wants validation for staring at a screen all year. Don’t worry, the chair forgives you… barely.";

  // 1: Time
  roasts[1] =
     m.daysOpened > 300 
            ? `You opened VS Code ${m.daysOpened} days. Your social life filed a missing person report.` 
            : m.daysOpened < 50 
                ? `${m.daysOpened} days? Even a Tamagotchi has more commitment than you.` 
                : `${m.daysOpened} days. Mediocrity looks good on you… sadly.`,
        `Counting ${m.daysOpened} days of coding. Impressive, if your goal was to avoid sunlight.`,
        `VS Code loyalty: ${m.daysOpened} days. Your plants have given up on you.`

  // 2: Code Written
  roasts[2] =
   m.totalLinesAdded > 50000
            ? `${formatNumber(m.totalLinesAdded)} lines? Your keyboard deserves a medal. Quality optional.`
            : m.totalLinesAdded < 1000
                ? `Only ${formatNumber(m.totalLinesAdded)} lines? My grandma codes faster, and she’s dead.`
                : `${formatNumber(m.totalLinesAdded)} added, ${formatNumber(m.totalLinesDeleted)} deleted. Busy, yes. Effective? Debatable.`,
        `Lines added: ${formatNumber(m.totalLinesAdded)}, lines deleted: ${formatNumber(m.totalLinesDeleted)}. Your codebase feels the trauma.`,
        `Typing for ${formatNumber(m.totalLinesAdded)} lines, deleting ${formatNumber(m.totalLinesDeleted)}. Are you coding, or playing a cruel game of Jenga?`


  // 3: Languages List
  roasts[3] =
    m.topLanguages.length > 10
      ? `${m.topLanguages.length} languages? Jack of all trades, master of copy-paste.`
      : `${m.topLanguages.length} languages. Flirting with your tech stack like it’s Tinder.`;

  // 4: Top Language
  const topLang = m.topLanguages[0]?.language || "text";
  if (topLang === "typescript")
    roasts[4] =
      "TypeScript? You probably spend more time fighting the linter than writing code.";
  else if (topLang === "javascript")
    roasts[4] =
      "JavaScript. Because who needs type safety when you have 'undefined is not a function'?";
  else if (topLang === "python")
    roasts[4] =
      "Python. Significant whitespace is the only structure in your life.";
  else if (topLang === "rust")
    roasts[4] =
      "Rust. We get it, you're better than us. Rewrite it all, why don't you?";
  else roasts[4] = `${topLang}? That's... a choice.`;

  // 5: Productivity
  roasts[5] =  `Most productive at ${formatHour(m.mostProductiveHour)}? The magical hour when panic meets caffeine.`;

  // 6: Tools
 roasts[6] = 
  m.totalIntelliSenseAccepts > 100 && m.totalGoToDefinition > 100 && m.totalQuickFixes > 100
    ? `Go-to-definition ${formatNumber(m.totalGoToDefinition)} times, quick fixes ${formatNumber(m.totalQuickFixes)} applied. Translation: You don’t code, you outsource your brain to VS Code.`
    : m.totalIntelliSenseAccepts > 50 && m.totalGoToDefinition > 50 && m.totalQuickFixes > 50
      ? `Tools mastery: IntelliSense (${formatNumber(m.totalIntelliSenseAccepts)}), Definitions (${formatNumber(m.totalGoToDefinition)}), Quick Fixes (${formatNumber(m.totalQuickFixes)}). Who needs memory when you have automation?`
      : `You clicked ${formatNumber(m.totalIntelliSenseAccepts)} IntelliSense options, ran ${formatNumber(m.totalGoToDefinition)} jumps, and fixed ${formatNumber(m.totalQuickFixes)} disasters. IDE: 1, You: 0.`;

  // 7: Debugging
  if (m.totalDebugSessions > 100)
    roasts[7] = `You debugged ${m.totalDebugSessions} times. If 'Ctrl+Z' was a currency, you'd be a billionaire.`;
  else
    roasts[7] = `Only ${m.totalDebugSessions} debug sessions? You're either a genius or too scared to compile.`;

  // 8: Focus
  roasts[8] = `${m.totalFocusBlocks} focus blocks. Impressive. Now if only you could focus on writing good code.`;

  // 9: Achievements
  ((roasts[9] =
    m.achievements.length > 0
      ? `Achievements unlocked! Too bad they don’t pay rent or improve your life.`
      : "No achievements? Your story is not sad… just painfully empty."),
    `Achievements: ${m.achievements.length}. Congrats, you collected badges like a code-obsessed Pokémon.`,
    `Hall of Fame: ${m.achievements.length}. Your codebase applauds, silently, as it burns.`);

  // 10: Closing
  roasts[10] = "See you next time. Try to break fewer things, champ.";

  return roasts;
}
