/** Quiz grading. Evaluation uses stable option ids, so display shuffling cannot break grading. */

import type { QuizQuestion } from "../types/content";

export function gradeAnswer(question: QuizQuestion, chosen: string[]): boolean {
  if (chosen.length === 0) return false;
  const a = [...new Set(chosen)].sort().join("\u0001");
  const b = [...new Set(question.correct)].sort().join("\u0001");
  return a === b;
}

export function topicBreakdown(
  questions: QuizQuestion[],
  answers: Record<string, string[]>,
): Record<string, { correct: number; total: number }> {
  const out: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    if (!answers[q.id]) continue;
    out[q.topic] ??= { correct: 0, total: 0 };
    out[q.topic].total += 1;
    if (gradeAnswer(q, answers[q.id] ?? [])) out[q.topic].correct += 1;
  }
  return out;
}
