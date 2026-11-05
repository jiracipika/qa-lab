/**
 * Spaced repetition for concept cards.
 *
 * Documented schedule (a simplified SM-2, day-granular):
 * - Every card starts at ease 2.5, interval 0 (due immediately).
 * - "again": ease -0.2 (min 1.3), interval -> 0 (stays due today), lapses + 1.
 * - "hard":  ease -0.15 (min 1.3), interval -> max(1, round(interval * 1.2)); first interval 1 day.
 * - "good":  ease unchanged,      interval -> round(interval * ease); first interval 1 day.
 * - "easy":  ease +0.15 (max 2.8), interval -> round(interval * ease * 1.3); first interval 3 days.
 * - The new due date is today + interval days (0 keeps the card due today).
 *
 * Review ratings are deliberately separate from quiz scores: a rating describes
 * self-assessed recall, not a graded answer.
 */
import type { CardState, Rating } from "../types/state";
import { addDays, dayKey } from "./dates";

export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;

export const RATING_LABELS: Record<Rating, string> = {
  0: "Again",
  1: "Hard",
  2: "Good",
  3: "Easy",
};

export function newCardState(id: string): CardState {
  return { id, ease: 2.5, interval: 0, due: dayKey(), reps: 0, lapses: 0, history: [], bookmarked: false };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function reviewCard(existing: CardState | undefined, id: string, rating: Rating, now: Date = new Date()): CardState {
  const prev = existing ?? newCardState(id);
  let { ease, interval, lapses } = prev;

  switch (rating) {
    case 0:
      ease = clamp(ease - 0.2, MIN_EASE, MAX_EASE);
      interval = 0;
      lapses += 1;
      break;
    case 1:
      ease = clamp(ease - 0.15, MIN_EASE, MAX_EASE);
      interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
      break;
    case 2:
      interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * ease));
      break;
    case 3:
      ease = clamp(ease + 0.15, MIN_EASE, MAX_EASE);
      interval = interval === 0 ? 3 : Math.max(1, Math.round(interval * ease * 1.3));
      break;
  }

  const due = interval === 0 ? dayKey(now) : addDays(dayKey(now), interval);
  return {
    ...prev,
    ease: Math.round(ease * 100) / 100,
    interval,
    lapses,
    reps: prev.reps + 1,
    due,
    history: [...prev.history.slice(-49), { at: now.toISOString(), rating }],
  };
}

/** Preview the next interval for each rating, shown under the rating buttons. */
export function previewIntervals(existing: CardState | undefined, id: string, now: Date = new Date()): Record<Rating, number> {
  const out = {} as Record<Rating, number>;
  for (const r of [0, 1, 2, 3] as Rating[]) {
    out[r] = reviewCard(existing, id, r, now).interval;
  }
  return out;
}
