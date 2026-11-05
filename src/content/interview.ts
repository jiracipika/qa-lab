import type { InterviewCard, RoadmapItem, TestCaseCard } from "../types/content";

/** Interview practice cards with sample answer structures. Original content - practice, not a question bank from any employer. */
export const interviewCards: InterviewCard[] = [
  {
    id: "iv-1",
    category: "Fundamentals",
    question: "What is the difference between testing and QA?",
    structure: [
      "One-line core distinction",
      "Define each in a sentence",
      "Concrete example from your work",
      "How they interact (testing inside a QA framework)",
    ],
    sample:
      "Testing is evaluating a product to find defects and provide quality information - a quality-control activity. QA is the broader discipline of improving the process that prevents defects: standards, reviews, definition of done. In my current team, the regression suite is testing; moving defect-cluster findings into refinement checklists is QA.",
    pitfalls: [
      "Saying 'they are the same'",
      "Talking only about tools instead of the purpose distinction",
    ],
  },
  {
    id: "iv-2",
    category: "Fundamentals",
    question: "Explain the difference between an error, a defect, and a failure, with an example.",
    structure: [
      "Define each term crisply",
      "One concrete chained example",
      "Add the nuance: defect does not guarantee failure; failures can be environmental",
    ],
    sample:
      "An error is a human mistake - a developer misreading a rounding rule. It leaves a defect in the code - a wrong formula. When that code executes with triggering input, users see a failure - a wrong balance. A defect can sleep for years if the trigger is rare, like a leap-year path; and not every failure comes from a code defect - bad data or infrastructure can cause them too.",
    pitfalls: [
      "Using the three words interchangeably",
      "Claiming every defect causes a failure eventually",
    ],
  },
  {
    id: "iv-3",
    category: "Fundamentals",
    question: "Can you guarantee software is defect-free? How do you answer a stakeholder who asks for it?",
    structure: [
      "Direct answer: no - principle: presence, not absence; exhaustive impossible",
      "What you CAN offer: risk-based coverage, documented residual risk",
      "Concrete alternative proposal",
    ],
    sample:
      "No - testing shows the presence of defects, never their absence, and exhaustive testing is impossible even for one field. What I can give you is confidence with evidence: defined coverage of the highest-risk partitions and boundaries, exit criteria we agreed, and an explicit list of what we did not test and why. Then the release decision is informed instead of falsely certain.",
    pitfalls: [
      "Just saying 'impossible' without offering the alternative",
      "Confusing 'all tests pass' with 'defect-free'",
    ],
  },
  {
    id: "iv-4",
    category: "Test design",
    question: "How would you test a field that accepts an amount between 1 and 10,000 euros?",
    structure: [
      "Name the techniques: EP then BVA",
      "Give the actual values",
      "Add invalid-format and interaction checks",
      "Mention expected results and why values are chosen",
    ],
    sample:
      "I'd partition first: below 1, valid, above 10,000 - one representative each. Then boundary analysis on the edges: 0.99, 1.00, 1.01, mid like 5,000, 9,999.99, 10,000.00, 10,000.01 - inclusive bounds are where off-by-one defects live. Add format checks: letters, empty, negative, two-decimal precision, thousand separators. And I'd ask about interactions: does a daily limit or per-payee limit apply? Each new rule adds its own partitions and boundaries.",
    pitfalls: [
      "Listing random values without naming the technique",
      "Forgetting invalid classes and format-level negatives",
    ],
  },
  {
    id: "iv-5",
    category: "Test design",
    question: "What is the difference between regression testing and retesting?",
    structure: [
      "Define both in one sentence each",
      "Scope difference: the change vs everything affected",
      "Example, including how you select regression scope",
    ],
    sample:
      "Retesting (confirmation testing) re-runs the checks that failed, to prove the fix works - its scope is the defect. Regression testing checks that the change did not break anything else - its scope is selected by impact analysis: shared components, consumers of changed interfaces, past defect clusters, critical journeys. After a fix in a shared Money utility, I'd retest the reported case, then regress statements and tax reports that consume the utility.",
    pitfalls: [
      "Using them as synonyms",
      "Regression = 'run everything' without selection rationale",
    ],
  },
  {
    id: "iv-6",
    category: "Test design",
    question: "When would you use a decision table instead of boundary value analysis?",
    structure: [
      "When behaviour depends on input combinations",
      "BVA/EP for single-input rules",
      "Example with 2-3 conditions; mention collapsing and finding spec gaps",
    ],
    sample:
      "When the outcome depends on a combination of conditions - payee verified AND within limit AND before cutoff. Single-field rules get EP and BVA; combined rules get a decision table where each column is a rule and becomes a test. A bonus: building the table regularly exposes combinations the spec never addressed - those become requirements questions rather than guesses.",
    pitfalls: [
      "Choosing a table for a single numeric range",
      "Building a 1,024-column table without collapsing impossible combinations",
    ],
  },
  {
    id: "iv-7",
    category: "Automation",
    question: "Your automated suite is flaky. How do you approach it?",
    structure: [
      "Define flakiness; why it is toxic (trust erosion)",
      "Measure first: flake rate per test",
      "Common root causes: waits/races, locators, shared state, environment",
      "Process fix: quarantine, fix, prevent",
    ],
    sample:
      "First I measure - a flake dashboard tells me which of 2,000 tests actually flip; usually a handful. Then diagnosis: most flakiness is synchronisation (missing explicit waits around async UI), fragile locators like absolute XPath, shared mutable test data, or environment drift. I quarantine the offenders so the main signal stays trustworthy, fix root causes - stable selectors, precise waits, isolated data - and add CI checks like retry-budget alerts so new flake gets caught before it spreads. Retrying blindly is the one thing I would not do: it hides both flake and real intermittent product defects.",
    pitfalls: [
      "Jumping to Thread.sleep or blind retries",
      "Not measuring - 'it feels flaky' is not a plan",
    ],
  },
  {
    id: "iv-8",
    category: "Automation",
    question: "What do you automate first on a new project?",
    structure: [
      "Selection criteria: risk x repetition x stability",
      "Start: critical-path smoke + highest-value regression",
      "Infrastructure first: deterministic environment and data",
      "What you deliberately do NOT automate",
    ],
    sample:
      "I look for high risk times high repetition times stable behaviour. Typically: a thin end-to-end smoke over the critical money paths (login, transfer, statement), plus API-level checks for the core contracts - APIs are cheaper to maintain than UI. Before cases, though, infrastructure: deterministic test data and environments, or every test inherits flakiness. I would not automate exploratory checks, one-off verification, or volatile UI cosmetics - automation should run things a machine is better at, repeatedly.",
    pitfalls: [
      "'Everything' as the answer",
      "Starting with UI when an API layer gives the same confidence cheaper",
    ],
  },
  {
    id: "iv-9",
    category: "Process",
    question: "A release is tomorrow and testing is not done. What do you do?",
    structure: [
      "Communicate early with facts, not apologies",
      "Quantify: done vs remaining, by risk",
      "Propose options: scope reduction, delayed release, accepted risk with sign-off",
      "Your recommendation with reasoning",
    ],
    sample:
      "I escalate today with numbers: 80% of critical cases pass, remaining scope is X, the two open defects are severity-1 on transfer confirmation. Then options: ship with the feature-flag off, delay 48 hours, or release with documented residual risk and business sign-off. My recommendation would depend on the risk: for a money path defect, flag it off and ship the rest. What I avoid is silently cutting scope - stakeholders must decide with eyes open.",
    pitfalls: [
      "Heroic all-nighter as the plan",
      "Saying 'it will be done' without evidence",
    ],
  },
  {
    id: "iv-10",
    category: "Process",
    question: "How do you decide when a defect is worth fixing now versus later?",
    structure: [
      "Frame severity vs priority",
      "Inputs: user impact, frequency, workaround, regulatory exposure, release context",
      "Who decides: tester proposes, product owns priority",
    ],
    sample:
      "Severity describes impact - I assess that technically. Priority is a business call I inform: frequency, workaround existence, visibility, regulatory exposure, and the release. A cosmetic typo on the homepage before launch can be low severity and high priority; a deep-log truncation can be high severity and low priority if rare and invisible. I file both with rationale so the trade-off is explicit, and in banking I add one more axis: does it affect reconciliation or customer money? If yes, the bar for 'later' rises sharply.",
    pitfalls: [
      "Asserting priority as if it were a technical fact",
      "Ignoring workarounds and frequency",
    ],
  },
  {
    id: "iv-11",
    category: "Banking QA",
    question: "What is different about testing in banking compared to other domains?",
    structure: [
      "Consequences: money movement, reversibility, trust",
      "Regulation and auditability: evidence trails",
      "Interfaces: legacy cores, schemes, cut-off times",
      "Data: privacy, synthetic data needs",
    ],
    sample:
      "Three things stand out. Consequences: incorrect money movement is hard to reverse and erodes trust instantly, so reconciliation and double-entry consistency get their own test designs - not just feature checks. Auditability: in regulated environments, testing must be evidenced - traceability from requirement to result, sign-offs, tools like Jira/Xray holding that story. And integration reality: legacy cores, payment schemes, batch cut-off times, and timezone rules create boundary and state conditions you simply don't meet in a web shop. Plus strict data rules push you towards well-designed synthetic test data.",
    pitfalls: [
      "Answering only 'more testing'",
      "Not mentioning evidence/audit or reconciliation",
    ],
  },
  {
    id: "iv-12",
    category: "Behavioural",
    question: "Tell me about a defect you missed that reached production. What did you do?",
    structure: [
      "Pick a real, bounded example",
      "Facts: what escaped, impact, how it was found",
      "Honest root cause: coverage gap? data? prioritisation?",
      "Systemic fix you drove afterwards",
    ],
    sample:
      "A rounding defect in statement exports: we tested displayed balances but not the exported CSV, which used a different formatting path - the value was truncated one cent for .005 cases. A customer's reconciliation caught it. My root cause was a coverage gap: our conditions tracked 'statement displayed', not 'statement exported'. I added export-format conditions to the suite, and more usefully, added 'which output channels consume this value?' as a standing question in our analysis checklist. It also changed how I test shared formatters: every consumer gets a case.",
    pitfalls: [
      "Blaming others or 'no time'",
      "Choosing a fake example with no learning",
      "Ending at the fix without the prevention step",
    ],
  },
];

