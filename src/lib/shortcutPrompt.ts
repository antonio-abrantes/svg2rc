const STORAGE_KEY = "svg2rc:shortcut-prompt";

export type ShortcutPromptDecision = "dismissed" | "installed";

export function getShortcutPromptDecision(): ShortcutPromptDecision | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "dismissed" || value === "installed") return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function setShortcutPromptDecision(decision: ShortcutPromptDecision) {
  try {
    localStorage.setItem(STORAGE_KEY, decision);
  } catch {
    /* ignore */
  }
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}
