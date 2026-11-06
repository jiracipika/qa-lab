/** Module D lessons: defect management and QA documentation (Jira/Xray/Confluence flavour). */

import type { Lesson } from "../types/content";

export const lessonsD: Lesson[] = [
  {
    id: "d-l1",
    moduleId: "mod-d",
    title: "The defect lifecycle: from discovery to closure",
    minutes: 7,
    objectives: [
      "Name the standard defect statuses and the transitions between them",
      "Distinguish status from resolution, and explain why both fields exist",
      "Keep an audit trail that survives release reviews and audits",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A defect report is not a note to a friend - it is a record in a workflow that several people act on. The lifecycle is the agreement about who owes which action next: the reporter owes evidence, triage owes a decision, the developer owes a fix or a reason, and the reporter owes the final verification. When the workflow is sloppy, defects get lost, closed without fixes, or reopened into arguments. When it is disciplined, the ticket history itself becomes the audit trail.",
      },
      {
        kind: "definition",
        term: "Defect lifecycle",
        text: "The agreed set of statuses a defect report passes through from discovery to closure - typically New, Triaged, In progress, Fixed, Verified, Closed - with side exits such as Rejected, Deferred, Duplicate, and Cannot reproduce, and a reopen path when a fix does not hold.",
        glossaryId: "defect-lifecycle",
      },
      {
        kind: "list",
        items: [
          "**New**: the reporter has filed evidence; someone else must look at it.",
          "**Triaged**: severity and priority are assigned; a release or owner is decided.",
          "**In progress**: a developer has accepted the fix work.",
          "**Fixed**: a candidate fix is deployed to the test environment - not yet proven.",
          "**Verified**: the reporter re-ran the failing scenario on the fixed build and it now behaves as specified.",
          "**Closed**: done. Side exits: **Rejected** (not a defect - record why), **Deferred** (real, but not this release - record the target), **Duplicate** (link to the original), **Cannot reproduce** (with what you tried), and **Reopened** when a Verified fix fails again.",
        ],
      },
      {
        kind: "diagram",
        diagramId: "defect-workflow",
        note: "Click each stage to see who acts, what evidence moves it forward, and where defects leak out of the loop.",
      },
      {
        kind: "prose",
        text: "Status and resolution are different fields, and confusing them causes real arguments. **Status** answers 'where is this in the workflow?' - Open, In progress, Closed. **Resolution** answers 'how did it end?' - Fixed, Won't fix, Duplicate, Cannot reproduce. A defect can honestly end as Closed with resolution Won't fix, provided the rationale is written down: the behaviour is as specified, or the cost is accepted by the owner. What it must never do is silently drift to Closed with nobody recording why.",
      },
      {
        kind: "example",
        title: "A banking defect walks the lifecycle",
        text: "You file: 'Standing order charged the monthly fee twice on 2026-10-31; customer account *4471 debited 2 x 4.90 EUR'. Triage rates it Critical - direct money impact, active customers - and targets the October release. The developer fixes the fee-aggregation query; status becomes Fixed. You re-run the exact scenario on the fixed build, check the ledger shows one fee, and the confirmation screen matches; you set Verified with your evidence attached. Only then Closed. If the ledger had still shown two fees, you would Reopen with the new ledger extract - the workflow loops, and the loop is visible to everyone.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Never close on trust",
        text: "Verification is the reporter's job, on the fixed build, in a controlled environment. 'The developer says it's fixed' is a claim, not a verdict. The two minutes you spend re-running the failing scenario are what make the ticket trustworthy for the next reader.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Marking a defect Verified because the developer moved it to Fixed",
        fix: "Fixed means a candidate fix exists in a test environment. Verify it yourself by re-running the exact failing scenario before the status moves on.",
      },
      {
        mistake: "Reopening a closed defect months later with brand-new evidence",
        fix: "Many banking teams prefer a new, linked report so the audit history of the original stays intact. Follow your project's convention - but keep the link either way.",
      },
    ],
    confusedWith: [
      {
        a: "Status",
        b: "Resolution",
        tell: "Status is where the workflow is; resolution is how it ended. Closed + Won't fix is a legitimate, documented ending.",
      },
    ],
    recap: [
      "The lifecycle is a work agreement: each status says who owes which action next.",
      "Status and resolution are separate fields; Closed does not always mean Fixed.",
      "Verification is the reporter's job - the person who saw the failure closes the loop.",
    ],
  },
  {
    id: "d-l2",
    moduleId: "mod-d",
    title: "Defect reports that get fixed first time",
    minutes: 8,
    objectives: [
      "Write a one-line title that classifies the defect and its impact",
      "Produce a minimal, reliable reproduction with real evidence",
      "Separate observed fact from interpretation in the actual-result section",
    ],
    blocks: [
      {
        kind: "prose",
        text: "The person reading your report is a developer, usually with five other tickets competing for attention, often close to a release freeze. A report that forces them to ask 'which screen? which build? what did you expect?' will sink to the bottom of the board. A report they can reproduce in three minutes gets fixed in the same sprint. The report's job is not to describe your day - it is to hand the fixer everything they need without a conversation.",
      },
      {
        kind: "definition",
        term: "Defect report",
        text: "A work product documenting a defect: title, environment, preconditions, reproduction steps, expected vs actual results, severity and priority with rationale, and evidence attachments. Its quality determines how fast triage and the fix can move.",
        glossaryId: "defect-report",
      },
      {
        kind: "list",
        items: [
          "**Title** - one line, pattern: [Component] wrong behaviour + impact. 'Transfer confirmation truncates the amount to whole euros' beats 'Transfer broken!!'.",
          "**Environment** - build/version, browser or device, test environment name. 'Works on my machine' arguments die here.",
          "**Preconditions** - account state, role, data setup: 'Retail customer with 2 payees, balance 1,200.00 EUR'.",
          "**Reproduction steps** - numbered, one action per step, no 'etc'. Someone else must get the same result from these words alone.",
          "**Expected result** - cite the source: requirement id, acceptance criterion, or specification line. 'Expected per AC-7: confirmation shows the exact submitted amount.'",
          "**Actual result** - what you observed, as facts. Screenshots, error text, record ids, timestamps.",
          "**Severity with rationale** - one line: why this level, what is impacted, for whom.",
        ],
      },
      {
        kind: "diagram",
        diagramId: "err-defect-failure",
        note: "Every report documents one chain: a human error produced a defect in the code, and your steps trigger the failure. Knowing the chain keeps the report honest about what is proven and what is suspected.",
      },
      {
        kind: "example",
        title: "Weak vs strong actual result",
        text: "Weak: 'The amount is being truncated by the confirmation service.' Strong: 'Confirmation screen shows 250 EUR; the success history line shows a 250.75 EUR debit; response payload field confirmation.amount = \"250\" (see attached HAR).' The strong version states facts a fixer can diff against the code; the interpretation ('truncated') is probably right, but it is your hypothesis, and hypotheses belong in a comment - not in the facts section.",
      },
      {
        kind: "code",
        code: {
          lang: "markdown",
          content: `## Title
[Transfer] Confirmation truncates submitted amount to whole euros

## Environment
Retail web 24.10.3, Chrome 141, env: NL-UAT-2

## Preconditions
Retail customer signed in; balance 1,200.00 EUR; payee "Landlord" exists.

## Steps
1. Open Transfers > New transfer.
2. Select payee "Landlord".
3. Enter amount 250.75, reference "October rent".
4. Submit transfer.

## Expected (AC-7)
Confirmation shows the exact submitted amount: 250.75 EUR.

## Actual
Confirmation shows 250 EUR. History line shows the correct 250.75 debit.

## Evidence
confirmation.png, response.har (field confirmation.amount = "250")

## Severity
Major - customer-visible wrong amount on a money confirmation;
ledger is correct, so impact is trust, not funds.`,
        },
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "One report, one defect",
        text: "Three small bugs found in one session are three reports, not one essay. A batched mega-ticket cannot be assigned, fixed, verified, or closed cleanly - and its severity becomes meaningless.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Steps that only work on your machine",
        fix: "Record environment and preconditions, and hand over exact data. If a step needs your session, your local clock, or your personal settings, the report is not reproducible.",
      },
      {
        mistake: "Writing the actual result as analysis",
        fix: "Put facts in the actual-result field ('screen showed X, response contained Y') and keep your interpretation ('this looks like a truncation') clearly separate - a comment or a hypothesis line.",
      },
    ],
    recap: [
      "Title pattern: [Component] wrong behaviour + impact - one line a triager can classify from.",
      "Minimal, reliable steps plus cited expected results make reproduction a formality.",
      "Facts go in actual result; interpretation goes in comments.",
    ],
  },
  {
    id: "d-l3",
    moduleId: "mod-d",
    title: "Severity, priority, and triage",
    minutes: 7,
    objectives: [
      "Apply a four-level severity scale with defensible rationale",
      "Explain why severity and priority are independent axes",
      "Describe what a triage meeting decides and what evidence it needs",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Two numbers follow every defect: how badly it hurts, and how soon it must be fixed. They are related by convention, not by law - and keeping them separate is what lets a team say 'this typo is trivial, but it ships today' or 'this data-corruption defect is critical, but the affected flow is behind a feature flag, so it can wait a sprint'. Teams that collapse the two axes into one number lose the ability to have that conversation.",
      },
      {
        kind: "definition",
        term: "Triage",
        text: "The recurring meeting (or queue review) where new defects are classified: is it a defect, how severe, how urgent, who owns it, and which release or iteration it lands in. Good triage is evidence-driven and leaves a recorded decision.",
        glossaryId: "triage",
      },
      {
        kind: "list",
        items: [
          "**Critical** - money wrong, data corrupted or lost, security breached, system down. Blocks the release.",
          "**Major** - a core flow is unusable or badly wrong; workaround exists but is painful or unusual for customers.",
          "**Minor** - a defect with an easy, familiar workaround; limited population affected.",
          "**Trivial** - cosmetic: typos, spacing, alignment. Worth fixing in slack time, not worth delaying anything.",
        ],
      },
      {
        kind: "example",
        title: "Same defect, two priorities",
        text: "A typo on the public homepage headline: Trivial severity - and on launch-morning, Priority 1, because every visitor sees it. The same typo buried in an internal admin export: Trivial severity, Priority 4, fixed whenever someone is bored. Nothing about the defect changed - only the schedule. That is the whole severity/priority distinction in one picture.",
      },
      {
        kind: "prose",
        text: "Triage needs three inputs per defect: evidence that it is real (your reproduction), impact ('who is affected, how badly'), and scheduling facts ('which release, how many customers, is there a workaround'). When reporter and developer disagree on severity, restate the impact in user terms, check the population affected, and consult the agreed matrix. If it still will not settle, that is exactly what the defect committee or escalation path exists for - and the decision, whatever it is, belongs in the ticket.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "Severity inflation",
        text: "Rating everything Critical to win attention works exactly once. After that, triage discounts your severities across the board - and your one genuine Critical loses its meaning. Reserve the top of the scale for money, data, security, and outages.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Setting severity by how hard the fix looks",
        fix: "Severity describes impact, not effort. A one-character fix can still corrupt data; a week of work can still be a cosmetic change.",
      },
      {
        mistake: "Arguing priority without dates or populations",
        fix: "Priority is a scheduling decision. Bring launch dates, affected user counts, and workaround cost - then the argument becomes arithmetic instead of volume.",
      },
    ],
    recap: [
      "Severity is impact on users and the system; priority is urgency in the release plan.",
      "The axes are independent: launch-day typos can be trivial severity, top priority.",
      "Triage decides with evidence - reproduction, impact, and scheduling facts, recorded in the ticket.",
    ],
  },
  {
    id: "d-l4",
    moduleId: "mod-d",
    title: "Traceability and test management in Jira and Xray",
    minutes: 8,
    objectives: [
      "Explain the requirement-to-test-to-run-to-defect chain and why auditors care",
      "Structure Xray Tests, Test Executions, and Test Plans",
      "Link defects to the failing test and read coverage in both directions",
    ],
    blocks: [
      {
        kind: "prose",
        text: "In banking, 'we tested it' is not an acceptable answer to an auditor; 'here is the requirement, here are the tests that cover it, here are the runs with verdicts and evidence, and here is the defect that was raised when it failed' is. Traceability is the chain that makes that sentence navigable. Tools like Jira with Xray exist to keep the chain in the system of record instead of in spreadsheets and memories.",
      },
      {
        kind: "definition",
        term: "Traceability",
        text: "Documented links between requirements, test conditions, and test cases. Forward: every requirement is covered. Backward: every test is justified. Enables change impact analysis and defensible coverage reporting.",
        glossaryId: "traceability",
      },
      {
        kind: "list",
        items: [
          "**Test issue** - one purpose per test, structured steps with expected results, reusable across executions.",
          "**Test Set** - a grouping of Tests, e.g. 'Payments regression pack'.",
          "**Test Plan** - the scope for a release or iteration: which Tests should run, and against which versions.",
          "**Test Execution** - a run instance: each Test gets a verdict (Pass/Fail/Blocked), an executor, a date, and evidence.",
          "**Defect link** - a failed Test Run links to the defect; the defect links back. Impact analysis reads exactly this edge.",
        ],
      },
      {
        kind: "code",
        code: {
          lang: "json",
          caption: "Importing a structured Test into Xray (JSON)",
          content: `{
  "summary": "Verify transfer confirmation shows the exact submitted amount",
  "type": "Test",
  "testType": { "name": "Manual" },
  "component": "Transfers",
  "steps": [
    {
      "action": "Enter amount 250.75 and submit the transfer",
      "data": "Payee: Landlord; balance 1,200.00 EUR",
      "result": "Confirmation shows 250.75 EUR (AC-7); history line matches"
    },
    {
      "action": "Enter amount 0.01 and submit",
      "data": "Payee: Landlord",
      "result": "Confirmation shows 0.01 EUR; minimum-amount rule not violated"
    }
  ],
  "customFields": {
    "Requirement": "STO-1421"
  }
}`,
        },
      },
      {
        kind: "prose",
        text: "Coverage is read in both directions. **Forward**: pick a requirement, list the tests that cover it - gaps here are untested agreements. **Backward**: pick a test, name the requirement or risk that justifies its existence - orphans here get deleted in audits, because a test nobody can justify is maintenance cost with no owner. When a change lands, impact analysis walks the chain outward: change the fee calculation, and traceability tells you which tests, which runs, and which past defects to revisit.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Evidence lives on the run, not in memory",
        text: "The verdict 'Pass' is a claim; the attached screenshot, response file, environment, and timestamp are the proof. Six months later at audit time, the run record is the only witness available.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Writing test cases as chatty descriptions inside ticket comments",
        fix: "Use the structured record - steps, data, expected results - that the tool can query, report on, and reuse. Comments rot; records are searchable.",
      },
      {
        mistake: "Linking defects only to the user story, never to the failing test",
        fix: "Link to the Test Run or Test Case that failed. That is the edge impact analysis and coverage reports actually read.",
      },
    ],
    recap: [
      "The chain: requirement -> test -> run -> defect, linked in the system of record.",
      "Forward coverage finds untested requirements; backward justification finds orphan tests.",
      "Verdicts are claims; evidence attached to the run is the proof.",
    ],
  },
  {
    id: "d-l5",
    moduleId: "mod-d",
    title: "Metrics that tell the truth",
    minutes: 7,
    objectives: [
      "Compute defect detection percentage and escaped-defect rate",
      "Choose metrics that drive decisions instead of vanity",
      "Recognise when a metric is being gamed and say so",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Numbers are how QA talks to management - and how management accidentally teaches QA to lie. A good metric answers a decision question ('is quality getting better?', 'where are defects escaping?') with a number that is hard to fake. A vanity metric rewards motion ('tests executed') or volume ('bugs found') and gets gamed the week it appears on a dashboard. The skill is choosing metrics whose incentive you would accept.",
      },
      {
        kind: "definition",
        term: "Defect escape rate",
        text: "The share of defects found after release relative to all defects found (before + after). Its complement, defect detection percentage, measures what testing caught before customers did. Both are lagging indicators - they describe the release, they do not steer it in real time.",
        glossaryId: "defect-escape-rate",
      },
      {
        kind: "example",
        title: "DDP in one release",
        text: "Testing found 120 defects before release. In the first month of production, customers and support found 20 more. DDP = 120 / (120 + 20) = 86%; escape rate = 20 / 140 = 14%. One number is not yet a trend - but 86% this release against 91% last release, split by module, is a conversation: what changed in the module that lost ground?",
      },
      {
        kind: "code",
        code: {
          lang: "text",
          caption: "The arithmetic, kept explicit",
          content: `defects_found_in_testing   = 120
defects_found_in_production = 20
total                      = 140

DDP         = 120 / 140 = 0.857  -> 86%
escape rate =  20 / 140 = 0.143  -> 14%

Report both, split by severity:
  escapes: 1 Critical, 4 Major, 15 Minor/Trivial`,
        },
      },
      {
        kind: "list",
        items: [
          "**Defends decisions**: escape rate with severity split, open-defect age by severity, reopen rate, fix turnaround for Critical/Major.",
          "**Vanity**: defects filed per tester (rewards volume), test cases executed (rewards motion), automation percentage with no escape data.",
          "**Red flags**: a metric nobody can explain the decision for; a number that improves the same week it starts being reported; duplicate/closure spikes that track reporting targets.",
        ],
      },
      {
        kind: "prose",
        text: "Gaming patterns are predictable: defects closed as Duplicate to keep counts down, Deferred without a target release, severity inflated or deflated to fit a narrative, production escapes quietly logged as 'user error'. The countermeasure is not a cleverer metric - it is a culture where reporting the ugly number is safe. That is also why this platform refuses to invent mastery percentages: a number you cannot defend in an audit is a liability, not a metric.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Every metric is a question light",
        text: "When a number moves, the useful response is 'why?' - and the metric should make that question answerable. Escape rate by module does. 'Bugs found this sprint' does not.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Reporting defect counts without a severity split",
        fix: "Ten open defects where two are Critical is a different release from ten Trivial ones. Always report the split.",
      },
      {
        mistake: "Treating DDP as a target to hit",
        fix: "It is a lagging indicator with a known failure mode: pressure to hit it produces hidden escapes, not better testing. Use it to compare and question, never to score individuals.",
      },
    ],
    recap: [
      "DDP = found in testing / found in total; escape rate is its complement.",
      "Metrics that defend decisions: escape rate by severity, defect age, reopen rate.",
      "If a metric can be gamed, assume it eventually will be - pick ones whose incentives you accept.",
    ],
  },
  {
    id: "d-l6",
    moduleId: "mod-d",
    title: "Working the board: collaborating on defects",
    minutes: 7,
    objectives: [
      "Diagnose with the developer instead of throwing defects over the wall",
      "Handle 'cannot reproduce' and 'works on my machine' constructively",
      "Escalate disagreements without burning trust",
    ],
    blocks: [
      {
        kind: "prose",
        text: "The defect workflow models a conversation, and most of its failures are conversation failures. 'It works on my machine.' 'Well, it's broken in UAT.' Two people asserting environments at each other burns an afternoon. The productive version: one person brings evidence that pins the difference - build numbers, environment names, a trace id, a log extract - and the pair narrows the gap together. Your job is not to win the ticket; it is to make the difference between observed and expected impossible to dispute.",
      },
      {
        kind: "list",
        items: [
          "**Check before you file** - search existing reports; add your evidence to a duplicate rather than creating one.",
          "**Bring the trace** - correlation ids, request ids, timestamps, log extracts. In banking systems the trace id is usually the fastest path from 'broken' to 'here'.",
          "**Shrink the case** - the smallest data set and the fewest steps that still fail. Diagnosis time shrinks with it.",
          "**Offer the pairing session** - fifteen minutes of screen share settles 'cannot reproduce' faster than a week of comments.",
          "**Keep it about the product** - 'the fee calculation double-charges' not 'your code is broken'. The fixer is your ally; the defect is the opponent.",
        ],
      },
      {
        kind: "example",
        title: "Cannot reproduce, politely",
        text: "Developer: 'Ran your steps twice on NL-UAT-2, fee charged once.' You: 'Same build 24.10.3? I was on 24.10.2 when it failed - and the account had a pending reversal. Trying again on .3 with a clean account.' Result: the defect reproduces only on the old build with contaminated data - which converts an argument into a decision: verify on the current build, and file the stale-data risk separately. Nobody lost face; the ticket gained two facts.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Write for the fixer",
        text: "The reader is a developer at 16:30 before a release freeze. Every sentence should either narrow reproduction, state an expectation with a source, or record a fact. Everything else - history, feelings, theories - belongs further down or in a comment.",
      },
      {
        kind: "prose",
        text: "Escalation is a ladder, not a mood. First: comment with evidence and ask a specific question. Then: the triage meeting, where the disagreement gets stated in one sentence with the facts attached. Then: the defect committee or the owning managers. What never works: letting the disagreement live in direct messages - decisions made there are invisible to audits, to the rest of the team, and to the future you. Whatever is decided, the ticket records it: decision, date, rationale.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Filing a new defect without searching for an existing report",
        fix: "Duplicates cost triage time twice and split the evidence across two threads. Search first; link and contribute if found.",
      },
      {
        mistake: "Letting a priority disagreement live in direct messages",
        fix: "Decisions and their rationale go in the ticket. Audits read tickets, not chats - and so does the team member who inherits the release.",
      },
    ],
    recap: [
      "Bring evidence that pins the difference: build, environment, trace id, smallest failing case.",
      "'Cannot reproduce' is a request for better pins, not a defeat.",
      "Decisions live in the ticket; escalation is a ladder with named rungs.",
    ],
  },
];