/** Roadmap of modules that are planned but NOT yet implemented. Honest availability labels. */
export const roadmap: RoadmapItem[] = [
  {
    id: "rm-defects",
    title: "Defect management and QA documentation",
    blurb: "Defect lifecycle depth, severity/priority matrices, Jira workflow design, Confluence test documentation, Xray test management, audit-ready evidence.",
    tracks: ["Manual testing", "ISTQB-style prep"],
    tools: ["Jira", "Confluence", "Xray"],
  },
  {
    id: "rm-api",
    title: "API testing",
    blurb: "REST fundamentals, status codes and contracts, JSON schema validation, auth, negative API testing, mocking, contract testing between services.",
    tracks: ["Automation", "Manual testing"],
    tools: ["Postman", "Bruno", "REST Assured"],
  },
  {
    id: "rm-sql",
    title: "SQL and database testing",
    blurb: "SELECT to window functions, joins for reconciliation, data integrity constraints, migration verification, test data design with synthetic data.",
    tracks: ["Automation", "Banking QA"],
    tools: ["SQL", "PostgreSQL"],
  },
  {
    id: "rm-java",
    title: "Java testing with JUnit and TestNG",
    blurb: "Assertions, parameterised tests, test lifecycle, suites and groups, parallel execution, mocking with Mockito, reporting.",
    tracks: ["Automation"],
    tools: ["Java", "JUnit 5", "TestNG", "Mockito"],
  },
  {
    id: "rm-selenium",
    title: "Selenium and Playwright",
    blurb: "Locator strategy, synchronisation patterns, page object architecture, cross-browser, Playwright's auto-waiting and traces, CI integration.",
    tracks: ["Automation"],
    tools: ["Selenium", "Playwright"],
  },
  {
    id: "rm-rest-assured",
    title: "REST Assured, Postman, and Bruno",
    blurb: "Request specification reuse, JSON path and schema assertions, auth flows, collections and environments, CI runs, comparison of tools.",
    tracks: ["Automation", "Interview prep"],
    tools: ["REST Assured", "Postman", "Bruno"],
  },
  {
    id: "rm-perf",
    title: "Performance, accessibility, and security fundamentals",
    blurb: "Load/stress/soak concepts, performance budgets and metrics (P95, throughput), accessibility testing (WCAG basics, axe, keyboard/screen reader), security testing basics for testers (OWASP top 10 awareness).",
    tracks: ["Manual testing", "Automation", "Banking QA"],
    tools: ["k6", "axe", "OWASP ZAP"],
  },
  {
    id: "rm-ai",
    title: "Testing AI-driven applications",
    blurb: "Non-determinism and oracles for AI features, evaluation datasets, prompt and RAG testing, guarding against drift, human-in-the-loop checks.",
    tracks: ["Automation", "Fundamentals"],
    tools: ["Evaluation harnesses"],
  },
  {
    id: "rm-banking",
    title: "Banking QA scenarios",
    blurb: "Payments (SEPA/SWIFT concepts), cut-off times, reconciliation, regulatory reporting, authentication journeys, batch processing test design.",
    tracks: ["Banking QA", "Interview prep"],
    tools: [],
  },
  {
    id: "rm-interview",
    title: "Interview preparation",
    blurb: "Expanded question bank by seniority, live test-design exercises with rubrics, automation code review practice, salary and role-scope negotiation.",
    tracks: ["Interview prep"],
    tools: [],
  },
];

