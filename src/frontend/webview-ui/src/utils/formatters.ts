/**
 * Formatting utilities for the webview UI
 */

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hrs = minutes / 60;
  if (Number.isInteger(hrs)) return `${hrs} hrs`;
  return `${hrs.toFixed(1)} hrs`;
}

export function formatHour(hour: number | null): string {
  if (hour === null) return "N/A";
  if (hour === 0) return "12 AM";
  if (hour < 12) return hour + " AM";
  if (hour === 12) return "12 PM";
  return hour - 12 + " PM";
}

export function getDayName(day: number | null): string {
  if (day === null) return "Unknown";
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day] || "Unknown";
}

// src/utils/formatters.ts
export function getLanguageIcon(language?: string): string {
  if (!language) return "📄";

  const map: Record<string, string> = {
    typescript: "📘",
    javascript: "📒",
    python: "🐍",
    rust: "🦀",
    go: "⚙️",
    java: "☕",
    c: "🔧",
    cpp: "➕",
    csharp: "🎼",
    html: "🌐",
    css: "🎨",
    json: "📋",
    markdown: "📝",
    sql: "💾",
    php: "🐘",
    ruby: "💎",
    swift: "⚡",
    kotlin: "📱",
    dart: "🎯",

    javascriptreact: "⚛️",
    typescriptreact: "⚛️",

    vue: "🟢",
    svelte: "🔥",
    solidity: "🔐",
    lua: "🌙",
    perl: "📜",
    r: "📊",
    shellscript: "🐚",
    powershell: "🪟",
    dockerfile: "🐳",
    yaml: "🧾",
    graphql: "🕸️",
    makefile: "🏗️",
    toml: "⚙️",
    plaintext: "📄",
  };

  return map[language.toLowerCase()] || "📄";
}


export function getAchievementIcon(achievement: string): string {
  const map: Record<string, string> = {
    "Night Owl": "🦉",
    "Early Bird": "🐦",
    "Weekend Warrior": "⚔️",
    "Streak Master": "🔥",
    Debugger: "🐛",
    "Speed Demon": "⚡",
    Polyglot: "🌍",
    "Focus Master": "🎯",
    "Code Cleaner": "🧹",
    "Git Guru": "🎓",
  };
  return map[achievement] || "🏆";
}

export function getWelcomeMessage(daysOpened: number): string {
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();

  const isDecember = now.getMonth() === 11;

  if (daysOpened <= 1 && !isDecember) return "Your Day in Code";
  if (isDecember) return "Your Year in Code";
  if (daysOpened < 7) return "Your Recent Activity";
  if (daysOpened === 7) return "Your Weekly Activity";
  if (daysOpened > 7 && daysOpened < 30) return `Your Month So Far`;
  if (daysOpened === 30) return `Your ${monthName} in Code`;
  if (daysOpened < 365) return `Your ${year} So Far`;
  return `Your ${year} in Code`;
}
