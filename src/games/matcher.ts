/** Glossary Match engine: pure functions, unit-tested. ISTQB CTFL 4.0 term/definition pairs. */

export interface GlossaryPair {
  id: string;
  term: string;
  def: string;
}

/** 60 term/definition pairs covering fundamentals, principles, process, levels/types,
 *  techniques, and documentation. Wording follows the CTFL 4.0 syllabus and glossary. */
export const glossaryPairs: GlossaryPair[] = [
  { id: "g01", term: "Static testing", def: "A test approach in which the work product is examined without executing the code." },
  { id: "g02", term: "Dynamic testing", def: "A test approach in which the test item is executed to observe its behaviour." },
  { id: "g03", term: "Black-box testing", def: "A test approach based on the specification of a component or system, not its internals." },
  { id: "g04", term: "White-box testing", def: "A test approach based on the internal structure of a component or system." },
  { id: "g05", term: "Regression testing", def: "Change-related testing that detects whether defects have been introduced or uncovered in unchanged areas." },
  { id: "g06", term: "Confirmation testing", def: "Change-related testing run after a fix to confirm the failure caused by that defect no longer occurs." },
  { id: "g07", term: "Verification", def: "The process of confirming that a work product fulfills its specification." },
  { id: "g08", term: "Validation", def: "Confirmation by examination that a work product matches a stakeholder's needs." },
  { id: "g09", term: "Testing", def: "The process within the software development lifecycle that evaluates the quality of a component or system and related work products." },
  { id: "g10", term: "Debugging", def: "The process of finding, analyzing, and removing the causes of failures in a component or system." },
  { id: "g11", term: "Quality control", def: "Activities designed to evaluate the quality of a component or system." },
  { id: "g12", term: "Quality assurance", def: "Activities focused on providing confidence that quality requirements will be fulfilled." },
  { id: "g13", term: "Error", def: "A human action that results in a defect." },
  { id: "g14", term: "Defect", def: "An imperfection or deficiency in a work product where it does not meet its requirements or specifications or impairs its intended use." },
  { id: "g15", term: "Failure", def: "An event in which a component or system does not meet its requirements within specified limits during execution." },
  { id: "g16", term: "Principle: testing shows presence of defects", def: "Testing can show that defects are present, but can never prove that none remain." },
  { id: "g17", term: "Principle: exhaustive testing is impossible", def: "Testing everything is not feasible except in trivial cases, so effort is focused based on risk and priorities." },
  { id: "g18", term: "Principle: early testing saves time and money", def: "Defects removed early will not cause subsequent defects in derived work products." },
  { id: "g19", term: "Principle: defects cluster together", def: "A small number of components usually contain most of the discovered defects or cause most operational failures." },
  { id: "g20", term: "Principle: tests wear out (pesticide paradox)", def: "If the same tests are repeated many times, they become increasingly ineffective at finding new defects." },
  { id: "g21", term: "Principle: testing is context dependent", def: "There is no single universally applicable approach to testing; different contexts need different testing." },
  { id: "g22", term: "Principle: absence-of-defects fallacy", def: "Expecting verification to ensure success is a fallacy when the system does not fulfill user needs." },
  { id: "g23", term: "Test process", def: "The set of activities (planning, monitoring and control, analysis, design, implementation, execution, completion) performed to achieve test objectives." },
  { id: "g24", term: "Test monitoring", def: "The activity that checks the status of testing activities, identifies variances, and reports to stakeholders." },
  { id: "g25", term: "Test control", def: "The activity that develops and applies corrective actions to get a test project back on track when it deviates from its plan." },
  { id: "g26", term: "Test analysis", def: "The activity that identifies test conditions by analyzing the test basis." },
  { id: "g27", term: "Test design", def: "The activity that derives and specifies test cases from test conditions." },
  { id: "g28", term: "Test implementation", def: "The activity that prepares the testware needed for test execution." },
  { id: "g29", term: "Test execution", def: "The activity that runs a test on a component or system and produces actual results." },
  { id: "g30", term: "Test work products", def: "The artifacts created during testing (plans, cases, charts, logs) that support transparency and traceability." },
  { id: "g31", term: "Test manager", def: "The person responsible for managing test activities and resources, and for evaluating the test object." },
  { id: "g32", term: "Test analyst", def: "The person responsible for test analysis, design, implementation, and execution, focusing on the non-technical aspects." },
  { id: "g33", term: "Testing independence", def: "Separation of responsibilities, which encourages the accomplishment of objective testing." },
  { id: "g34", term: "Software development lifecycle model", def: "The activities performed at each phase in software development and how they relate logically and chronologically." },
  { id: "g35", term: "Test-driven development (TDD)", def: "A technique in which test cases are developed and automated first, then the software is developed incrementally to pass them." },
  { id: "g36", term: "Acceptance test-driven development (ATDD)", def: "A collaboration-based test-first approach that defines acceptance tests in the stakeholders' domain language." },
  { id: "g37", term: "Behaviour-driven development (BDD)", def: "A collaborative approach focused on delivering the expected behaviour of a component for the customer, forming the basis for testing." },
  { id: "g38", term: "DevOps", def: "An organizational approach that creates synergy by getting development and operations to work together." },
  { id: "g39", term: "Shift left", def: "A test approach in which testing and QA activities are performed as early as possible in the SDLC." },
  { id: "g40", term: "Shift right", def: "A test approach in which the system is tested continuously in production." },
  { id: "g41", term: "Retrospective", def: "A regular event in which team members discuss results, review practices, and identify ways to improve." },
  { id: "g42", term: "Test process improvement", def: "A program of activities undertaken to improve the performance and maturity of the organization's test processes." },
  { id: "g43", term: "Test level", def: "A specific instantiation of the test process organized around the goals of a stakeholder (component, integration, system, acceptance)." },
  { id: "g44", term: "Component testing", def: "The test level that focuses on individual hardware or software components." },
  { id: "g45", term: "System testing", def: "The test level that focuses on verifying that a system as a whole meets specified requirements." },
  { id: "g46", term: "Acceptance testing", def: "The test level that focuses on determining whether to accept the system." },
  { id: "g47", term: "Functional testing", def: "A test type that determines the functional suitability of a test object." },
  { id: "g48", term: "Non-functional testing", def: "A test type that evaluates compliance with non-functional requirements (performance, usability, and similar)." },
  { id: "g49", term: "Impact analysis", def: "The identification of all work products affected by a change, including estimates of the resources needed." },
  { id: "g50", term: "Inspection", def: "A type of formal review that uses defined team roles and measurement to identify defects." },
  { id: "g51", term: "Technical review", def: "A formal review by technical experts that examines the quality of a work product." },
  { id: "g52", term: "Walkthrough", def: "A formal review in which the author leads members through a work product and members ask questions and comment." },
  { id: "g53", term: "Equivalence partitioning", def: "A black-box technique in which test conditions are partitions, each exercised by one representative member." },
  { id: "g54", term: "Boundary value analysis", def: "A black-box technique in which test conditions are boundary values." },
  { id: "g55", term: "Decision table testing", def: "A black-box technique based on combinations of conditions and their resulting actions." },
  { id: "g56", term: "State transition testing", def: "A black-box technique in which test conditions are state transitions, or sequences of them." },
  { id: "g57", term: "Exploratory testing", def: "An approach in which tests are dynamically designed and executed based on the tester's knowledge and exploration." },
  { id: "g58", term: "Acceptance criteria", def: "The criteria that a work product must satisfy to be accepted by the stakeholders." },
  { id: "g59", term: "Test plan", def: "Documentation that describes the test objectives and the means and schedule for achieving them." },
  { id: "g60", term: "Defect management", def: "The process of recognizing, recording, classifying, investigating, fixing, and disposing of defects." },
];

