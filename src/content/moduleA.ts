import type { Lesson } from "../types/content";

export const lessonsA: Lesson[] = [
  {
    id: "a-l1",
    moduleId: "mod-a",
    title: "Why we test: objectives and quality",
    minutes: 6,
    objectives: [
      "Explain what software testing is and what it is not",
      "List typical objectives of testing",
      "Distinguish quality assurance, quality control, and testing",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Testing is the process of **evaluating a work product** to learn whether it meets its requirements, to find defects, and to build confidence about quality. The work product is usually running software, but it can also be a requirement, a design note, or a test plan. Notice the direction of that definition: testing exists to produce *information*, not just to produce pass/fail marks.",
      },
      {
        kind: "list",
        items: [
          "**Evaluate work products** against requirements and user needs",
          "**Verify** that specified requirements are met and **validate** fitness for purpose",
          "**Find defects** early, where they are cheapest to fix",
          "**Build confidence** in quality for a given purpose and context",
          "**Prevent defects** through reviews, good requirements, and testable design",
          "**Reduce risk** of failures in operation and give stakeholders data to make release decisions",
        ],
      },
      {
        kind: "definition",
        term: "Testing",
        glossaryId: "testing",
        text: "Evaluating a work product by exercising it (dynamic testing) or examining it (static testing) to obtain information about its quality. Testing includes planning, analysis, design, implementation, execution, and reporting.",
      },
      {
        kind: "definition",
        term: "Quality assurance vs quality control",
        glossaryId: "qa-vs-qc",
        text: "Quality assurance (QA) is process-focused: it sets and improves the practices that prevent defects. Quality control (QC) is product-focused: it inspects the product to find defects. Testing is one QC activity.",
      },
      {
        kind: "example",
        title: "Same screen, three different objectives",
        text: "A bank is releasing a funds-transfer screen. A tester writing an exploratory charter wants to *find defects* before release. A business analyst walking through the acceptance criteria wants to *validate* that the screen supports real customers. A regulator-facing test summary wants to *provide evidence* that controls work. All three are testing; the objective changes what you do and report.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Testing does not prove correctness",
        text: "Testing can show the presence of defects, never their absence. A clean test run raises confidence; it does not guarantee the software is defect-free. Say this out loud in interviews: it is the single most quoted testing principle.",
      },
    ],
    commonMistakes: [
      { mistake: "Treating 'testing' and 'QA' as synonyms on a CV or in stand-up.", fix: "QA covers defect-prevention process; testing is one quality-control activity inside it." },
      { mistake: "Defining test success as 'all tests green'.", fix: "Success is *useful information* about risk. Green tests on the wrong build, or on untested data, are not success." },
      { mistake: "Assuming testers own quality.", fix: "The whole team builds quality in; testers provide information about it." },
    ],
    confusedWith: [
      { a: "Quality assurance", b: "Quality control", tell: "Ask 'are we improving the process, or inspecting this product right now?' Process = QA, this product = QC." },
      { a: "Testing", b: "Debugging", tell: "Testing detects that a failure exists; debugging finds and removes its cause. See the next lessons." },
    ],
    recap: [
      "Testing produces information: requirements met? defects found? risk reduced?",
      "QA = process and prevention; QC = product inspection; testing is part of QC.",
      "Objectives range from finding defects to building confidence and preventing defects.",
      "Testing cannot prove the absence of defects.",
    ],
  },
  {
    id: "a-l2",
    moduleId: "mod-a",
    title: "Errors, defects, and failures",
    minutes: 7,
    objectives: [
      "Define error, defect, and failure and trace the chain between them",
      "Explain why a defect does not always cause a failure",
      "Use the chain to reason about root cause and about defect reports",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Three words, one chain. A human **error** (also called a mistake) produces a **defect** (a flaw) in code or a document. If the code with the defect executes in a way that exposes it, the system produces a **failure** (a deviation from expected behaviour). The chain runs error -> defect -> *possible* failure, and the word *possible* matters.",
      },
      { kind: "diagram", diagramId: "err-defect-failure", note: "Click each stage and the guard conditions to see definitions, examples, and a check question." },
      {
        kind: "definition",
        term: "Error (mistake)",
        glossaryId: "error",
        text: "A human action that produces a defect: a misunderstanding of an interest rule, a typo, a wrong assumption. Tools and processes (reviews, pair programming, checklists) reduce errors.",
      },
      {
        kind: "definition",
        term: "Defect (bug/fault)",
        glossaryId: "defect",
        text: "A flaw in a work product, such as code that implements `balance - fee` when the specification says fees are waived under conditions that were never coded.",
      },
      {
        kind: "definition",
        term: "Failure",
        glossaryId: "failure",
        text: "An actual deviation of the system from its expected behaviour, observed during execution. A failure needs a defect, a triggering input, and a code path that reaches it.",
      },
      {
        kind: "example",
        title: "A defect can hide for years",
        text: "A loan module contains a rounding defect in an interest calculation, but the branch is only reached for a 29 February drawdown of a 30/360 product. The defect existed since release; the *failure* appears once every four years on one product type. This is why 'it worked in testing' is weak evidence that code is defect-free.",
      },
      {
        kind: "prose",
        text: "The chain also runs backwards during debugging: you observe a **failure**, search the logs and code for the **defect** that caused it, and the fix addresses the human **error** only if you also fix the process that allowed it (a missing check, an unclear requirement).",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "Common exam-style trap",
        text: "'Every defect causes a failure' is false. And 'every failure comes from a programming defect' is also false - failures can come from environmental issues, bad data, or hardware. Keep the mapping many-to-maybe.",
      },
    ],
    commonMistakes: [
      { mistake: "Writing defect reports about 'errors in the code' when you mean defects.", fix: "Reserve 'error' for the human mistake; your report documents a defect or a failure." },
      { mistake: "Assuming a passing run proves the defect-free branch was executed.", fix: "Confirm coverage: which data, which path, which day of the month?" },
      { mistake: "Fixing the symptom (catch the exception, move on).", fix: "Root cause sits earlier in the chain; otherwise the same error breeds more defects." },
    ],
    confusedWith: [
      { a: "Defect", b: "Failure", tell: "Defect = the flaw in the product (exists at rest). Failure = behaviour you observed (exists at runtime)." },
      { a: "Error", b: "Defect", tell: "Error is the human act; the defect is the residue it leaves in the work product." },
    ],
    recap: [
      "error (human) -> defect (in product) -> possible failure (at runtime)",
      "A defect only fails when executed with input that triggers it.",
      "Failures can also come from environment or data, not only code defects.",
      "Debugging walks the chain backwards; prevention walks it forwards.",
    ],
  },
  {
    id: "a-l3",
    moduleId: "mod-a",
    title: "Testing vs debugging, verification vs validation, static vs dynamic",
    minutes: 7,
    objectives: [
      "Separate testing from debugging by purpose and by role",
      "Apply verification ('did we build it right') vs validation ('did we build the right thing')",
      "Classify activities as static or dynamic testing",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Three pairs of words cause endless interview confusion. Each pair separates along one question. **Testing vs debugging**: are we detecting that a failure exists, or locating and removing its cause? **Verification vs validation**: are we checking the product against its specification, or against real user needs? **Static vs dynamic**: does the work product need to run?",
      },
      {
        kind: "list",
        items: [
          "**Testing** detects failures and gathers quality information (testers lead, anyone can do it)",
          "**Debugging** locates the defect behind a failure and fixes it (developers lead)",
          "**Verification** reviews each step against the agreed specification - 'building the product right'",
          "**Validation** checks the product against actual user and business needs - 'building the right product'",
          "**Static testing** examines work products without running them: reviews, walkthroughs, static analysis",
          "**Dynamic testing** runs the software and observes behaviour",
        ],
      },
      {
        kind: "definition",
        term: "Verification",
        glossaryId: "verification",
        text: "Checking that a work product meets its specified requirements: does the transfer screen implement the spec's 1.00-10,000.00 limit exactly? Verification compares product to specification.",
      },
      {
        kind: "definition",
        term: "Validation",
        glossaryId: "validation",
        text: "Checking that the specification itself satisfies user needs: do customers actually want a 10,000.00 cap on transfers? A product can be perfectly verified and still fail validation.",
      },
      {
        kind: "example",
        title: "Static testing catches the cheapest defects",
        text: "A four-eyes review of a tester's automation finds a locator pointing at `//div[3]/button` - brittle, and it would mislead every run after the next UI tweak. No execution needed; five minutes of review prevents weeks of flaky results. Static analysis of Java pulling unused imports or resource leaks is the same idea, automated.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Static testing is still testing",
        text: "Reviews and static analysis find defects earlier than execution can, and they work on documents that cannot run at all (requirements, user stories, test plans). 'Testing = running the software' is too narrow.",
      },
    ],
    commonMistakes: [
      { mistake: "Saying testers debug.", fix: "Testers provide the failure evidence and reproduction; developers debug. In automation-heavy teams you will investigate, but the separation of concerns remains." },
      { mistake: "Using verification and validation interchangeably.", fix: "Verification: vs specification. Validation: vs user needs. A spec-perfect screen nobody can use fails validation." },
      { mistake: "Calling a code review 'not really testing'.", fix: "It is static testing, and typically the cheapest defect-removal step you have." },
    ],
    confusedWith: [
      { a: "Static testing", b: "Dynamic testing", tell: "Does the artifact need to be executed to observe the defect? No = static, yes = dynamic." },
      { a: "Verification", b: "Validation", tell: "'Right product' = validation, 'product right' = verification." },
    ],
    recap: [
      "Testing detects; debugging locates and fixes.",
      "Verification compares to spec; validation compares to need.",
      "Static testing (reviews, analysis) never runs the product; dynamic testing does.",
      "Static techniques find defects earliest and cheapest.",
    ],
  },
  {
    id: "a-l4",
    moduleId: "mod-a",
    title: "The seven testing principles",
    minutes: 8,
    objectives: [
      "Name the seven testing principles and give an example of each",
      "Use the principles to defend prioritisation decisions",
      "Spot principle violations in real project situations",
    ],
    blocks: [
      {
        kind: "prose",
        text: "The seven principles describe why testing works the way it does. You will not be graded on reciting them at work; you will use them to explain why 'test everything' is impossible and why your risk-based plan is the right one.",
      },
      {
        kind: "list",
        ordered: true,
        items: [
          "**Testing shows the presence of defects, not their absence.** A passed suite says those cases did not fail - nothing more.",
          "**Exhaustive testing is impossible.** The input space of one date field alone is huge; you must select, and selection is a design skill.",
          "**Early testing saves time and money.** A defect found in requirements costs a conversation; found in production it costs incidents, regulators, and reputation (shift-left).",
          "**Defects cluster.** A few modules usually hold most defects - which is why you weight effort where failures already appeared.",
          "**Beware of the pesticide paradox.** Reusing the same tests stops finding anything new; refresh the suite and the data.",
          "**Testing is context dependent.** A banking core and a marketing site need different depth, tools, and evidence.",
          "**Absence-of-errors is a fallacy.** A defect-free build of the wrong product is still a failed product; validation matters.",
        ],
      },
      {
        kind: "example",
        title: "Defect clustering in a payments team",
        text: "Half of this quarter's production incidents came from the payee-management module. The principle says: concentrate the next regression pass and add boundary tests there - not spread effort evenly across every screen. The team also noticed their smoke suite had run green for months (pesticide paradox), so they added mutations to test data and retired stale cases.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Using principles in conversation",
        text: "When a stakeholder asks for '100% test coverage', the answer is principle 2 plus a risk-based proposal: 'Exhaustive testing is impossible; here is the coverage I recommend for the highest-risk partitions, and what I would leave out, with reasons.'",
      },
    ],
    commonMistakes: [
      { mistake: "Interpreting a green suite as proof there are no defects (principle 1).", fix: "Report what was covered and what was not; confidence, not proof." },
      { mistake: "Keeping a fossil test suite because it once found defects.", fix: "Pesticide paradox: review suites periodically; add new cases and data." },
      { mistake: "Copying another team's test approach wholesale.", fix: "Context dependence: revisit depth and tooling when risk and domain change." },
    ],
    confusedWith: [
      { a: "Defect clustering", b: "Pesticide paradox", tell: "Clustering: defects concentrate, so go where they are. Pesticide: your suite goes stale, so change it." },
    ],
    recap: [
      "Presence, not absence; exhaustive is impossible; early beats late; defects cluster; suites go stale; context decides; error-free is not enough.",
      "Principles justify prioritisation, not just exam answers.",
    ],
  },
  {
    id: "a-l5",
    moduleId: "mod-a",
    title: "Test activities and work products",
    minutes: 7,
    objectives: [
      "Walk the core test process and its feedback loops",
      "Match activities to the work products they produce",
      "Explain how regression and change ripple through the process",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Testing is not a phase at the end; it is a loop. Planning sets objectives and approach; analysis works out *what* to test from requirements and risks; design turns that into concrete cases and data; implementation makes them runnable (manual steps or automation); execution runs them and compares actual vs expected; completion evaluates exit criteria and reports. Every stage produces a work product someone else consumes.",
      },
      { kind: "diagram", diagramId: "test-process", note: "Click each activity to see its inputs, outputs, and the loops that feed earlier stages." },
      {
        kind: "list",
        items: [
          "**Test plan** - objectives, scope, approach, resources, schedule, exit criteria",
          "**Test conditions** - things to test, derived from analysis",
          "**Test cases** - steps, data, expected results (positive, negative, boundary)",
          "**Test procedures / suites** - ordered sets of cases, runnable as scripts or automation",
          "**Defect reports** - reproducible evidence with severity and priority",
          "**Test summary reports** - results, coverage, residual risk, exit-criteria status",
        ],
      },
      {
        kind: "example",
        title: "The feedback loops, concretely",
        text: "During execution a tester finds that 'reject transfer above daily limit' fails. The defect report goes to development (fix loop). The condition 'daily limit enforcement' turns out to be under-tested, so new cases are designed (design loop). Exit criteria in the plan said zero open high-severity defects, so the release decision waits on the fix (planning loop). One failure, three loops.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Traceability lives here",
        text: "Each test case should trace back to a condition, and each condition to a requirement or risk. When a requirement changes, traceability tells you exactly which cases to revisit - this is what makes regression selection defensible instead of guesswork.",
      },
    ],
    commonMistakes: [
      { mistake: "Writing test cases with steps but no expected result per step.", fix: "An expected result is what makes a step checkable; without it, anyone 'passes' anything." },
      { mistake: "Treating the test plan as shelfware.", fix: "Revisit it when scope or risk changes; a stale plan is worse than a short current one." },
      { mistake: "Reporting '95% passed' with no coverage or risk context.", fix: "Summaries need: what was run, what was not, what risk remains, against which exit criteria." },
    ],
    recap: [
      "Plan -> analyse -> design -> implement -> execute -> complete, with feedback loops at every stage.",
      "Work products: plan, conditions, cases, procedures, defect reports, summary reports.",
      "Traceability from requirement to test enables reasoned regression selection.",
    ],
  },
  {
    id: "a-l6",
    moduleId: "mod-a",
    title: "Roles, collaboration, and independence",
    minutes: 6,
    objectives: [
      "Describe common test roles and what independence adds",
      "Explain the trade-off between independence and product knowledge",
      "Show where testers collaborate across the lifecycle",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Testing can be done by the developer who wrote the code, by another developer on the team, by a dedicated test team, or by an independent group outside the organisation. More independence brings fresher assumptions and a mandate to challenge; less independence brings deeper product knowledge and faster feedback. Teams trade these off deliberately.",
      },
      {
        kind: "list",
        items: [
          "**Test analyst/designer** - analyses requirements, designs cases and data",
          "**Test automator / SDET** - builds and maintains automation, pipelines, and tooling",
          "**Test manager** - planning, monitoring, exit criteria, reporting",
          "**Developers** - unit and integration testing, debugging, reviews",
          "**Business/users** - acceptance testing, validation, domain judgement",
          "**Operations / SRE** - production monitoring, incident data feeding test risk models",
        ],
      },
      {
        kind: "definition",
        term: "Independence of testing",
        glossaryId: "independence",
        text: "The degree to which the people testing are separate from the people who built the work product. Higher independence reduces confirmation bias but can slow feedback and dilute product knowledge.",
      },
      {
        kind: "example",
        title: "Collaboration in a regulated bank",
        text: "A payments change goes through: developers unit-test the rounding fix; a QA colleague designs boundary cases from the spec; an independent change-advisory reviewer challenges evidence; UAT sign-off comes from a product owner. Each level of independence answers a different question - and audit wants to see all of them recorded (for example, in Jira and Xray).",
      },
      { kind: "diagram", diagramId: "defect-workflow", note: "A typical example defect workflow. Click states and transitions to see who acts and what 'done' requires. Teams differ; this is an example, not a standard." },
      {
        kind: "callout",
        tone: "tip",
        title: "Mindset",
        text: "A tester's professional attitude: curiosity, scepticism about 'it works on my machine', attention to detail, and the communication skill to report bad news constructively. Independence is a structure; mindset is a habit.",
      },
    ],
    commonMistakes: [
      { mistake: "Believing developers cannot test their own code at all.", fix: "They should - at unit level, immediately. Independence matters most at system and acceptance levels." },
      { mistake: "Using independence as an excuse for 'throw it over the wall'.", fix: "Independent testers embedded with the team get faster feedback and better specifications." },
      { mistake: "Confusing severity (technical impact) with priority (fix urgency).", fix: "Severity is judged against the system; priority against the release and business context. A cosmetic spelling defect on the homepage can be high priority, low severity." },
    ],
    recap: [
      "Independence levels: developer, team, dedicated testers, external - each with trade-offs.",
      "Testing roles span analysis, automation, and management; everyone tests something.",
      "Defect workflows are team-specific examples: understand the states your team actually uses.",
    ],
  },
];
