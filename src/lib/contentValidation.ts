/** Static validation of content records. Run in tests; surfaced in the app under Roadmap -> content health. */

import type { ConceptCard, LearningModule, TestCaseCard } from "../types/content";

export interface ContentIssue {
  scope: string;
  message: string;
}

export function validateModules(
  modules: LearningModule[],
  opts: { minLessons: number; minCards: number; minQuiz: number; minChallenges: number },
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const seen = new Set<string>();
  const claim = (id: string, scope: string) => {
    if (!id) issues.push({ scope, message: "empty id" });
    if (seen.has(id)) issues.push({ scope, message: `duplicate id "${id}"` });
    seen.add(id);
  };

  for (const m of modules) {
    claim(m.id, `module ${m.id}`);
    if (m.lessons.length < opts.minLessons) issues.push({ scope: m.id, message: `only ${m.lessons.length} lessons (need ${opts.minLessons})` });
    if (m.cards.length < opts.minCards) issues.push({ scope: m.id, message: `only ${m.cards.length} cards (need ${opts.minCards})` });
    if (m.quiz.length < opts.minQuiz) issues.push({ scope: m.id, message: `only ${m.quiz.length} quiz questions (need ${opts.minQuiz})` });
    if (m.challenges.length < opts.minChallenges) issues.push({ scope: m.id, message: `only ${m.challenges.length} challenges (need ${opts.minChallenges})` });
    if (m.lessons.length === 0) continue;

    const lessonIds = new Set(m.lessons.map((l) => l.id));
    for (const l of m.lessons) {
      claim(l.id, `module ${m.id}`);
      if (l.moduleId !== m.id) issues.push({ scope: l.id, message: `lesson moduleId ${l.moduleId} != ${m.id}` });
      if (l.blocks.length === 0) issues.push({ scope: l.id, message: "lesson has no content blocks" });
    }
    for (const c of m.cards) {
      claim(c.id, `module ${m.id} cards`);
      validateCard(c, m.id, lessonIds, issues);
    }
    for (const q of m.quiz) {
      claim(q.id, `module ${m.id} quiz`);
      const optionIds = new Set<string>();
      for (const o of q.options) {
        if (optionIds.has(o.id)) issues.push({ scope: q.id, message: `duplicate option id "${o.id}"` });
        optionIds.add(o.id);
      }
      if (q.correct.length === 0) issues.push({ scope: q.id, message: "no correct options" });
      if (q.multi && q.correct.length < 2) issues.push({ scope: q.id, message: "multi-select with <2 correct options" });
      if (!q.multi && q.correct.length !== 1) issues.push({ scope: q.id, message: "single-select with !=1 correct option" });
      for (const c of q.correct) {
        if (!optionIds.has(c)) issues.push({ scope: q.id, message: `correct option "${c}" not in options` });
      }
      for (const o of q.options) {
        const isCorrect = q.correct.includes(o.id);
        const hasNote = q.distractors[o.id] !== undefined;
        if (!isCorrect && !hasNote) issues.push({ scope: q.id, message: `distractor "${o.id}" has no explanation` });
        if (isCorrect && hasNote) issues.push({ scope: q.id, message: `correct option "${o.id}" listed in distractors` });
      }
      if (q.options.length < 3) issues.push({ scope: q.id, message: "fewer than 3 options" });
    }
    for (const ch of m.challenges) {
      claim(ch.id, `module ${m.id} challenges`);
      if (ch.hints.length < 2) issues.push({ scope: ch.id, message: "fewer than 2 hints" });
      if (ch.rubric.length < 3) issues.push({ scope: ch.id, message: "fewer than 3 rubric items" });
      if (!ch.solution || ch.solution.length < 50) issues.push({ scope: ch.id, message: "solution too thin" });
    }
    const cardKinds = new Set(m.cards.map((c) => c.kind));
    for (const kind of ["definition", "compare", "scenario", "code-api"] as const) {
      if (!cardKinds.has(kind)) issues.push({ scope: m.id, message: `card mix missing kind "${kind}"` });
    }
  }
  for (const m of modules) {
    for (const p of m.prereqIds) {
      if (!modules.some((x) => x.id === p)) issues.push({ scope: m.id, message: `unknown prerequisite module "${p}"` });
    }
  }
  return issues;
}

function validateCard(c: ConceptCard, moduleId: string, lessonIds: Set<string>, issues: ContentIssue[]): void {
  if (c.moduleId !== moduleId) issues.push({ scope: c.id, message: `card moduleId mismatch` });
  if (c.lessonId && !lessonIds.has(c.lessonId)) issues.push({ scope: c.id, message: `unknown lessonId ${c.lessonId}` });
  if (!c.front || !c.back) issues.push({ scope: c.id, message: "empty front/back" });
}

export function validateTestCaseCards(cards: TestCaseCard[], modules: LearningModule[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const moduleIds = new Set(modules.map((m) => m.id));
  for (const t of cards) {
    if (!moduleIds.has(t.moduleId)) issues.push({ scope: t.id, message: `unknown moduleId ${t.moduleId}` });
    if (t.steps.length === 0) issues.push({ scope: t.id, message: "no steps" });
    if (!t.expected) issues.push({ scope: t.id, message: "no expected result" });
    if (!["positive", "negative", "boundary"].includes(t.classification)) {
      issues.push({ scope: t.id, message: `bad classification ${t.classification}` });
    }
  }
  return issues;
}
