import type { Lesson } from "../types/content";

export const lessonsB: Lesson[] = [
  {
    id: "b-l1",
    moduleId: "mod-b",
    title: "Development lifecycle models and how testing adapts",
    minutes: 6,
    objectives: [
      "Recognise sequential and iterative/agile models and where testing sits in each",
      "Explain what changes for testing when the lifecycle changes",
      "Avoid the 'testing is a phase at the end' mindset",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A lifecycle model describes how work flows from idea to production: sequential models (waterfall, V-model) hand off big phases; iterative and incremental models (spiral, agile, DevOps) loop small pieces through the whole pipeline. **Testing exists in every model** - what changes is when it happens, how often, and against what.",
      },
      {
        kind: "list",
        items: [
          "**Sequential (V-model)**: each development phase pairs with a test level; requirements stabilise early; regression is concentrated near the end.",
          "**Iterative/incremental (agile)**: every iteration delivers a slice; testers work within the sprint; regression runs constantly because the product keeps changing.",
          "**DevOps/continuous delivery**: every change flows through an automated pipeline; testing is code that gates each stage.",
        ],
      },
      {
        kind: "definition",
        term: "V-model",
        glossaryId: "v-model",
        text: "A sequential model where each development stage has a corresponding test level: acceptance testing mirrors user requirements, system testing mirrors the system specification, integration testing mirrors architecture, and unit testing mirrors detailed design.",
      },
      {
        kind: "example",
        title: "Same feature, two rhythms",
        text: "Banking core (sequential-ish): 'standing orders' specified for months, built, then system-tested for weeks against frozen requirements. Mobile app (agile): 'scheduled transfer' sliced into a 2-week story, demoed, and shipped behind a feature flag - tested continuously as each slice lands. The *techniques* (boundary analysis on dates and amounts) are identical; the *timing and cadence* differ.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "The question to ask on any team",
        text: "Not 'which model do we follow?' but 'how does work reach production, and where can information about quality enter that flow earliest?' Answer that, and your test approach designs itself.",
      },
    ],
    commonMistakes: [
      { mistake: "Thinking agile means no test planning.", fix: "Planning is lighter and continuous (charters, definition of done, automation strategy), not absent." },
      { mistake: "Treating the V-model as obsolete and therefore useless to know.", fix: "Regulated banking work often still maps evidence to V-model-style level pairings; the vocabulary survives." },
      { mistake: "Assuming the model on the slide matches reality.", fix: "Most teams are hybrids; observe the actual flow of a change before designing the approach." },
    ],
    confusedWith: [
      { a: "Sequential", b: "Iterative", tell: "Do requirements freeze before build starts (sequential), or evolve slice by slice (iterative)?" },
    ],
    recap: [
      "Every model contains testing; cadence and timing differ.",
      "V-model pairs development stages with test levels.",
      "Agile embeds testers in the iteration; DevOps automates the flow.",
    ],
  },
  {
    id: "b-l2",
    moduleId: "mod-b",
    title: "Test levels: from unit to acceptance",
    minutes: 7,
    objectives: [
      "Name the four main test levels and their focus and typical owner",
      "Explain how levels relate to the V-model",
      "Choose the right level for a given defect story",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Test levels group tests by *scope of the thing tested*. Each level answers a different question, has different stakeholders, and finds different defect types. Levels build on each other: fast, cheap failures at the bottom; slow, expensive, realistic failures at the top.",
      },
      { kind: "diagram", diagramId: "test-levels", note: "Click a level to see its focus, typical owner, example, and the defects it catches best." },
      {
        kind: "list",
        items: [
          "**Component (unit) testing** - one unit in isolation; developers; mocks for neighbours",
          "**Component integration testing** - interactions between units/interfaces; developers",
          "**System testing** - end-to-end behaviour of the whole system vs its specification; independent testers",
          "**System integration testing** - the system against external systems (payment schemes, credit bureaux)",
          "**Acceptance testing** - fitness for purpose; users/business; includes UAT, regulatory, and operational acceptance",
        ],
      },
      {
        kind: "definition",
        term: "Acceptance criteria",
        glossaryId: "acceptance-criteria",
        text: "The conditions a work product must satisfy to be accepted by a stakeholder. They anchor acceptance testing and should be testable, unambiguous, and agreed before development completes.",
      },
      {
        kind: "example",
        title: "One bug, four possible homes",
        text: "'Transfer confirmation email shows the wrong currency.' Isolated in the email formatter -> component test. Occurs only when the formatter is fed by the transfer service -> integration test. Reproducible through the UI on the full stack -> system test. Business noticed it violates an agreed acceptance criterion -> acceptance finding. Test *depth* should aim at the lowest level that can catch the defect.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "The test pyramid, sensibly read",
        text: "Prefer many fast unit tests, fewer integration tests, fewer still end-to-end tests. The pyramid is a heuristic about feedback speed and maintenance cost - not a law banning end-to-end coverage of critical money paths. In banking you will deliberately keep some heavyweight tests for exactly those paths.",
      },
    ],
    commonMistakes: [
      { mistake: "Calling everything 'UAT' that happens after system testing.", fix: "UAT is user-driven validation; operational and regulatory acceptance are distinct kinds." },
      { mistake: "Testing everything end-to-end through the UI 'because that's how users see it'.", fix: "Slow, brittle, expensive. Push checks down to the lowest level that can see the defect." },
      { mistake: "Skipping system-integration testing because 'the vendor tested their side'.", fix: "Interfaces fail at the seams: contracts, latency, data formats. Somebody must own the seam." },
    ],
    recap: [
      "Levels: component, component integration, system, system integration, acceptance.",
      "Each level has its own focus, owner, and defect profile.",
      "Aim tests at the lowest level that can detect the defect.",
    ],
  },
  {
    id: "b-l3",
    moduleId: "mod-b",
    title: "Test types; confirmation vs regression",
    minutes: 7,
    objectives: [
      "Distinguish functional and non-functional testing, black-box and white-box",
      "Define confirmation and regression testing and when each applies",
      "Reason about what 'enough regression' means for a change",
    ],
    blocks: [
      {
        kind: "prose",
        text: "While levels describe *scope*, types describe *what aspect* you examine. **Functional testing** checks what the system does (transfer money, reject bad input). **Non-functional** checks how well it does it: performance, usability, security, reliability. Independently, **black-box** testing derives tests from specifications and behaviour; **white-box** derives them from code structure. Both apply at every level.",
      },
      {
        kind: "definition",
        term: "Confirmation testing (retesting)",
        glossaryId: "confirmation-testing",
        text: "Re-running the specific tests that failed, to confirm a defect fix actually works. Focused on the change, executed on the fixed build.",
      },
      {
        kind: "definition",
        term: "Regression testing",
        glossaryId: "regression-testing",
        text: "Re-running existing tests on unchanged areas to detect side effects of a change. Its scope is everything the change could plausibly have broken, justified by traceability and risk.",
      },
      {
        kind: "example",
        title: "A fix is not done when the bug is fixed",
        text: "The rounding fix repairs the interest calculation (confirmation passes). But the fix touched a shared money-parsing utility used by statements and tax reports - regression must cover those consumers, or the fix ships new defects nobody looked for. Confirmation asks 'is the bug fixed?'; regression asks 'what else did the fix break?'",
      },
      {
        kind: "list",
        items: [
          "Functional: transfer limits, payee validation, statement contents",
          "Non-functional: 2-second P95 login, screen-reader operability, 10k concurrent sessions, encryption at rest",
          "Black-box: tests from the spec of the transfer screen, no code read",
          "White-box: tests from branch/statement coverage of the fee engine, code read first",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Impact analysis drives regression selection",
        text: "'Run all regression' is rarely affordable. Select by: components touched, shared dependencies, past defect clusters, and critical user paths. Document the selection rationale - reviewers and auditors will ask what you did *not* run and why.",
      },
    ],
    commonMistakes: [
      { mistake: "Using 'retest' and 'regression' interchangeably.", fix: "Retest targets the fixed defect; regression targets unaffected areas at risk from the change." },
      { mistake: "Treating non-functional testing as a phase after 'the testing'.", fix: "Performance and security are requirements like any other; design them into the plan from the start." },
      { mistake: "Assuming black-box means 'no technical knowledge needed'.", fix: "Black-box describes the *basis* of test derivation, not the skill of the tester." },
    ],
    confusedWith: [
      { a: "Confirmation testing", b: "Regression testing", tell: "Did the tests that failed before now pass (confirmation), or might the change have broken something elsewhere (regression)?" },
      { a: "Functional", b: "Non-functional", tell: "'What does it do' vs 'how well does it do it'." },
    ],
    recap: [
      "Types: functional/non-functional by aspect; black-box/white-box by derivation basis.",
      "Confirmation verifies the fix; regression verifies the rest of the world.",
      "Regression selection is impact analysis plus risk, documented.",
    ],
  },
  {
    id: "b-l4",
    moduleId: "mod-b",
    title: "TDD, ATDD, BDD, and shift-left",
    minutes: 7,
    objectives: [
      "Describe TDD, ATDD, and BDD and how they differ in practice",
      "Explain what shift-left means concretely for testers",
      "Read a Gherkin scenario critically as a test artifact",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Three development practices put testing *before* or *beside* the code. **TDD** (test-driven development): a developer writes a failing unit test, writes the simplest code that passes, refactors, repeats - red/green/refactor. **ATDD** (acceptance test-driven development): the team derives acceptance tests from criteria *before* implementation, so 'done' is objective. **BDD** (behaviour-driven development): business and team describe behaviour together in a shared, executable format (typically Gherkin: Given/When/Then) that becomes living documentation.",
      },
      {
        kind: "code",
        code: {
          lang: "gherkin",
          caption: "A Gherkin scenario for a transfer limit - note how data and expected outcome are explicit",
          content: `Feature: Daily transfer limit

  Scenario: Transfer exactly at the daily limit is allowed
    Given a customer with a daily remaining limit of 5000.00
    When they schedule a transfer of 5000.00 to payee "Landlord"
    Then the transfer is accepted
    And the remaining daily limit becomes 0.00

  Scenario: Transfer one cent above the daily limit is rejected
    Given a customer with a daily remaining limit of 5000.00
    When they schedule a transfer of 5000.01 to payee "Landlord"
    Then the transfer is rejected with "Daily limit exceeded"
    And the remaining daily limit stays 5000.00`,
        },
      },
      {
        kind: "definition",
        term: "Shift-left",
        glossaryId: "shift-left",
        text: "Moving test activities earlier in the lifecycle: reviewing requirements, writing acceptance tests before coding, static analysis in the IDE, unit tests in the same commit. The goal is finding defects where they are created - cheaply - not just before release.",
      },
      {
        kind: "example",
        title: "Tester value in a BDD team",
        text: "In refinement, a tester asks: '5000.00 allowed - is that per payee or per day across payees? What happens to a scheduled transfer that would exceed the limit tomorrow?' The scenario gets tightened *before* code exists. That conversation - not the Gherkin syntax - is where BDD pays off.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "BDD is not a tool",
        text: "Cucumber/SpecFlow files that developers write alone after coding are just slow unit tests. BDD's essence is the *three-way conversation* (business, development, testing) producing shared examples.",
      },
    ],
    commonMistakes: [
      { mistake: "Confusing TDD with 'writing tests first' as a ritual.", fix: "TDD is a design loop: tests drive simpler, testable code; the red step proves the test can fail." },
      { mistake: "Writing scenarios so abstract they cannot fail.", fix: "'Then the system behaves correctly' is unexecutable. Concrete data, concrete outcome." },
      { mistake: "Thinking shift-left removes the need for later-stage testing.", fix: "It moves *some* detection earlier; integration, system, and acceptance testing still examine what only the whole product can show." },
    ],
    confusedWith: [
      { a: "TDD", b: "BDD", tell: "Scope of the driving test: unit behaviour (developer) vs business behaviour (shared with the business)." },
      { a: "ATDD", b: "BDD", tell: "ATDD: tests derived from acceptance criteria pre-implementation. BDD: the collaborative language and workflow that produces such examples; in practice, heavy overlap." },
    ],
    recap: [
      "TDD: red/green/refactor unit loop; ATDD: acceptance tests before code; BDD: shared behaviour language.",
      "Shift-left = test activities earlier, especially reviews and testable requirements.",
      "Gherkin scenarios are only as good as the conversation behind them.",
    ],
  },
  {
    id: "b-l5",
    moduleId: "mod-b",
    title: "DevOps, CI/CD, and maintenance testing",
    minutes: 8,
    objectives: [
      "Describe a CI/CD pipeline's quality gates",
      "Explain maintenance testing and its two triggers",
      "Identify what testers automate versus what stays human",
    ],
    blocks: [
      {
        kind: "prose",
        text: "In continuous integration, every commit builds and runs automated checks; in continuous delivery, the resulting artifact flows through staged environments to (or near) production, with automated and human gates along the way. Testing becomes a mix of **fast code-level checks in the pipeline** and **human judgement about what to explore** at each stage.",
      },
      { kind: "diagram", diagramId: "ci-pipeline", note: "Click each pipeline stage to see its quality gates - what runs, what blocks, and who decides." },
      {
        kind: "list",
        items: [
          "**Unit + static analysis** - minutes; blocks commit/merge",
          "**Integration + API tests** - contract and interface behaviour",
          "**System/E2E smoke** - critical user journeys through a real environment",
          "**Non-functional gates** - performance budgets, security scans, accessibility checks",
          "**Human gates** - exploratory testing, UAT, change advisory review in regulated contexts",
        ],
      },
      {
        kind: "definition",
        term: "Maintenance testing",
        glossaryId: "maintenance-testing",
        text: "Testing triggered by change: **modifications** (new features, enhancements, fixes, patches) and **migration/retirement** (upgrades, data migration, decommissioning). It focuses on the impact of the change on everything connected to it - including regression after data migrations.",
      },
      { kind: "diagram", diagramId: "api-request-flow", note: "API testing lives throughout the pipeline. Click each stage of the request/response flow to see what a tester checks there." },
      {
        kind: "example",
        title: "Migration is a regression event",
        text: "A core-banking upgrade migrates 12 million accounts. Besides testing new features, the team must verify: totals reconcile old vs new (checksums), interest accruals continue correctly across the switch, and downstream reports still balance. The most dangerous defects in migrations are the silent ones - data that arrived slightly wrong.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "What to automate",
        text: "Automate deterministic, repetitive, high-value checks: boundaries, contracts, regression suites, data reconciliation. Keep humans on exploration, usability, risk judgement, and reviewing what automation cannot see. 'Automate everything' is how teams end up maintaining a museum of brittle scripts.",
      },
    ],
    commonMistakes: [
      { mistake: "Green pipeline interpreted as 'fully tested'.", fix: "The pipeline verifies what was encoded; exploration and judgement still happen around it." },
      { mistake: "Treating migration as an ops-only activity.", fix: "Data migration is a change like any other - reconciliation tests are test design work." },
      { mistake: "Letting flaky tests stay in the pipeline 'because they usually pass'.", fix: "A flaky gate destroys trust in every red. Quarantine, fix, or delete - fast." },
    ],
    recap: [
      "CI/CD moves checking into the pipeline; humans keep the judgement.",
      "Maintenance testing triggers: modifications and migration/retirement.",
      "Gates are only as honest as the tests inside them.",
    ],
  },
  {
    id: "b-l6",
    moduleId: "mod-b",
    title: "Retrospectives and continuous improvement",
    minutes: 5,
    objectives: [
      "Use retrospective data to improve the test process itself",
      "Turn defect patterns into preventive actions",
      "Define personal improvement actions that survive the next sprint",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Quality improvement is a loop: observe what happened, decide what to change, change it, observe again. Retrospectives close that loop for the *process*; defect analysis closes it for the *product*. Testers bring the most valuable raw material to both: where defects escaped, which tests found nothing, which checks were always red for the wrong reasons.",
      },
      {
        kind: "list",
        items: [
          "**Escaped-defect analysis**: for each production incident, which test level *could* have caught it, and why did it not?",
          "**Test suite health**: which cases last found a real defect; which are unrunnable, flaky, or duplicated",
          "**Cycle time**: how long from commit to test feedback; what lengthens it",
          "**Prevention actions**: clarify requirement templates, add review checklists, improve test data setup",
        ],
      },
      {
        kind: "example",
        title: "From incident to checklist in one retro",
        text: "A production defect slipped through because a boundary condition lived in a regulatory document, not the user story. The retro action: add a 'regulatory constraints' field to the story template and a checklist item in test analysis: 'which external rules constrain this story?' Two months later, the same class of escape is caught in refinement.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Make actions small and checkable",
        text: "'Improve communication' is not an action. 'Add a 10-minute boundary-review step to refinement for payment stories, review after three sprints' is. Improvement work deserves test criteria too.",
      },
    ],
    commonMistakes: [
      { mistake: "Retros without data: opinions only.", fix: "Bring escape counts, flake rates, cycle times - one number changes the tone of the discussion." },
      { mistake: "Actions aimed only at testing harder.", fix: "The cheapest fix is usually upstream: clearer requirements, better templates, review steps." },
      { mistake: "Never revisiting whether the action worked.", fix: "Re-open the action next retro with its own acceptance criterion." },
    ],
    recap: [
      "Retros improve the process; defect analysis improves the product.",
      "Escaped-defect analysis: which level could have caught it, and why did it not?",
      "Small, checkable actions beat vague resolutions.",
    ],
  },
];
