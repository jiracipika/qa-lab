/** Quiz grading: stable option ids must survive display shuffling; multi-select needs exact sets. */

import { describe, expect, it } from "vitest";
import { gradeAnswer, topicBreakdown } from "../src/lib/grading";
import { shuffled } from "../src/lib/shuffle";
import { quizA } from "../src/content/quizA";
import type { QuizQuestion } from "../src/types/content";

const q: QuizQuestion = {
  id: "t-q1",
  moduleId: "mod-a",
  topic: "Test",
  stem: "Select the valid partition representatives",
  multi: true,
  options: [
    { id: "opt-a", text: "A" },
    { id: "opt-b", text: "B" },
    { id: "opt-c", text: "C" },
    { id: "opt-d", text: "D" },
  ],
  correct: ["opt-a", "opt-c"],
  why: "",
  distractors: {},
};

describe("gradeAnswer", () => {
  it("grades exact set match on multi-select", () => {
    expect(gradeAnswer(q, ["opt-a", "opt-c"])).toBe(true);
    expect(gradeAnswer(q, ["opt-c", "opt-a"])).toBe(true); // order-independent
    expect(gradeAnswer(q, ["opt-a"])).toBe(false); // partial: wrong
    expect(gradeAnswer(q, ["opt-a", "opt-b", "opt-c"])).toBe(false); // superset: wrong
    expect(gradeAnswer(q, [])).toBe(false); // empty never correct
  });

  it("ignores duplicate selections", () => {
    expect(gradeAnswer(q, ["opt-a", "opt-a", "opt-c"])).toBe(true);
  });

  it("is invariant under option display shuffling (grading uses ids, not positions)", () => {
    for (let seed = 1; seed <= 25; seed++) {
      const displayOrder = shuffled(q.options, seed);
      // Learner clicks the same logical choices regardless of displayed order:
      const chosen = displayOrder.filter((o) => ["opt-a", "opt-c"].includes(o.id)).map((o) => o.id);
      expect(gradeAnswer(q, chosen)).toBe(true);
      const wrong = displayOrder.filter((o) => ["opt-b", "opt-d"].includes(o.id)).map((o) => o.id);
      expect(gradeAnswer(q, wrong)).toBe(false);
    }
  });

  it("grades all single-select questions from quiz A by id", () => {
    const singles = quizA.filter((x) => !x.multi);
    expect(singles.length).toBeGreaterThan(10);
    for (const s of singles) {
      expect(gradeAnswer(s, s.correct)).toBe(true);
      for (const wrong of s.options.filter((o) => !s.correct.includes(o.id))) {
        expect(gradeAnswer(s, [wrong.id])).toBe(false);
      }
    }
  });
});

describe("topicBreakdown", () => {
  it("aggregates correct/total per topic over answered questions only", () => {
    const qs = quizA.slice(0, 4);
    const answers: Record<string, string[]> = {
      [qs[0].id]: qs[0].correct,
      [qs[1].id]: qs[1].options.filter((o) => !qs[1].correct.includes(o.id)).map((o) => o.id),
      // qs[2], qs[3] unanswered -> excluded
    };
    const b = topicBreakdown(qs, answers);
    const totals = Object.values(b).reduce((s, t) => s + t.total, 0);
    expect(totals).toBe(2);
    expect(Object.values(b).reduce((s, t) => s + t.correct, 0)).toBe(1);
  });
});
