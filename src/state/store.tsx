/** App state: context + reducer + localStorage persistence. */

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Goal, QuizQuestion } from "../types/content";
import {
  AppState,
  ChallengeProgress,
  MistakeNote,
  Preferences,
  Rating,
  SandboxReport,
  WorkspaceTestCase,
  defaultState,
} from "../types/state";
import { newCardState, reviewCard } from "../lib/srs";
import { dayKey } from "../lib/dates";
import { loadState, saveState } from "../lib/storage";

export type Action =
  | { type: "setPrefs"; prefs: Partial<Preferences> }
  | { type: "setGoal"; goal: Goal | null }
  | { type: "onboardDone" }
  | { type: "completeLesson"; lessonId: string; moduleId: string; title: string }
  | { type: "toggleBookmark"; kind: "lesson" | "card" | "glossary"; refId: string }
  | { type: "addNote"; text: string; lessonId?: string; moduleId?: string }
  | { type: "updateNote"; id: string; text: string }
  | { type: "deleteNote"; id: string }
  | { type: "quizAnswer"; question: QuizQuestion; chosen: string[]; correct: boolean }
  | { type: "quizFinished"; moduleId: string; mode: "practice" | "assessment"; questions: QuizQuestion[]; answers: Record<string, string[]> }
  | { type: "resolveMistake"; questionId: string }
  | { type: "rateCard"; cardId: string; rating: Rating }
  | { type: "toggleCardBookmark"; cardId: string }
  | { type: "recordTestRun"; testCardId: string; status: "pass" | "fail" | "blocked"; actual: string }
  | { type: "challengeProgress"; challengeId: string; status: ChallengeProgress["status"]; selfScore?: number; title?: string }
  | { type: "addSandboxReport"; report: Omit<SandboxReport, "id" | "at"> }
  | { type: "deleteSandboxReport"; id: string }
  | { type: "revealSolution"; key: string }
  | { type: "gameSession"; game: "boundary" | "detective" | "sorter"; score: number; best?: "boundaryBest" | "sorterBest" }
  | { type: "detectiveFound"; defectId: string }
  | { type: "addWorkspaceCase"; testCase: Omit<WorkspaceTestCase, "id" | "createdAt"> }
  | { type: "deleteWorkspaceCase"; id: string }
  | { type: "importState"; state: AppState }
  | { type: "reset" };

function pushActivity(state: AppState, kind: AppState["activity"][number]["kind"], detail?: string): AppState["activity"] {
  const now = new Date();
  const entry = { at: now.toISOString(), day: dayKey(now), kind, detail };
  return [...state.activity.slice(-399), entry];
}

function cap<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(arr.length - max) : arr;
}

