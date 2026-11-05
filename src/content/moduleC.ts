import type { Lesson } from "../types/content";

export const lessonsC: Lesson[] = [
  {
    id: "c-l1",
    moduleId: "mod-c",
    title: "Equivalence partitioning",
    minutes: 7,
    objectives: [
      "Define equivalence partitioning and identify partitions from a rule",
      "Choose representative values with a stated rationale",
      "Explain the coverage claim - and its limits - to a reviewer",
    ],
    blocks: [
      {
        kind: "prose",
        text: "If two inputs are handled the same way by the same rule, one of them is redundant. **Equivalence partitioning (EP)** divides the input domain into classes where all members should be treated identically, then takes *one representative per partition* - drastically fewer tests than input-by-input testing, with a reasoned coverage story.",
      },
      {
        kind: "definition",
        term: "Equivalence partition",
        glossaryId: "equivalence-partitioning",
        text: "A set of input values that the specification says are handled the same way. For 'amount must be 1.00-10,000.00': valid partition [1.00, 10,000.00], invalid below (< 1.00), invalid above (> 10,000.00).",
      },
      {
        kind: "example",
        title: "Transfer amount: three partitions, three tests",
        text: "Rule: transfers accept 1.00 to 10,000.00 inclusive. Partitions: (a) amount < 1.00 - reject, (b) 1.00 <= amount <= 10,000.00 - accept, (c) amount > 10,000.00 - reject. Representative values: 0.99 / 250.00 / 10,000.01. Testing 250.00, 250.01, 999.99 inside (b) adds nothing *by this rule* - they are the same class. If another rule (fees) applies inside that range, that is a new analysis with new partitions.",
      },
      {
        kind: "list",
        items: [
          "Partitions come from rules in the spec - each rule boundary suggests valid and invalid classes",
          "Take one representative from each partition; prefer values that are easy to recognise in results",
          "Invalid partitions are usually tested one at a time so each rejection is attributable",
          "Also partition outputs, states, and time (e.g., business day vs weekend)",
        ],
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "EP's coverage claim is modest",
        text: "EP covers *rule classes*, not every value. A defect that lives inside a valid partition (only amount 123.45 breaks) is not guaranteed to be caught by representative 250.00. Pair EP with boundary analysis (next lesson) and risk-based additions where money is involved.",
      },
    ],
    commonMistakes: [
      { mistake: "Picking boundary values while calling it EP.", fix: "EP uses *any* representative of a class; boundary values are a distinct technique on top." },
      { mistake: "Only finding valid partitions.", fix: "Every rule with a valid range implies at least two invalid classes. Rejection behaviour is a requirement too." },
      { mistake: "Combining all invalid inputs in one test.", fix: "One invalid partition per test, or you cannot tell which rejection fired." },
    ],
    recap: [
      "Same handling = same partition; one representative each.",
      "Each rule yields valid and invalid partitions.",
      "EP reduces count with a rationale; pair with BVA for edges.",
    ],
  },
  {
    id: "c-l2",
    moduleId: "mod-c",
    title: "Boundary value analysis",
    minutes: 7,
    objectives: [
      "Explain why defects cluster at boundaries",
      "Derive 2-point and 3-point boundary values from a rule",
      "Document boundary tests so a reviewer can verify completeness",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Defects love edges: off-by-one comparisons (`<` vs `<=`), inclusive/exclusive confusion, rounding at limits, first/last element of loops. **Boundary value analysis (BVA)** targets exactly those edges: the values at and beside each partition boundary, where 'the same handling' is most likely to break.",
      },
      {
        kind: "definition",
        term: "Boundary value analysis",
        glossaryId: "boundary-value-analysis",
        text: "A technique that selects test values at, just inside, and just outside the boundaries of an equivalence partition. 2-point BVA takes the boundary and its nearest neighbour inside/outside per edge; 3-point BVA takes min, min+, and max- (interior) plus max; robust variants add invalid neighbours outside.",
      },
      { kind: "diagram", diagramId: "boundary-values", note: "Click the number line regions to see which technique (2-point, 3-point, robust) each value belongs to." },
      {
        kind: "example",
        title: "Daily limit 5,000.00 - the boundary set",
        text: "Rule: 0.01 <= amount <= 5,000.00 per day. 3-point set: 0.01 (min), 0.02 (min+), 2,500.00 (mid), 4,999.99 (max-), 5,000.00 (max). Robust adds 0.00 and 5,000.01 - the invalid neighbours that catch off-by-one comparisons. In money systems, test both decimals (0.01 steps) and, where the spec allows, integer-only fields (1, 5000, 5001).",
      },
      {
        kind: "list",
        items: [
          "Boundaries exist beyond numbers: first/last item of a list, empty list, 31 January vs 1 February, midnight, 29 February",
          "State the technique you used and why - reviewers and auditors check reasoning, not just counts",
          "For decimal fields, the smallest step (0.01) defines 'just inside/outside'",
          "Watch for boundaries created by *other* rules (daily vs per-transaction limits) - each rule contributes its own edges",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Interview-grade answer",
        text: "Asked 'how would you test this field?', say: 'I'd partition the input space, then apply boundary analysis at each edge - inclusive bounds with their inside/outside neighbours - and add a couple of invalid-format checks. For a monetary field I'd also test rounding at two decimals.' Structure beats listing random values.",
      },
    ],
    commonMistakes: [
      { mistake: "Testing the boundary but not its neighbours.", fix: "The classic defect is one step away: 5,000.01 rejected but 5,000.00 wrongly rejected too - you only see it with both." },
      { mistake: "Forgetting the smallest step for decimals (testing 4,999 and 5,001 on a 0.01 field).", fix: "'Just outside' means one *minimum step* outside: 5,000.01, not 5,001." },
      { mistake: "Ignoring non-numeric boundaries (dates, list sizes, string lengths).", fix: "BVA applies wherever a rule has an edge - including 0/1/30-char nickname lengths." },
    ],
    confusedWith: [
      { a: "EP", b: "BVA", tell: "EP picks any representative per class; BVA deliberately attacks the edges of those classes. Use both." },
    ],
    recap: [
      "Defects cluster at edges; BVA aims tests there.",
      "3-point: min, min+, max-, max (plus mid). Robust adds invalid neighbours.",
      "Boundaries are wherever a rule has an edge: numbers, dates, lengths, counts.",
    ],
  },
  {
    id: "c-l3",
    moduleId: "mod-c",
    title: "Decision tables",
    minutes: 7,
    objectives: [
      "Build a decision table from rules with combined conditions",
      "Reduce the table when conditions don't interact",
      "Turn columns into test cases with full rule coverage",
    ],
    blocks: [
      {
        kind: "prose",
        text: "When behaviour depends on a *combination* of conditions ('if the account is frozen AND the amount exceeds the limit AND it's after cutoff...'), EP and BVA on single fields miss interactions. A **decision table** lists conditions and actions; every column is a rule; every rule becomes at least one test.",
      },
      { kind: "diagram", diagramId: "decision-table", note: "Click each column of the interactive table to see the rule it represents and the test it produces." },
      {
        kind: "example",
        title: "Transfer approval - a small table",
        text: "Conditions: payee verified? (Y/N), amount within limit? (Y/N). Actions: approve / reject 'payee' / reject 'limit'. Columns: Y,Y -> approve; Y,N -> reject limit; N,Y -> reject payee; N,N -> reject payee (or both - what does the spec say? if silent, that's a question to raise, not a guess).",
      },
      {
        kind: "list",
        items: [
          "Start with the spec's business rules; conditions become rows",
          "Full combination is 2^n columns - collapse impossible combinations and identical action sets",
          "Each surviving column = at least one test case, with data that realises exactly those conditions",
          "Columns where the spec is silent are *requirements questions*, not tester guesses",
        ],
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "The combinatorial trap",
        text: "10 yes/no conditions is 1,024 columns. Before building one giant table, check which conditions actually interact: group independent rules, or reduce with 'don't care' (-) entries. A table nobody can read protects nobody.",
      },
    ],
    commonMistakes: [
      { mistake: "Guessing the action for an unspecified combination.", fix: "Unspecified columns are questions for the business; documenting the gap is a test deliverable." },
      { mistake: "Building a table and then testing random columns.", fix: "The value is systematic coverage: every column gets a test, or a documented reason." },
      { mistake: "Mixing independent conditions into one table.", fix: "Split tables by interaction; independent rules get their own smaller tables." },
    ],
    recap: [
      "Decision tables expose condition combinations as rules (columns).",
      "Every column becomes a test; collapsed rules need a stated reason.",
      "Silent columns reveal specification gaps.",
    ],
  },
  {
    id: "c-l4",
    moduleId: "mod-c",
    title: "State transition testing",
    minutes: 8,
    objectives: [
      "Model behaviour as states, transitions, and events",
      "Derive test cases from valid paths and from invalid events",
      "Apply 0-switch and N-switch coverage vocabulary correctly",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Some defects only appear as a *sequence*: doing A then B differs from B then A. **State transition testing** models the system as states, events that cause transitions, actions performed on transition, and guards that must hold. From the diagram you derive path tests - and, just as important, tests for events that should be impossible.",
      },
      { kind: "diagram", diagramId: "state-transitions", note: "Click states and transitions in the sandbox transfer state machine. Then try sending a 'cancel' event in the wrong state - what should happen?" },
      {
        kind: "definition",
        term: "State transition testing",
        glossaryId: "state-transition-testing",
        text: "A black-box technique in which tests are designed to exercise valid and invalid state transitions. 0-switch coverage covers every transition (every state-event pair); 1-switch covers every pair of adjacent transitions; N-switch generalises to sequences of length N+1.",
      },
      {
        kind: "example",
        title: "Scheduled transfer states",
        text: "States: Draft -> Scheduled -> Executing -> Completed, plus Cancelled. Valid: schedule (Draft->Scheduled), cancel before execution day (Scheduled->Cancelled), execute (Scheduled->Executing->Completed). Invalid to test: cancel after execution started (Executing->Cancelled should be rejected or land in a defined state), execute a Cancelled transfer, double-execute. Each invalid event is a defect magnet.",
      },
      {
        kind: "list",
        items: [
          "Draw states (nouns), events (verbs), guards (conditions), actions (side effects)",
          "Cover all valid transitions first (0-switch), then sequences (N-switch) where risk justifies",
          "Systematically test invalid events: every event x every state where it is forbidden",
          "Watch for hidden states: 'between cutoff and execution' is a state even if the UI hides it",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Where state testing earns its keep",
        text: "Order flows, payment lifecycles, session handling, KYC document states, standing orders. Anywhere a status field exists, ask: 'what events move this, and which are forbidden?' Then test both halves.",
      },
    ],
    commonMistakes: [
      { mistake: "Only testing happy-path sequences.", fix: "Invalid and impossible events are where the interesting defects live." },
      { mistake: "Confusing transition coverage levels.", fix: "0-switch = each single transition; 1-switch = each adjacent pair. State it precisely in reviews." },
      { mistake: "Modelling UI screens instead of system states.", fix: "Screens are views; states are the underlying truth (a 'submitted' screen can hide several real states)." },
    ],
    recap: [
      "States + events + guards + actions; tests from valid and invalid transitions.",
      "0-switch covers every transition; N-switch covers longer sequences.",
      "Status fields anywhere = a state machine waiting to be drawn.",
    ],
  },
  {
    id: "c-l5",
    moduleId: "mod-c",
    title: "Exploratory, checklist-based, and error guessing",
    minutes: 7,
    objectives: [
      "Structure exploratory testing with charters and timeboxes",
      "Use checklists as coverage memory rather than scripts",
      "Apply error guessing from defect history and experience",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Not all testing is derived from documented rules. **Experience-based techniques** use skill and intuition - but disciplined: charters say what to explore, notes say what happened, debriefs turn findings into next charters.",
      },
      {
        kind: "definition",
        term: "Exploratory testing",
        glossaryId: "exploratory-testing",
        text: "Simultaneous learning, test design, and execution. A charter defines the mission ('explore payee deletion with linked scheduled transfers'); a timebox (60-90 min) keeps focus; notes and debriefs capture coverage and findings.",
      },
      {
        kind: "definition",
        term: "Error guessing",
        glossaryId: "error-guessing",
        text: "Designing tests from experience of where defects hide: empty fields, zero, duplicates, special characters, concurrent submits, slow networks, timezone edges, pasted text with line breaks, maximum values stacked together.",
      },
      {
        kind: "example",
        title: "One charter, three discoveries",
        text: "Charter: 'Explore scheduled transfers around the cutoff, 60 minutes.' The tester finds: cancelling at 23:59:59 races execution; the confirmation email for a cancelled transfer still sends; editing the amount resets the schedule date to today. None of these were in any scripted case - the charter aimed experience at a risky seam.",
      },
      {
        kind: "list",
        items: [
          "Checklist-based testing: cover known concerns (login flows, data persistence, error messages) without writing full cases",
          "Keep a defect-candidate list from past escapes - it becomes your team's error-guessing oracle",
          "Session sheets record: charter, duration, test notes, bugs, risks, coverage outline (SBTM style)",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Exploratory is not unstructured",
        text: "'Just click around' is not exploratory testing. Charters, timeboxes, and reporting make experience-based work visible, reviewable, and cumulative - which is what auditors and team leads need.",
      },
    ],
    commonMistakes: [
      { mistake: "Exploring without notes, then defending coverage from memory.", fix: "Session notes are the work product; without them the session evaporates." },
      { mistake: "Treating checklists as test cases.", fix: "Checklists ensure concerns are considered; they don't fix data, steps, or expected results - add detail where risk demands." },
      { mistake: "Error guessing from personal preference only.", fix: "Ground the guess list in this product's defect history - clustering principle again." },
    ],
    recap: [
      "Charters + timeboxes + notes = disciplined exploration.",
      "Checklists are coverage memory; error guessing is distilled defect history.",
      "Experience-based techniques complement (not replace) specification-based ones.",
    ],
  },
  {
    id: "c-l6",
    moduleId: "mod-c",
    title: "Writing effective test cases and traceability",
    minutes: 8,
    objectives: [
      "Write test cases with clear preconditions, data, steps, and expected results",
      "Avoid the classic test-case writing faults",
      "Maintain requirement-to-test traceability and use it for change",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A test case is a small contract: given this state and this input, the system must produce this observable outcome. Everything that makes cases brittle, vague, or unmaintainable comes from breaking one of those three parts.",
      },
      {
        kind: "list",
        items: [
          "**Title** - says what is being tested and under what condition ('Transfer of 5,000.01 rejected with limit message')",
          "**Preconditions** - state that must exist (logged in, payee exists, balance funded) and test data",
          "**Steps** - minimal, ordered, executable by a newcomer",
          "**Expected result** - observable, per critical step, with exact messages/amounts where they matter",
          "**Traceability** - links to condition and requirement (in Jira/Xray: issue link, test-to-story link)",
        ],
      },
      {
        kind: "definition",
        term: "Traceability",
        glossaryId: "traceability",
        text: "Documented links between requirements, test conditions, and test cases - forward (every requirement has tests) and backward (every test exists for a reason). It turns change impact analysis and coverage reporting into lookup instead of archaeology.",
      },
      {
        kind: "example",
        title: "Before and after",
        text: "Before: 'Test limit works. Steps: try transfer. Expected: works.' After: 'Transfer exactly at daily limit 5,000.00 is accepted. Pre: customer with no transfers today, balance 6,000. Steps: 1) submit transfer 5,000.00 to payee A. Expected: confirmation shows 5,000.00; 2) check remaining limit. Expected: 0.00; 3) submit further transfer 0.01. Expected: rejected, message DAILY_LIMIT_EXCEEDED.' Same area, second version is executable, auditable, and automatable.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Maintenance is a design constraint",
        text: "Every detail hard-coded into a case is a future edit. Prefer references to data sets over inline dumps, keep steps at a level a human or a script can follow, and delete cases that test nothing anymore (pesticide paradox). A suite's value decays without gardening.",
      },
    ],
    commonMistakes: [
      { mistake: "Steps without expected results at the failing moment.", fix: "Put the assertion where the defect would appear, not only at the end." },
      { mistake: "Assumptions baked into steps ('user is logged in' - who set that up?).", fix: "Preconditions are part of the case; make setup explicit or scripted." },
      { mistake: "Copy-paste cases with one value changed and no rationale.", fix: "If two cases exercise the same partition/edge, delete one; if the technique says both, label which technique." },
    ],
    recap: [
      "Cases = state + input + observable outcome; titles carry the condition.",
      "Expected results per critical step make verdicts objective.",
      "Traceability makes change analysis and coverage reporting cheap.",
    ],
  },
];