export interface MatchRound {
  pairs: GlossaryPair[];
  /** Shuffled orders for the two columns (indexes into pairs). */
  termOrder: number[];
  defOrder: number[];
}

export function shuffle<T>(array: T[], rng: () => number = Math.random): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Draw up to `size` pairs from the pool without replacement (pure: returns the remainder). */
export function drawRound(pool: GlossaryPair[], size = 6, rng: () => number = Math.random): { round: MatchRound; remaining: GlossaryPair[] } {
  const shuffled = shuffle(pool, rng);
  const pairs = shuffled.slice(0, size);
  const remaining = shuffled.slice(size);
  return {
    round: {
      pairs,
      termOrder: shuffle(pairs.map((_, i) => i), rng),
      defOrder: shuffle(pairs.map((_, i) => i), rng),
    },
    remaining,
  };
}

/** Accuracy over the session so far: matched pairs vs wrong attempts. */
export function matchAccuracy(matched: number, wrong: number): number {
  const attempts = matched + wrong;
  return attempts === 0 ? 100 : Math.round((matched / attempts) * 100);
}

/* ---- Session persistence: the deck survives navigation and reloads ---- */

export interface MatcherSessionData {
  remainingIds: string[];
  roundPairIds: string[];
  termOrder: number[];
  defOrder: number[];
  matchedIds: string[];
  sessionMatched: number;
  sessionWrong: number;
  reshuffled: boolean;
}

export function toMatcherSession(
  round: MatchRound,
  remaining: GlossaryPair[],
  matchedIds: string[],
  sessionMatched: number,
  sessionWrong: number,
  reshuffled: boolean,
): MatcherSessionData {
  return {
    remainingIds: remaining.map((p) => p.id),
    roundPairIds: round.pairs.map((p) => p.id),
    termOrder: round.termOrder,
    defOrder: round.defOrder,
    matchedIds,
    sessionMatched,
    sessionWrong,
    reshuffled,
  };
}

/** Rehydrate a saved session. Returns null when the data does not map onto the
 *  current pair set (unknown ids, broken orders) so the caller can draw fresh. */
export function fromMatcherSession(data: MatcherSessionData | null | undefined): { round: MatchRound; remaining: GlossaryPair[] } | null {
  if (!data) return null;
  const byId = new Map(glossaryPairs.map((p) => [p.id, p]));
  const pairs = data.roundPairIds.map((id) => byId.get(id));
  const remaining = data.remainingIds.map((id) => byId.get(id));
  if (pairs.some((p) => !p) || remaining.some((p) => !p)) return null;
  const n = pairs.length;
  const isPerm = (arr: number[]) => Array.isArray(arr) && arr.length === n && new Set(arr).size === n && arr.every((v) => Number.isInteger(v) && v >= 0 && v < n);
  if (!isPerm(data.termOrder) || !isPerm(data.defOrder)) return null;
  if (!Array.isArray(data.matchedIds) || data.matchedIds.some((id) => !byId.has(id))) return null;
  return {
    round: { pairs: pairs as GlossaryPair[], termOrder: data.termOrder, defOrder: data.defOrder },
    remaining: remaining as GlossaryPair[],
  };
}