export function reducer(state: AppState, action: Action): AppState {
  const now = new Date();
  switch (action.type) {
    case "setPrefs":
      return { ...state, preferences: { ...state.preferences, ...action.prefs } };
    case "setGoal":
      return { ...state, preferences: { ...state.preferences, goal: action.goal } };
    case "onboardDone":
      return { ...state, onboarded: true };
    case "completeLesson": {
      if (state.lessons[action.lessonId]) return state;
      return {
        ...state,
        lessons: { ...state.lessons, [action.lessonId]: { lessonId: action.lessonId, completedAt: now.toISOString() } },
        activity: pushActivity(state, "lesson", action.title),
      };
    }
    case "toggleBookmark": {
      const existing = state.bookmarks.find((b) => b.kind === action.kind && b.refId === action.refId);
      if (existing) {
        return { ...state, bookmarks: state.bookmarks.filter((b) => b !== existing) };
      }
      return { ...state, bookmarks: [...state.bookmarks, { id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind: action.kind, refId: action.refId, at: now.toISOString() }] };
    }
    case "addNote":
      return {
        ...state,
        notes: [
          ...state.notes,
          { id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: now.toISOString(), updatedAt: now.toISOString(), text: action.text, lessonId: action.lessonId, moduleId: action.moduleId },
        ],
        activity: pushActivity(state, "note"),
      };
    case "updateNote":
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.id ? { ...n, text: action.text, updatedAt: now.toISOString() } : n)),
      };
    case "deleteNote":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };
    case "quizAnswer": {
      const q = action.question;
      const attempt = { questionId: q.id, moduleId: q.moduleId, topic: q.topic, chosen: action.chosen, correct: action.correct, at: now.toISOString() };
      let mistakes = state.mistakes;
      if (!action.correct) {
        const existingIdx = state.mistakes.findIndex((m) => m.questionId === q.id);
        const note: MistakeNote = { questionId: q.id, moduleId: q.moduleId, topic: q.topic, chosen: action.chosen, correctIds: q.correct, at: now.toISOString(), resolved: false };
        mistakes = existingIdx >= 0 ? mistakes.map((m, i) => (i === existingIdx ? note : m)) : [...mistakes, note];
      } else {
        mistakes = state.mistakes.map((m) => (m.questionId === q.id ? { ...m, resolved: true } : m));
      }
      return { ...state, quizAttempts: cap([...state.quizAttempts, attempt], 600), mistakes };
    }
    case "quizFinished": {
      const { questions, answers } = action;
      let score = 0;
      const breakdown: Record<string, { correct: number; total: number }> = {};
      for (const q of questions) {
        if (!answers[q.id]) continue;
        breakdown[q.topic] ??= { correct: 0, total: 0 };
        breakdown[q.topic].total += 1;
        const ok = [...new Set(answers[q.id])].sort().join("\u0001") === [...q.correct].sort().join("\u0001");
        if (ok) {
          score += 1;
          breakdown[q.topic].correct += 1;
        }
      }
      const session = {
        id: `qs-${Date.now()}`,
        moduleId: action.moduleId,
        mode: action.mode,
        finishedAt: now.toISOString(),
        score,
        total: questions.filter((q) => answers[q.id]).length,
        topicBreakdown: breakdown,
      };
      return {
        ...state,
        quizSessions: cap([...state.quizSessions, session], 80),
        activity: pushActivity(state, "quiz", `Module ${action.moduleId}: ${score}/${session.total}`),
      };
    }
    case "resolveMistake":
      return { ...state, mistakes: state.mistakes.map((m) => (m.questionId === action.questionId ? { ...m, resolved: !m.resolved } : m)) };
    case "rateCard": {
      const card = reviewCard(state.cards[action.cardId], action.cardId, action.rating, now);
      return {
        ...state,
        cards: { ...state.cards, [action.cardId]: card },
        activity: state.cards[action.cardId] ? state.activity : pushActivity(state, "review"),
      };
    }
    case "toggleCardBookmark": {
      const existing = state.cards[action.cardId] ?? newCardState(action.cardId);
      return { ...state, cards: { ...state.cards, [action.cardId]: { ...existing, bookmarked: !existing.bookmarked } } };
    }
    case "recordTestRun":
      return {
        ...state,
        testRuns: { ...state.testRuns, [action.testCardId]: { status: action.status, actual: action.actual, at: now.toISOString() } },
        activity: pushActivity(state, "review", `Test run: ${action.status}`),
      };
    case "challengeProgress":
      return {
        ...state,
        challenges: {
          ...state.challenges,
          [action.challengeId]: { challengeId: action.challengeId, status: action.status, at: now.toISOString(), selfScore: action.selfScore ?? state.challenges[action.challengeId]?.selfScore },
        },
        activity: pushActivity(state, "challenge", action.title),
      };
    case "addSandboxReport":
      return {
        ...state,
        sandboxReports: [...state.sandboxReports, { ...action.report, id: `sr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: now.toISOString() }],
        activity: pushActivity(state, "sandbox", action.report.title),
      };
    case "deleteSandboxReport":
      return { ...state, sandboxReports: state.sandboxReports.filter((r) => r.id !== action.id) };
    case "revealSolution":
      return { ...state, revealedSolutions: { ...state.revealedSolutions, [action.key]: true } };
    case "gameSession":
      return {
        ...state,
        games: {
          ...state.games,
          ...(action.best ? { [action.best]: Math.max(state.games[action.best], action.score) } : {}),
          sessions: cap([...state.games.sessions, { at: now.toISOString(), game: action.game, score: action.score }], 100),
        },
        activity: pushActivity(state, "game", `${action.game}: ${action.score}`),
      };
    case "detectiveFound":
      return { ...state, games: { ...state.games, detectiveFound: [...new Set([...state.games.detectiveFound, action.defectId])] } };
    case "addWorkspaceCase":
      return {
        ...state,
        workspace: { testCases: [...state.workspace.testCases, { ...action.testCase, id: `wtc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: now.toISOString() }] },
      };
    case "deleteWorkspaceCase":
      return { ...state, workspace: { testCases: state.workspace.testCases.filter((t) => t.id !== action.id) } };
    case "importState":
      return { ...action.state, onboarded: true };
    case "reset":
      return { ...defaultState(now), onboarded: true, preferences: state.preferences };
    default:
      return state;
  }
}

export interface Store {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  saveError: boolean;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, initial }: { children: React.ReactNode; initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => init ?? loadState().state);
  const [saveError, setSaveError] = React.useState(false);

  useEffect(() => {
    const ok = saveState(state);
    setSaveError(!ok);
    document.documentElement.dataset.theme = state.preferences.theme;
    if (state.preferences.motion === "reduced") {
      document.documentElement.dataset.motion = "reduced";
    } else {
      delete document.documentElement.dataset.motion;
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, saveError }), [state, saveError]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
