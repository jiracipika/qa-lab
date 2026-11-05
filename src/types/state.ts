/** Persisted learner state. One object, one localStorage key, versioned for export/import. */

import type { Goal, ID } from "./content";

export type Rating = 0 | 1 | 2 | 3; // 0 again, 1 hard, 2 good, 3 easy

export interface Preferences {
  theme: "light" | "dark";
  motion: "full" | "reduced";
  goal: Goal | null;
}

export interface CardState {
  id: ID;
  ease: number;
  interval: number; // days
  due: string; // yyyy-mm-dd
  reps: number;
  lapses: number;
  history: { at: string; rating: Rating }[];
  bookmarked: boolean;
}

export interface QuizAttemptRecord {
  questionId: ID;
  moduleId: ID;
  topic: string;
  chosen: string[];
  correct: boolean;
  at: string; // ISO datetime
}

export interface QuizSessionRecord {
  id: string;
  moduleId: ID;
  mode: "practice" | "assessment";
  finishedAt: string;
  score: number;
  total: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
}

export interface MistakeNote {
  questionId: ID;
  moduleId: ID;
  topic: string;
  chosen: string[];
  correctIds: string[];
  at: string;
  resolved: boolean;
}

export interface LessonProgress {
  lessonId: ID;
  completedAt: string;
}

export interface ChallengeProgress {
  challengeId: ID;
  status: "attempted" | "self-checked";
  at: string;
  selfScore?: number; // 0..100 self-assessed rubric score
}

export interface SandboxReport {
  id: string;
  at: string;
  title: string;
  environment: string;
  preconditions: string;
  steps: string;
  expected: string;
  actual: string;
  severity: string;
  priority: string;
  rationale: string;
  /** the specification line this report claims is contradicted (S1..S7) */
  specRef: string;
  /** set when the learner reveals solutions: which intentional defect this matches, if any */
  matchedDefectId: string | null;
}

export interface Note {
  id: string;
  createdAt: string;
  updatedAt: string;
  lessonId?: ID;
  moduleId?: ID;
  text: string;
}

export interface Bookmark {
  id: string;
  kind: "lesson" | "card" | "glossary";
  refId: ID;
  at: string;
}

export interface WorkspaceTestCase {
  id: string;
  createdAt: string;
  title: string;
  requirement: string;
  steps: string;
  expected: string;
  classification: "positive" | "negative" | "boundary" | "other";
  source?: string;
}

export interface GameSession {
  at: string;
  game: "boundary" | "detective" | "sorter";
  score: number;
}

export interface GameState {
  boundaryBest: number;
  sorterBest: number;
  detectiveFound: string[]; // defect ids confirmed with evidence
  sessions: GameSession[];
}

export interface ActivityEntry {
  at: string; // ISO datetime
  day: string; // yyyy-mm-dd local
  kind: "lesson" | "quiz" | "review" | "game" | "sandbox" | "challenge" | "note";
  detail?: string;
}

export interface TestRun {
  status: "pass" | "fail" | "blocked";
  actual: string;
  at: string;
}

export interface AppState {
  version: 1;
  createdAt: string;
  onboarded: boolean;
  preferences: Preferences;
  lessons: Record<ID, { lessonId: ID; completedAt: string }>;
  challenges: Record<ID, ChallengeProgress>;
  cards: Record<ID, CardState>;
  quizAttempts: QuizAttemptRecord[];
  quizSessions: QuizSessionRecord[];
  mistakes: MistakeNote[];
  notes: Note[];
  bookmarks: Bookmark[];
  sandboxReports: SandboxReport[];
  workspace: { testCases: WorkspaceTestCase[] };
  games: GameState;
  activity: ActivityEntry[];
  testRuns: Record<ID, import("./content").TestCaseCard["id"] extends never ? never : { status: "pass" | "fail" | "blocked"; actual: string; at: string }>;
  revealedSolutions: Record<string, true>;
}

export type AppStateExceptTestRuns = Omit<AppState, "testRuns"> & {
  testRuns?: Record<string, TestRun>;
};

export function defaultState(now = new Date()): AppState {
  return {
    version: 1,
    createdAt: now.toISOString(),
    onboarded: false,
    preferences: { theme: "light", motion: "full", goal: null },
    lessons: {},
    challenges: {},
    cards: {},
    quizAttempts: [],
    quizSessions: [],
    mistakes: [],
    notes: [],
    bookmarks: [],
    sandboxReports: [],
    workspace: { testCases: [] },
    games: { boundaryBest: 0, sorterBest: 0, detectiveFound: [], sessions: [] },
    activity: [],
    testRuns: {},
    revealedSolutions: {},
  };
}