/** Test-case cards: requirement -> structured manual test execution, tracked separately from concept recall. */
export const testCaseCards: TestCaseCard[] = [
  {
    id: "tc-1",
    moduleId: "mod-a",
    title: "Transfer within daily limit is accepted",
    requirement: "REQ-TR-01: A customer may transfer up to 5,000.00 per day. Transfers at or below the remaining limit are accepted.",
    preconditions: ["Customer logged in", "Daily remaining limit 5,000.00", "Source balance 6,000.00", "Payee 'Landlord' exists"],
    testData: ["Amount: 250.00", "Currency: EUR"],
    steps: [
      "Open the transfer form",
      "Select payee 'Landlord'",
      "Enter amount 250.00 and submit",
      "Open the confirmation screen",
      "Open transaction history",
    ],
    expected: "Confirmation shows 250.00 to Landlord; history shows a 250.00 debit; remaining daily limit becomes 4,750.00.",
    classification: "positive",
    topic: "Test process",
  },
  {
    id: "tc-2",
    moduleId: "mod-a",
    title: "Transfer above daily limit is rejected",
    requirement: "REQ-TR-01: Transfers above the remaining daily limit are rejected with message DAILY_LIMIT_EXCEEDED and no debit occurs.",
    preconditions: ["Customer logged in", "Daily remaining limit 100.00", "Source balance 6,000.00"],
    testData: ["Amount: 100.01 (one cent above remaining limit)"],
    steps: ["Open the transfer form", "Enter amount 100.01", "Submit the transfer", "Check transaction history"],
    expected: "Transfer rejected with DAILY_LIMIT_EXCEEDED; no debit entry; remaining limit unchanged at 100.00.",
    classification: "boundary",
    topic: "Test process",
  },
  {
    id: "tc-3",
    moduleId: "mod-a",
    title: "Payee nickname over 30 characters is rejected",
    requirement: "REQ-PY-03: Payee nickname is 1-30 characters. Longer values are rejected with a field-level message.",
    preconditions: ["Customer logged in", "Add-payee form open"],
    testData: ["Nickname of exactly 31 characters"],
    steps: ["Enter a valid name and account number", "Enter a 31-character nickname", "Attempt to save"],
    expected: "Save blocked; message 'Nickname must be 30 characters or fewer'; no payee created.",
    classification: "negative",
    topic: "Test process",
  },
  {
    id: "tc-4",
    moduleId: "mod-b",
    title: "Blocked card purchase is declined in every state",
    requirement: "REQ-CD-02: Transactions on a blocked card are declined with CARD_BLOCKED regardless of balance.",
    preconditions: ["Card is blocked", "Account has sufficient balance"],
    testData: ["Any purchase amount, e.g. 10.00"],
    steps: ["Attempt a purchase with the blocked card", "Check the decline reason in the app", "Check the authorisation log"],
    expected: "Purchase declined with CARD_BLOCKED; balance unchanged; decline reason recorded; no overdraft path evaluated.",
    classification: "negative",
    topic: "Regression",
  },
  {
    id: "tc-5",
    moduleId: "mod-b",
    title: "Statement export after Money.parse fix matches displayed values",
    requirement: "REQ-ST-04: Exported statement values equal displayed values for the same period, after the four-decimal rounding fix.",
    preconditions: ["Account has transactions with values that round differently under truncation (e.g. .005 cases)", "Fix deployed to test environment"],
    testData: ["Period: current month"],
    steps: ["Open the statement view and note displayed totals", "Export the statement as CSV", "Compare CSV values and totals with displayed values"],
    expected: "Every exported value equals its displayed counterpart; totals reconcile exactly; no one-cent divergences.",
    classification: "positive",
    topic: "Regression",
  },
  {
    id: "tc-6",
    moduleId: "mod-b",
    title: "Migration reconciliation: totals match old system",
    requirement: "REQ-MIG-01: After account migration, record counts and balance checksums must match the source system exactly.",
    preconditions: ["Migration completed to staging", "Source and target extracts available"],
    testData: ["Full account extract, both systems"],
    steps: ["Run record-count comparison", "Run sum-of-balances checksum per account type", "Extract all mismatched rows and classify"],
    expected: "Counts equal; checksums equal per account type; any mismatch list is empty or explained (e.g., known decimal-precision notes).",
    classification: "boundary",
    topic: "Maintenance",
  },
  {
    id: "tc-7",
    moduleId: "mod-c",
    title: "Top-up count boundary: fourth daily top-up is rejected",
    requirement: "REQ-TC-01: Up to 3 top-ups per day; the 4th is rejected with TOPUP_LIMIT_REACHED.",
    preconditions: ["Prepaid card active", "No top-ups yet today"],
    testData: ["Amounts: 10.00 x 4"],
    steps: ["Make three 10.00 top-ups (each should succeed)", "Attempt a fourth top-up", "Check the card balance"],
    expected: "Top-ups 1-3 succeed; the 4th is rejected with TOPUP_LIMIT_REACHED; balance is 30.00.",
    classification: "boundary",
    topic: "Boundary value analysis",
  },
  {
    id: "tc-8",
    moduleId: "mod-c",
    title: "Card state: purchase on frozen card is declined",
    requirement: "REQ-CD-05: Purchases on a frozen card are declined with CARD_FROZEN; unfreezing restores purchases.",
    preconditions: ["Card active", "Sufficient balance"],
    testData: ["Purchase amount 20.00"],
    steps: ["Freeze the card", "Attempt a purchase", "Verify decline reason", "Unfreeze the card", "Attempt the purchase again"],
    expected: "Purchase during FROZEN declined with CARD_FROZEN and no balance change; after unfreezing, the same purchase succeeds.",
    classification: "negative",
    topic: "State transition",
  },
  {
    id: "tc-9",
    moduleId: "mod-c",
    title: "Decision table rule: unverified payee rejects even within limit",
    requirement: "REQ-TR-07: Transfers to unverified payees are rejected with PAYEE_UNVERIFIED even when the amount is within limits.",
    preconditions: ["Payee exists in state unverified", "Amount within daily limit"],
    testData: ["Amount: 100.00"],
    steps: ["Open transfer form", "Select the unverified payee", "Submit 100.00", "Check history"],
    expected: "Rejected with PAYEE_UNVERIFIED; no debit; the limit message must NOT be shown (blocked-payee rule has precedence).",
    classification: "negative",
    topic: "Decision tables",
  },
];
