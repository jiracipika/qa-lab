/**
 * Local persistence. Everything lives in ONE localStorage key per version.
 * Data is device/browser-specific: clearing site data or switching browsers loses it.
 * Use Settings -> Export to move progress between devices.
 */

import { AppState, defaultState } from "../types/state";

export const STORAGE_KEY = "qa-lab:v1";

export function loadState(): { state: AppState; recovered: boolean; error?: string } {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: defaultState(), recovered: false, error: "localStorage is not available in this browser; progress will not persist." };
  }
  if (!raw) return { state: defaultState(), recovered: false };
  try {
    const parsed = JSON.parse(raw) as unknown;
    return { state: sanitizeState(parsed), recovered: false };
  } catch (e) {
    // Keep the damaged blob for manual recovery, then start fresh.
    try {
      localStorage.setItem(`qa-lab:corrupt:${Date.now()}`, raw);
    } catch {
      /* ignore */
    }
    return { state: defaultState(), recovered: true, error: "Saved progress was damaged and could not be read. A backup copy was kept in this browser's storage." };
  }
}

/** Fill any missing fields so older/partial states keep working. Invalid values are dropped. */
export function sanitizeState(input: unknown): AppState {
  const base = defaultState();
  if (typeof input !== "object" || input === null) return base;
  const s = input as Partial<AppState>;
  const out: AppState = {
    ...base,
    ...(s.version === 1 ? s : {}),
    version: 1,
  };
  // Deep-fill nested objects that must exist.
  out.preferences = {
    theme: s.preferences?.theme === "dark" ? "dark" : s.preferences?.theme === "light" ? "light" : base.preferences.theme,
    motion: s.preferences?.motion === "reduced" ? "reduced" : "full",
    goal: s.preferences?.goal ?? null,
  };
  out.workspace = { testCases: Array.isArray(s.workspace?.testCases) ? s.workspace!.testCases : [] };
  out.games = {
    boundaryBest: typeof s.games?.boundaryBest === "number" ? s.games.boundaryBest : 0,
    sorterBest: typeof s.games?.sorterBest === "number" ? s.games.sorterBest : 0,
    detectiveFound: Array.isArray(s.games?.detectiveFound) ? s.games!.detectiveFound : [],
    sessions: Array.isArray(s.games?.sessions) ? s.games!.sessions : [],
  };
  for (const key of ["lessons", "challenges", "cards", "testRuns", "revealedSolutions"] as const) {
    if (typeof s[key] !== "object" || s[key] === null || Array.isArray(s[key])) {
      (out as unknown as Record<string, unknown>)[key] = {};
    }
  }
  for (const key of ["quizAttempts", "quizSessions", "mistakes", "notes", "bookmarks", "sandboxReports", "activity"] as const) {
    if (!Array.isArray(s[key])) {
      (out as unknown as Record<string, unknown>)[key] = [];
    }
  }
  return out;
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
