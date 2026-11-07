/** Content registry: assembles the curriculum modules and exposes lookups. Content is data; UI imports from here only. */

import type { Goal, LearningModule } from "../types/content";
import { lessonsA } from "./moduleA";
import { lessonsB } from "./moduleB";
import { lessonsC } from "./moduleC";
import { lessonsD } from "./moduleD";
import { lessonsE } from "./moduleE";
import { cardsA, challengesA } from "./studyA";
import { cardsB, challengesB } from "./studyB";
import { cardsC, challengesC } from "./studyC";
import { cardsD, challengesD } from "./studyD";
import { cardsE, challengesE } from "./studyE";
import { quizA } from "./quizA";
import { quizB } from "./quizB";
import { quizC } from "./quizC";
import { quizD } from "./quizD";
import { quizE } from "./quizE";

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
  {
    id: "mod-d",
    letter: "D",
    title: "Defect management and QA documentation",
    subtitle: "The defect lifecycle, reports that get fixed, severity and triage, traceability with Jira and Xray, and metrics you can defend in an audit.",
    level: "intermediate",
    topics: ["Defect lifecycle", "Defect reporting", "Severity and priority", "Triage", "Traceability", "Xray", "Metrics", "Collaboration"],
    objectives: [
      "Drive a defect through the lifecycle correctly, from discovery to verified closure",
      "Write defect reports that developers can reproduce and act on first try",
      "Assign severity with rationale and keep it independent of priority",
      "Maintain requirement-to-test-to-run-to-defect traceability in Jira and Xray",
      "Report defect metrics honestly and recognise when numbers are being gamed",
    ],
    prereqIds: ["mod-a"],
    lessons: lessonsD,
    cards: cardsD,
    quiz: quizD,
    challenges: challengesD,
    recap: [
      "Status and resolution are different fields; Closed does not always mean Fixed.",
      "A report hands the fixer everything without a conversation: pattern title, minimal steps, cited expected, factual actual.",
      "Severity is impact; priority is scheduling - independent axes, argued with evidence at triage.",
      "The chain requirement -> test -> run -> defect is what audits and impact analysis read.",
      "DDP and escape rate are lagging indicators - report the split, watch for gaming, never score people.",
    ],
    minutes: 44,
  },
  {
    id: "mod-e",
    letter: "E",
    title: "API testing",
    subtitle: "HTTP and status codes, Postman and Bruno, JSON validation, authentication, boundary-driven API test design, and REST Assured automation.",
    level: "intermediate",
    topics: ["HTTP basics", "Status codes", "Postman", "Bruno", "Response validation", "Authentication", "API test design", "REST Assured"],
    objectives: [
      "Read HTTP requests and responses and classify status codes against the contract",
      "Test REST APIs with Postman or Bruno: collections, environments, and assertions",
      "Validate response bodies with paths, types, and JSON Schema",
      "Test the authentication matrix, including the IDOR boundary, without leaking secrets",
      "Design positive/negative/boundary API cases and automate them in REST Assured",
    ],
    prereqIds: ["mod-a"],
    lessons: lessonsE,
    cards: cardsE,
    quiz: quizE,
    challenges: challengesE,
    recap: [
      "2xx succeeded, 4xx the caller erred (often correctly), 5xx the server broke - report 5xx.",
      "Assert bodies, not just statuses: types matter (number, not string), and schemas catch shape drift.",
      "401 is identity, 403 is permission; the IDOR check is mandatory in banking.",
      "Every rule in the API doc is a test condition - boundaries included, error codes asserted.",
      "Stability is data hygiene: unique ids per run, no order dependence, honest timeouts.",
    ],
    minutes: 45,
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
  fundamentals: ["mod-a", "mod-b", "mod-c", "mod-d", "mod-e"],
  manual: ["mod-c", "mod-d", "mod-e", "mod-a", "mod-b"],
  istqb: ["mod-a", "mod-b", "mod-d", "mod-c", "mod-e"],
  automation: ["mod-e", "mod-c", "mod-b", "mod-d", "mod-a"],
  interview: ["mod-a", "mod-d", "mod-c", "mod-e", "mod-b"],
};
