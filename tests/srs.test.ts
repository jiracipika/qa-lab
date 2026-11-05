/** Spaced repetition schedule: documented behaviour of the simplified SM-2. */

import { describe, expect, it } from "vitest";
import { MIN_EASE, MAX_EASE, newCardState, previewIntervals, reviewCard } from "../src/lib/srs";
import { addDays, currentStreak, dayKey, isDue } from "../src/lib/dates";

const NOW = new Date(2026, 10, 5, 12, 0, 0); // 2026-11-05 local noon

describe("reviewCard schedule", () => {
  it("new card starts at ease 2.5, interval 0, due today", () => {
    const c = newCardState("card-1");
    expect(c.ease).toBe(2.5);
    expect(c.interval).toBe(0);
    expect(c.due).toBe(dayKey(NOW));
  });

  it("Again: stays due today, ease drops, lapses increment", () => {
    let c = newCardState("c");
    c = reviewCard(c, "c", 2, NOW); // good -> interval 1
    c = reviewCard(c, "c", 0, NOW); // again
    expect(c.interval).toBe(0);
    expect(c.due).toBe(dayKey(NOW));
    expect(c.ease).toBeCloseTo(2.3);
    expect(c.lapses).toBe(1);
    expect(isDue(c.due, dayKey(NOW))).toBe(true);
  });

  it("Good: first interval 1 day, then grows by ease factor", () => {
    let c = newCardState("c");
    c = reviewCard(c, "c", 2, NOW);
    expect(c.interval).toBe(1);
    expect(c.due).toBe(addDays(dayKey(NOW), 1));
    c = reviewCard(c, "c", 2, NOW);
    expect(c.interval).toBe(3); // round(1 * 2.5)
    c = reviewCard(c, "c", 2, NOW);
    expect(c.interval).toBe(8); // round(3 * 2.5)
  });

  it("Easy: first interval 3 days and ease increases", () => {
    let c = newCardState("c");
    c = reviewCard(c, "c", 3, NOW);
    expect(c.interval).toBe(3);
    expect(c.ease).toBeCloseTo(2.65);
    expect(c.due).toBe(addDays(dayKey(NOW), 3));
  });

  it("Hard: grows slowly and eases down", () => {
    let c = newCardState("c");
    c = reviewCard(c, "c", 1, NOW);
    expect(c.interval).toBe(1);
    c = reviewCard(c, "c", 1, NOW);
    expect(c.interval).toBe(1); // max(1, round(1*1.2)) = 1
    c = reviewCard(c, "c", 1, NOW);
    expect(c.interval).toBe(1);
    expect(c.ease).toBeCloseTo(2.05);
  });

  it("ease is clamped to [1.3, 2.8]", () => {
    let c = newCardState("c");
    for (let i = 0; i < 20; i++) c = reviewCard(c, "c", 0, NOW);
    expect(c.ease).toBe(MIN_EASE);
    let d = newCardState("d");
    for (let i = 0; i < 20; i++) d = reviewCard(d, "d", 3, NOW);
    expect(d.ease).toBe(MAX_EASE);
  });

  it("history is recorded and capped", () => {
    let c = newCardState("c");
    for (let i = 0; i < 60; i++) c = reviewCard(c, "c", 2, NOW);
    expect(c.history.length).toBe(50);
    expect(c.reps).toBe(60);
  });

  it("previewIntervals matches what reviewCard would do", () => {
    const c = reviewCard(newCardState("c"), "c", 2, NOW);
    const p = previewIntervals(c, "c", NOW);
    expect(p[0]).toBe(0);
    expect(p[2]).toBe(Math.max(1, Math.round(c.interval * c.ease)));
  });
});

describe("date helpers", () => {
  it("streak counts consecutive days ending today or yesterday", () => {
    const today = "2026-11-05";
    expect(currentStreak(["2026-11-05"], today)).toBe(1);
    expect(currentStreak(["2026-11-03", "2026-11-04", "2026-11-05"], today)).toBe(3);
    expect(currentStreak(["2026-11-04"], today)).toBe(1); // grace: keeps streak alive before today's session
    expect(currentStreak(["2026-11-03"], today)).toBe(0);
    expect(currentStreak([], today)).toBe(0);
  });

  it("isDue compares day strings correctly", () => {
    expect(isDue("2026-11-05", "2026-11-05")).toBe(true);
    expect(isDue("2026-11-04", "2026-11-05")).toBe(true);
    expect(isDue("2026-11-06", "2026-11-05")).toBe(false);
  });
});
