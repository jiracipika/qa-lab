/** Persistence + import/export round trips + invalid import errors. */

import { describe, expect, it } from "vitest";
import { defaultState } from "../src/types/state";
import { exportToString, makeExport, validateImport } from "../src/lib/io";
import { loadState, sanitizeState, saveState, STORAGE_KEY } from "../src/lib/storage";
import { reviewCard } from "../src/lib/srs";

function seededState() {
  const s = defaultState(new Date(2026, 10, 5));
  s.onboarded = true;
  s.preferences.goal = "automation";
  s.lessons["a-l1"] = { lessonId: "a-l1", completedAt: "2026-11-05T09:00:00.000Z" };
  s.cards["a-c1"] = reviewCard(undefined, "a-c1", 2, new Date(2026, 10, 5));
  s.quizAttempts.push({ questionId: "a-q1", moduleId: "mod-a", topic: "Fundamentals", chosen: ["b"], correct: true, at: "2026-11-05T09:10:00.000Z" });
  s.sandboxReports.push({
    id: "sr-1", at: "2026-11-05T09:20:00.000Z", title: "Transfer of exactly 10000 rejected", environment: "sandbox",
    preconditions: "logged in", steps: "1) open transfer 2) enter 10000.00 3) submit", expected: "accepted per S4",
    actual: "rejected", severity: "major", priority: "high", rationale: "boundary blocking large transfers", specRef: "S4", matchedDefectId: null,
  });
  return s;
}

describe("export/import round trip", () => {
  it("exports an envelope and re-imports identical progress", () => {
    const s = seededState();
    const text = exportToString(s);
    const result = validateImport(text);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data!.lessons["a-l1"].completedAt).toBe(s.lessons["a-l1"].completedAt);
    expect(result.data!.cards["a-c1"].interval).toBe(s.cards["a-c1"].interval);
    expect(result.data!.sandboxReports[0].title).toBe(s.sandboxReports[0].title);
    expect(result.data!.preferences.goal).toBe("automation");
  });

  it("rejects non-JSON with a useful error", () => {
    const r = validateImport("this is not json {");
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/Not valid JSON/);
  });

  it("rejects JSON that is not a QA Lab export", () => {
    const r = validateImport(JSON.stringify({ hello: "world" }));
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toMatch(/qa-lab/);
  });

  it("rejects a newer export version explicitly", () => {
    const env = { ...makeExport(seededState()), version: 99 };
    const r = validateImport(JSON.stringify(env));
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toMatch(/newer/);
  });

  it("rejects data without a data object", () => {
    const r = validateImport(JSON.stringify({ app: "qa-lab", version: 1, data: 42 }));
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toMatch(/data/);
  });
});

describe("localStorage persistence", () => {
  it("saves and loads state faithfully", () => {
    const s = seededState();
    expect(saveState(s)).toBe(true);
    const { state: loaded, recovered } = loadState();
    expect(recovered).toBe(false);
    expect(loaded.lessons["a-l1"]).toBeDefined();
    expect(loaded.cards["a-c1"].ease).toBe(s.cards["a-c1"].ease);
  });

  it("recovers gracefully from corrupt stored data", () => {
    localStorage.setItem(STORAGE_KEY, "{corrupt!!");
    const { state, recovered, error } = loadState();
    expect(recovered).toBe(true);
    expect(error).toBeTruthy();
    expect(state.lessons).toEqual({});
    // backup copy kept for manual recovery
    expect(Object.keys(localStorage).some((k) => k.startsWith("qa-lab:corrupt:"))).toBe(true);
  });

  it("sanitizes partial state objects without crashing", () => {
    const weird = sanitizeState({ version: 1, preferences: { theme: "dark" }, cards: "not-an-object", quizAttempts: "nope" });
    expect(weird.preferences.theme).toBe("dark");
    expect(weird.cards).toEqual({});
    expect(Array.isArray(weird.quizAttempts)).toBe(true);
    expect(weird.workspace.testCases).toEqual([]);
  });

  it("returns defaults when nothing is stored", () => {
    const { state } = loadState();
    expect(state.version).toBe(1);
    expect(state.quizSessions).toEqual([]);
  });
});
