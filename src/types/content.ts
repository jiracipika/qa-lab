/** Content model types. Educational content is data, validated at load and in tests. */

export type ID = string;

export interface CodeSample {
  lang: string;
  content: string;
  caption?: string;
}

export type LessonBlock =
  | { kind: "prose"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "definition"; term: string; text: string; glossaryId?: string }
  | { kind: "example"; title: string; text: string; code?: CodeSample }
  | { kind: "code"; code: CodeSample }
  | { kind: "diagram"; diagramId: string; note?: string }
  | { kind: "callout"; tone: "tip" | "mistake" | "note"; title: string; text: string };

export interface Lesson {
  id: ID;
  moduleId: ID;
  title: string;
  minutes: number;
  objectives: string[];
  blocks: LessonBlock[];
  commonMistakes: { mistake: string; fix: string }[];
  confusedWith?: { a: string; b: string; tell: string }[];
  recap: string[];
}

export type ConceptCardKind = "definition" | "compare" | "scenario" | "code-api";

export interface ConceptCard {
  id: ID;
  moduleId: ID;
  lessonId?: ID;
  topic: string;
  kind: ConceptCardKind;
  front: string;
  back: string;
  code?: CodeSample;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: ID;
  moduleId: ID;
  topic: string;
  stem: string;
  /** true = select-all-that-apply; grading requires the exact set of correct option ids. */
  multi: boolean;
  options: QuizOption[];
  correct: string[];
  why: string;
  /** option id -> why that distractor is wrong */
  distractors: Record<string, string>;
}

export type ChallengeKind =
  | "test-cases"
  | "missing-ac"
  | "boundaries"
  | "decision-table"
  | "states"
  | "defect-report"
  | "regression"
  | "api-response"
  | "assertions"
  | "flaky";

export interface Challenge {
  id: ID;
  moduleId: ID;
  title: string;
  kind: ChallengeKind;
  minutes: number;
  brief: string;
  context: string;
  code?: CodeSample;
  hints: string[];
  solution: string;
  rubric: string[];
}

export interface TestCaseCard {
  id: ID;
  moduleId: ID;
  title: string;
  requirement: string;
  preconditions: string[];
  testData: string[];
  steps: string[];
  expected: string;
  classification: "positive" | "negative" | "boundary";
  topic: string;
}

export interface LearningModule {
  id: ID;
  letter: string;
  title: string;
  subtitle: string;
  level: "foundation" | "intermediate";
  topics: string[];
  objectives: string[];
  prereqIds: ID[];
  lessons: Lesson[];
  cards: ConceptCard[];
  quiz: QuizQuestion[];
  challenges: Challenge[];
  recap: string[];
  minutes: number;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  short: string;
  text: string;
  moduleId?: ID;
  seeAlso?: string[];
}

export interface ComparisonPair {
  id: string;
  a: string;
  b: string;
  aText: string;
  bText: string;
  ruleOfThumb: string;
}

export interface InterviewCard {
  id: ID;
  category: string;
  question: string;
  structure: string[];
  sample: string;
  pitfalls: string[];
}

export interface RoadmapItem {
  id: ID;
  title: string;
  blurb: string;
  tracks: string[];
  tools: string[];
}

export type Goal = "fundamentals" | "manual" | "istqb" | "automation" | "interview";
