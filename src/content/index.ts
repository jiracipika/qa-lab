/** Content registry: assembles the three starter modules and exposes lookups. Content is data; UI imports from here only. */

import type { Goal, LearningModule } from "../types/content";
import { lessonsA } from "./moduleA";
import { lessonsB } from "./moduleB";
import { lessonsC } from "./moduleC";
import { cardsA, challengesA } from "./studyA";
import { cardsB, challengesB } from "./studyB";
import { cardsC, challengesC } from "./studyC";
import { quizA } from "./quizA";
import { quizB } from "./quizB";
import { quizC } from "./quizC";

export const CONTENT_NOTE =
  "Internal course material. Terminology aligned with the ISTQB Certified Tester Foundation Level (CTFL) v4.0 syllabus (v4.0.1); checked against istqb.org on 2026-11-05. All quiz questions and exercises are original practice material - not official certification exam questions - and this project claims no accreditation.";

export const modules: LearningModule[] = [
  {
    id: "mod-a",
    letter: "A",
    title: "Testing fundamentals",
    subtitle: "What testing is, defects and failures, the seven principles, the test process, and roles.",
    level: "foundation",
    topics: ["Fundamentals", "Defects", "Verification", "Static testing", "Principles", "Test process", "Roles"],
    objectives: [
      "Explain what testing can and cannot achieve",
      "Trace errors to defects to failures and write evidence-based defect reports",
      "Distinguish verification/validation and static/dynamic testing",
      "Apply the seven principles to prioritise effort",
      "Describe test activities, work products, and levels of tester independence",
    ],
    prereqIds: [],
    lessons: lessonsA,
    cards: cardsA,
    quiz: quizA,
    challenges: challengesA,
    recap: [
      "Testing produces information; it cannot prove absence of defects.",
      "Error -> defect -> possible failure: the chain behind every defect report.",
      "QA prevents (process), QC detects (product), testing is QC.",
      "Principles justify prioritisation: cluster effort, refresh suites, respect context.",
      "The test process loops: plan, analyse, design, implement, execute, complete.",
    ],
    minutes: 41,
  },
  {
    id: "mod-b",
    letter: "B",
    title: "Testing through development and delivery",
    subtitle: "Lifecycle models, test levels and types, regression, TDD/ATDD/BDD, CI/CD, and maintenance.",
    level: "foundation",
    topics: ["Lifecycle", "Test levels", "Test types", "Regression", "BDD", "Shift-left", "CI/CD", "Maintenance", "Retrospectives"],
    objectives: [
      "Adapt test approach to sequential, iterative, and continuous delivery",
      "Choose the right test level for a defect story",
      "Select regression scope with impact analysis",
      "Explain TDD, ATDD, BDD, and shift-left to a new joiner",
      "Describe pipeline quality gates and maintenance testing triggers",
    ],
    prereqIds: ["mod-a"],
    lessons: lessonsB,
    cards: cardsB,
    quiz: quizB,
    challenges: challengesB,
    recap: [
      "Every model contains testing; cadence and timing differ.",
      "Aim each check at the lowest level that can detect the defect.",
      "Confirmation proves the fix; regression protects everything else.",
      "BDD's value is the conversation, not the Gherkin file.",
      "Maintenance triggers: modifications, and migration/retirement.",
    ],
    minutes: 40,
  },
  {
    id: "mod-c",
    letter: "C",
    title: "Practical test design",
    subtitle: "Equivalence partitioning, boundaries, decision tables, state transitions, exploratory testing, and test cases that hold up.",
    level: "intermediate",
    topics: ["Equivalence partitioning", "Boundary value analysis", "Decision tables", "State transition", "Exploratory testing", "Test cases", "Traceability"],
    objectives: [
      "Partition inputs and attack boundaries with labelled technique choices",
      "Build and collapse decision tables; find unspecified combinations",
      "Model state machines and test invalid transitions",
      "Run disciplined exploratory sessions with charters and notes",
      "Write objective test cases with traceability",
    ],
    prereqIds: ["mod-a"],
    lessons: lessonsC,
    cards: cardsC,
    quiz: quizC,
    challenges: challengesC,
    recap: [
      "EP covers classes; BVA attacks edges; tables combine conditions; states test sequences.",
      "Unspecified combinations are findings, not guesses.",
      "Invalid transitions are where state defects hide.",
      "Charters + timeboxes + notes make exploration professional.",
      "Cases are contracts: state, input, observable outcome, traced to requirement.",
    ],
    minutes: 44,
  },
];

export const moduleById = (id: string): LearningModule | undefined => modules.find((m) => m.id === id);

export const lessonById = (id: string) => modules.flatMap((m) => m.lessons).find((l) => l.id === id);

export const quizQuestionById = (id: string) => modules.flatMap((m) => m.quiz).find((q) => q.id === id);

export const challengeById = (id: string) => modules.flatMap((m) => m.challenges).find((c) => c.id === id);

export const allConceptCards = modules.flatMap((m) => m.cards);

export const goalLabels: Record<Goal, string> = {
  fundamentals: "Learn QA fundamentals",
  manual: "Practise manual testing",
  istqb: "Prepare for ISTQB-style questions",
  automation: "Develop automation skills",
  interview: "Prepare for QA interviews",
};

/** Ordered module suggestions per goal; access to everything stays open. */
export const goalModuleOrder: Record<Goal, string[]> = {
  fundamentals: ["mod-a", "mod-b", "mod-c"],
  manual: ["mod-c", "mod-a", "mod-b"],
  istqb: ["mod-a", "mod-b", "mod-c"],
  automation: ["mod-c", "mod-b", "mod-a"],
  interview: ["mod-a", "mod-c", "mod-b"],
};
