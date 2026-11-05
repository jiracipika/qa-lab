/** Content integrity: valid, non-duplicate content records meeting the curriculum contract. */

import { describe, expect, it } from "vitest";
import { modules, allConceptCards } from "../src/content";
import { glossary, comparisons } from "../src/content/glossary";
import { interviewCards, roadmap, testCaseCards } from "../src/content/interview";
import { diagrams } from "../src/diagrams/registry";
import { validateModules, validateTestCaseCards } from "../src/lib/contentValidation";

const REQ = { minLessons: 5, minCards: 10, minQuiz: 20, minChallenges: 2 };

describe("module content contract", () => {
  it("all modules pass validation (unique ids, complete options, distractor notes, counts, card mix)", () => {
    const issues = validateModules(modules, REQ);
    expect(issues).toEqual([]);
  });

  it("each starter module has >= 5 substantive lessons", () => {
    for (const m of modules) {
      expect(m.lessons.length).toBeGreaterThanOrEqual(5);
      for (const l of m.lessons) {
        expect(l.blocks.length).toBeGreaterThanOrEqual(4);
        expect(l.objectives.length).toBeGreaterThanOrEqual(3);
        expect(l.commonMistakes.length).toBeGreaterThanOrEqual(2);
        expect(l.recap.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("each module has >= 10 concept flashcards covering all four kinds", () => {
    for (const m of modules) {
      expect(m.cards.length).toBeGreaterThanOrEqual(10);
      const kinds = new Set(m.cards.map((c) => c.kind));
      expect(kinds.has("definition")).toBe(true);
      expect(kinds.has("compare")).toBe(true);
      expect(kinds.has("scenario")).toBe(true);
      expect(kinds.has("code-api")).toBe(true);
    }
  });

  it("each module has exactly 20 quiz questions with balanced multi/single mix", () => {
    for (const m of modules) {
      expect(m.quiz.length).toBe(20);
      const multi = m.quiz.filter((q) => q.multi).length;
      expect(multi).toBeGreaterThanOrEqual(2);
      expect(multi).toBeLessThanOrEqual(6);
    }
  });

  it("quiz questions are not near-duplicates (stems unique within module)", () => {
    for (const m of modules) {
      const stems = m.quiz.map((q) => q.stem.toLowerCase().replace(/[^a-z ]/g, ""));
      expect(new Set(stems).size).toBe(stems.length);
    }
  });

  it("every lesson diagram reference resolves to a registered diagram", () => {
    const ids = new Set(diagrams.map((d) => d.id));
    for (const m of modules) {
      for (const l of m.lessons) {
        for (const b of l.blocks) {
          if (b.kind === "diagram") expect(ids.has(b.diagramId)).toBe(true);
        }
      }
    }
  });

  it("every module has at least one lesson with an interactive visual", () => {
    for (const m of modules) {
      const hasDiagram = m.lessons.some((l) => l.blocks.some((b) => b.kind === "diagram"));
      expect(hasDiagram).toBe(true);
    }
  });

  it("covers all ten required challenge kinds across modules", () => {
    const kinds = new Set(modules.flatMap((m) => m.challenges.map((c) => c.kind)));
    for (const k of ["test-cases", "missing-ac", "boundaries", "decision-table", "states", "defect-report", "regression", "api-response", "assertions", "flaky"]) {
      expect(kinds.has(k as never)).toBe(true);
    }
  });
});

describe("reference content", () => {
  it("glossary ids are unique and referenced lesson terms resolve", () => {
    const ids = glossary.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of glossary) {
      for (const see of g.seeAlso ?? []) {
        expect(glossary.some((x) => x.id === see)).toBe(true);
      }
    }
  });

  it("comparison pairs are unique and non-empty", () => {
    expect(comparisons.length).toBeGreaterThanOrEqual(8);
    for (const c of comparisons) {
      expect(c.aText.length).toBeGreaterThan(10);
      expect(c.bText.length).toBeGreaterThan(10);
      expect(c.ruleOfThumb.length).toBeGreaterThan(10);
    }
  });

  it("interview cards have structures, samples, and pitfalls", () => {
    expect(interviewCards.length).toBeGreaterThanOrEqual(12);
    for (const c of interviewCards) {
      expect(c.structure.length).toBeGreaterThanOrEqual(3);
      expect(c.sample.length).toBeGreaterThan(60);
      expect(c.pitfalls.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("roadmap items are all labelled planned (no fake availability)", () => {
    expect(roadmap.length).toBeGreaterThanOrEqual(10);
  });

  it("test case cards validate", () => {
    expect(validateTestCaseCards(testCaseCards, modules)).toEqual([]);
    expect(testCaseCards.length).toBeGreaterThanOrEqual(9);
  });

  it("concept card lesson links resolve", () => {
    const lessonIds = new Set(modules.flatMap((m) => m.lessons.map((l) => l.id)));
    for (const c of allConceptCards) {
      if (c.lessonId) expect(lessonIds.has(c.lessonId)).toBe(true);
    }
  });
});
