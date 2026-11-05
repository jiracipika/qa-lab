/** Derived data from state: due cards, topic stats, next lesson, streaks. No fabricated mastery. */

import { allConceptCards, challengeById, goalModuleOrder, lessonById, modules } from "../content";
import { quizQuestionById } from "../content";
import { currentStreak, dayKey, hashString } from "../lib/dates";
import { isDue } from "../lib/dates";
import type { AppState } from "../types/state";

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
}

export function topicStats(state: AppState): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const a of state.quizAttempts) {
    const stat = map.get(a.topic) ?? { topic: a.topic, correct: 0, total: 0 };
    stat.total += 1;
    if (a.correct) stat.correct += 1;
    map.set(a.topic, stat);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function weakTopics(state: AppState, minAttempts = 3): TopicStat[] {
  return topicStats(state).filter((t) => t.total >= minAttempts && t.correct / t.total < 0.6);
}

export function strongTopics(state: AppState, minAttempts = 3): TopicStat[] {
  return topicStats(state).filter((t) => t.total >= minAttempts && t.correct / t.total >= 0.8);
}

export function dueConceptCards(state: AppState, today = dayKey()) {
  return allConceptCards.filter((c) => {
    const cs = state.cards[c.id];
    return !cs || isDue(cs.due, today);
  });
}

export function newConceptCards(state: AppState) {
  return allConceptCards.filter((c) => !state.cards[c.id]);
}

export function moduleLessonProgress(state: AppState, moduleId: string) {
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) return { done: 0, total: 0, pct: 0 };
  const done = mod.lessons.filter((l) => state.lessons[l.id]).length;
  return { done, total: mod.lessons.length, pct: Math.round((done / mod.lessons.length) * 100) };
}

export function moduleQuizBest(state: AppState, moduleId: string) {
  const sessions = state.quizSessions.filter((s) => s.moduleId === moduleId && s.total > 0);
  if (sessions.length === 0) return null;
  return Math.max(...sessions.map((s) => Math.round((s.score / s.total) * 100)));
}

/** The next lesson to study: first uncompleted lesson, ordered by goal preference. */
export function nextLesson(state: AppState) {
  const order = state.preferences.goal ? goalModuleOrder[state.preferences.goal] : modules.map((m) => m.id);
  for (const moduleId of order) {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) continue;
    const lesson = mod.lessons.find((l) => !state.lessons[l.id]);
    if (lesson) return { lesson, module: mod };
  }
  return null;
}

/** Deterministic daily challenge, rotating by date. */
export function dailyChallenge(_state: AppState, today = dayKey()) {
  const all = modules.flatMap((m) => m.challenges);
  if (all.length === 0) return null;
  const idx = hashString(today) % all.length;
  return all[idx];
}

export function streakDays(state: AppState): string[] {
  return [...new Set(state.activity.map((a) => a.day))];
}

export function currentStreakCount(state: AppState): number {
  return currentStreak(streakDays(state));
}

export function activityThisWeek(state: AppState): number {
  const days = streakDays(state);
  const today = new Date();
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    if (days.includes(key)) count += 1;
  }
  return count;
}

export function bookmarkedLessons(state: AppState) {
  return state.bookmarks
    .filter((b) => b.kind === "lesson")
    .map((b) => ({ bookmark: b, lesson: lessonById(b.refId) }))
    .filter((x) => x.lesson);
}

export function bookmarkedCards(state: AppState) {
  return state.bookmarks
    .filter((b) => b.kind === "card")
    .map((b) => ({ bookmark: b, card: allConceptCards.find((c) => c.id === b.refId) }))
    .filter((x) => x.card);
}

export function mistakeCards(state: AppState) {
  return state.mistakes
    .filter((m) => !m.resolved)
    .map((m) => ({ mistake: m, question: quizQuestionById(m.questionId) }))
    .filter((x) => x.question);
}

export function recentSessions(state: AppState, n = 5) {
  return [...state.quizSessions].reverse().slice(0, n);
}

export function completedChallenges(state: AppState) {
  const all = modules.flatMap((m) => m.challenges);
  return all.filter((c) => state.challenges[c.id]);
}

export function challengeStatus(state: AppState, challengeId: string): "attempted" | "self-checked" | null {
  return state.challenges[challengeId]?.status ?? null;
}

export function challengeByIdSafe(id: string) {
  return challengeById(id);
}
