/** Module D flashcards (all four kinds) and practical challenges. */

import type { Challenge, ConceptCard } from "../types/content";

export const cardsD: ConceptCard[] = [
  {
    id: "d-c1",
    moduleId: "mod-d",
    lessonId: "d-l1",
    topic: "Defect lifecycle",
    kind: "definition",
    front: "What is the defect lifecycle, and which statuses does a report normally pass through?",
    back: "The agreed workflow from discovery to closure: New, Triaged, In progress, Fixed, Verified, Closed - with side exits (Rejected, Deferred, Duplicate, Cannot reproduce) and a reopen path. Each status states who owes the next action.",
  },
  {
    id: "d-c2",
    moduleId: "mod-d",
    lessonId: "d-l3",
    topic: "Triage",
    kind: "definition",
    front: "What does a triage meeting actually decide?",
    back: "For each new defect: is it a defect at all, how severe, how urgent, who owns it, and which release or iteration it lands in. Evidence in: reproduction, impact, scheduling facts. Decision out: recorded in the ticket.",
  },
  {
    id: "d-c3",
    moduleId: "mod-d",
    lessonId: "d-l5",
    topic: "Metrics",
    kind: "definition",
    front: "Define defect escape rate. Why is it called a lagging indicator?",
    back: "The share of all defects that were found after release (escapes / total found). It is computed after the fact from a finished release window, so it describes past performance rather than steering current work.",
  },
  {
    id: "d-c4",
    moduleId: "mod-d",
    lessonId: "d-l1",
    topic: "Defect lifecycle",
    kind: "compare",
    front: "Status vs Resolution on a defect ticket",
    back: "Status: where the workflow is right now - Open, In progress, Closed. Resolution: how it ended - Fixed, Won't fix, Duplicate, Cannot reproduce. Closed + Won't fix (with rationale) is a legitimate ending.",
  },
  {
    id: "d-c5",
    moduleId: "mod-d",
    lessonId: "d-l3",
    topic: "Severity and priority",
    kind: "compare",
    front: "Severity vs Priority - and when do they point in opposite directions?",
    back: "Severity = impact on users/system if the defect occurs. Priority = urgency of fixing given the release plan. Launch-day homepage typo: trivial severity, top priority. Data-corruption defect behind a feature flag: critical severity, lower priority.",
  },
  {
    id: "d-c6",
    moduleId: "mod-d",
    lessonId: "d-l4",
    topic: "Xray",
    kind: "compare",
    front: "Xray Test Execution vs Test Plan - what is each for?",
    back: "Test Plan: the intended scope for a release/iteration - which Tests should run, against which versions. Test Execution: an actual run instance - verdicts (Pass/Fail/Blocked), executor, date, evidence. One is intent, the other is record.",
  },
  {
    id: "d-c7",
    moduleId: "mod-d",
    lessonId: "d-l3",
    topic: "Severity and priority",
    kind: "scenario",
    front: "Launch is tomorrow morning. A typo appears in the public homepage headline. Severity? Priority? Why?",
    back: "Severity: Trivial - cosmetic, nobody misleads anyone, nothing breaks. Priority: 1 - every visitor sees the homepage before launch; the schedule makes it urgent. Independent axes at work.",
  },
  {
    id: "d-c8",
    moduleId: "mod-d",
    lessonId: "d-l6",
    topic: "Collaboration",
    kind: "scenario",
    front: "A developer cannot reproduce your defect on their machine. What are your next two moves?",
    back: "Pin the difference: compare build versions and environments, share your exact data set and trace/log evidence, offer a short pairing session. 'Cannot reproduce' is a request for better pins, not a rejection.",
  },
  {
    id: "d-c9",
    moduleId: "mod-d",
    lessonId: "d-l1",
    topic: "Defect lifecycle",
    kind: "scenario",
    front: "The fix for your defect is deployed to the test environment. What do you do before the defect can be Closed?",
    back: "Verify: re-run the exact failing scenario on the fixed build, check the actual results match the cited expectations, attach evidence, set Verified. Then - after confirmation - regression analysis protects the surrounding behaviour. Only then Closed.",
  },
  {
    id: "d-c10",
    moduleId: "mod-d",
    lessonId: "d-l4",
    topic: "Xray",
    kind: "code-api",
    front: "What does a structured Xray Test issue contain that a comment in a ticket does not?",
    back: "Typed, queryable fields: one purpose, steps with action / data / expected result, test type, component, and a requirement link - so coverage can be reported and impact analysis can walk the chain.",
    code: {
      lang: "json",
      caption: "Minimal structured Test",
      content: `{
  "type": "Test",
  "summary": "Transfer confirmation shows the exact submitted amount",
  "testType": { "name": "Manual" },
  "steps": [
    { "action": "Enter 250.75 and submit",
      "data": "Payee Landlord, balance 1200.00 EUR",
      "result": "Confirmation shows 250.75 EUR (AC-7)" }
  ],
  "customFields": { "Requirement": "STO-1421" }
}`,
    },
  },
  {
    id: "d-c11",
    moduleId: "mod-d",
    lessonId: "d-l2",
    topic: "Defect reporting",
    kind: "code-api",
    front: "Which sections does a complete defect report have, in order?",
    back: "Title ([Component] behaviour + impact), Environment/build, Preconditions, numbered Reproduction steps, Expected (with source cited), Actual (facts only), Evidence, Severity with one-line rationale.",
    code: {
      lang: "markdown",
      caption: "Report skeleton",
      content: `[Transfer] Confirmation truncates amount to whole euros
Environment: Retail web 24.10.3, Chrome 141, NL-UAT-2
Preconditions: Retail user, balance 1,200.00 EUR
Steps: 1) New transfer 2) payee Landlord 3) amount 250.75 4) Submit
Expected (AC-7): confirmation shows 250.75 EUR
Actual: confirmation shows 250 EUR; history shows 250.75 debit
Evidence: confirmation.png, response.har
Severity: Major - customer-visible wrong amount; ledger correct`,
    },
  },
  {
    id: "d-c12",
    moduleId: "mod-d",
    lessonId: "d-l4",
    topic: "Traceability",
    kind: "code-api",
    front: "A Test Run fails during execution. Which links make the traceability chain complete?",
    back: "Execution verdict Fail on the run, the run linked to the defect, and the defect linked back to the run (not just to the story). Impact analysis reads exactly this edge when the code changes.",
    code: {
      lang: "json",
      caption: "Linking a defect to a failed run (Jira issue link payload)",
      content: `{
  "type": { "name": "Defect" },
  "inwardIssue": { "key": "NL-4812" },
  "outwardIssue": { "key": "NL-4890" },
  "comment": {
    "body": "Fails Test Run NL-4890 (step 1): confirmation showed 250 EUR, expected 250.75 per AC-7. Build 24.10.3, NL-UAT-2."
  }
}`,
    },
  },
];

export const challengesD: Challenge[] = [
  {
    id: "d-ch1",
    moduleId: "mod-d",
    title: "File the defect: double overdraft fee",
    kind: "defect-report",
    minutes: 15,
    brief: "Turn a messy observation into a complete, professional defect report.",
    context:
      "You are testing the overdraft engine of Northlake Bank's retail portal. On 2026-10-31 you notice customer account *4471 (overdraft limit 500.00 EUR, monthly fee 4.90 EUR) was charged the monthly overdraft fee twice - once at 00:03 and once at 00:07. The ledger shows two separate fee transactions of 4.90 EUR each; the fee schedule document FS-112 section 3.2 says 'the monthly overdraft fee is charged once per statement month'. The customer's balance is now 9.80 EUR lower than specified. Other overdraft accounts checked: one more account (*8814) shows the double charge; two others are correct. Build: retail-core 24.10.2, environment NL-UAT-2. You have screenshots of both ledger lines and the fee schedule paragraph.",
    hints: [
      "Start with the title pattern: [Component] wrong behaviour + impact. One line.",
      "Expected result must cite the source - FS-112 section 3.2 - not just your opinion of fairness.",
      "Actual result is a fact list: two transactions, times, amounts, account. Interpretation ('the scheduler ran twice') goes in a separate note.",
    ],
    solution: `Title: [Overdraft] Monthly fee charged twice in one statement month for affected accounts

Environment: retail-core 24.10.2, environment NL-UAT-2
Preconditions: Retail account with overdraft limit 500.00 EUR and monthly fee 4.90 EUR (per FS-112); statement month October 2026.

Steps:
1. Open account *4471 transaction history for 2026-10-31.
2. Filter transaction type "Fee".

Expected (FS-112 s3.2): exactly one monthly overdraft fee of 4.90 EUR per statement month.

Actual: two fee transactions of 4.90 EUR each, 00:03 and 00:07, both posted to the ledger; balance is 9.80 EUR below the specified value.

Evidence: ledger_screenshot_4471.png, fee_schedule_s3.2.png. Also observed on account *8814; accounts *5502 and *7719 charged once (pattern unclear).

Severity: Critical rationale - direct incorrect money movement affecting customer balances; wrong charges already posted to the ledger, not a display defect.

Note (hypothesis, to verify): the 00:03/00:07 pair suggests the fee job ran twice; needs confirmation from job logs - interpretation, not fact.`,
    rubric: [
      "Title follows [Component] behaviour + impact and can be classified without opening the ticket",
      "Environment and preconditions make the scenario reproducible without asking you anything",
      "Expected result cites FS-112 s3.2, not personal opinion",
      "Actual result is a fact list (two transactions, times, amounts) with interpretation separated",
      "Severity is Critical with a money-impact rationale, and the rationale says why",
      "Evidence attachments are named and the scope note (which accounts affected) is included",
    ],
  },
  {
    id: "d-ch2",
    moduleId: "mod-d",
    title: "A fee-calculation fix ships Thursday",
    kind: "regression",
    minutes: 12,
    brief: "Choose the confirmation and regression scope for a defect fix, with rationale you could defend in triage.",
    context:
      "Defect NL-4812 ('monthly overdraft fee charged twice') is fixed by changing the fee-scheduler query in retail-core. The fix ships in Thursday's release 24.11. The scheduler also handles: interest accrual, maintenance fees, and FX revaluation runs - all using the same job framework but different queries. The transfers module is untouched by this change but shares the ledger service. The release notes mention no other changes. Your regression suite: fee tests (12), scheduler framework tests (8), interest tests (6), transfers smoke (10), full ledger reconciliation pack (25). Time budget: half a day of manual testing.",
    hints: [
      "Confirmation scope = the defect itself: the exact failing scenario plus the boundary around 'once per statement month'.",
      "Regression scope comes from impact analysis: what shares code or services with the change?",
      "You cannot run everything - justify what you drop, in one line each. That justification is the deliverable.",
    ],
    solution: `Confirmation (NL-4812):
- Re-run the exact double-fee scenario on accounts *4471 and *8814 (one fee per statement month, FS-112 s3.2).
- Boundary checks: month boundary (31 Oct -> 1 Nov), account with overdraft opened mid-month, zero-fee account.

Regression (impact analysis on the changed query and its shared pieces):
- Full fee pack (12): the changed query serves all fee types - maintenance fees could regress even though the defect was overdraft.
- Scheduler framework tests (8): same job framework, changed query could break scheduling/locking.
- Ledger reconciliation pack (25), reduced to the fee-posting subset (~6): the fix posts to the same ledger service; full pack does not fit the budget.
- Interest tests: dropped - separate queries, separate job, no shared code with the change; noted in the release ticket.
- Transfers smoke (10): dropped - module untouched and only shares the read path of the ledger service; noted.

Documentation: the run sheet lists every decision with a one-line rationale (run or drop), executed in Xray as Test Execution "24.11 - NL-4812 confirmation + regression".`,
    rubric: [
      "Confirmation scope is the exact defect scenario plus nearby boundaries (month edge, mid-month, zero-fee)",
      "Regression scope includes the fee pack and scheduler framework tests, justified by shared code",
      "Ledger subset chosen explicitly because the full pack does not fit the time budget",
      "Dropped suites each have a one-line written rationale",
      "The plan is recorded as an executable run sheet (Xray Test Execution), not just described",
    ],
  },
  {
    id: "d-ch3",
    moduleId: "mod-d",
    title: "Defect workflow rules under pressure",
    kind: "states",
    minutes: 12,
    brief: "Treat the defect workflow as a state machine and test its transitions - including the invalid ones.",
    context:
      "Northlake's defect workflow rules (from the QA handbook): (1) only the original reporter can move Fixed -> Verified or Closed; (2) only triage can move New -> Triaged or New -> Rejected; (3) Reopen is allowed only within 30 days of closure and only by the reporter; (4) Deferred requires a target release field; (5) Closed tickets cannot be edited except by adding comments; (6) any transition without the required evidence field (repro steps on New, verification evidence on Verified) is invalid. Five situations arrive on the board on the same morning: (a) a developer closes their own fix; (b) triage rejects a defect without writing a reason; (c) the reporter verifies a fix 45 days after closure of a related duplicate; (d) someone defers a defect with no target release; (e) a defect moves to Verified with 'looks good' as the only evidence.",
    hints: [
      "Model states and transitions first: New, Triaged, In progress, Fixed, Verified, Closed, plus side exits.",
      "For each situation, ask: which rule fires? What is the correct state outcome instead?",
      "State transition testing does not stop at valid paths - invalid event/state pairs are the core of the technique.",
    ],
    solution: `(a) Developer closes their own fix -> INVALID: rule 1 - only the reporter verifies/closes. Correct path: Fixed -> (reporter) Verified -> Closed. Test: attempt Fixed->Closed by non-reporter is rejected with a clear error.

(b) Triage rejects without a reason -> INVALID: workflow requires rationale on Rejected (audit rule). Test: New->Rejected with empty reason field must be blocked; with a reason, accepted.

(c) Verify 45 days after closure -> INVALID for reopen (rule 3: within 30 days). Correct path: file a new linked defect with the fresh evidence; the old ticket stays Closed. Test: attempt Reopen on a >30-day-closed ticket - rejected; new-report flow works and carries the link.

(d) Deferred with no target release -> INVALID: rule 4. Test: Triaged->Deferred with empty target-release must be blocked; with a target, accepted.

(e) Verified with 'looks good' -> INVALID: rule 6 requires verification evidence. Test: Fixed->Verified with empty/insufficient evidence must be blocked; with attached evidence, accepted.

Coverage note: each rule yields at least one invalid-transition test (event/state pair the machine must refuse) and one valid path test - that is 0-switch coverage of the workflow model. The pairs (a)-(e) are exactly the tests a workflow configuration change in Jira needs before it ships.`,
    rubric: [
      "Each of the five situations is correctly judged invalid with the specific rule named",
      "The correct alternative path is stated for each (what should happen instead)",
      "At least four invalid-transition tests are derived explicitly from the rules",
      "Valid-path tests are identified alongside the invalid ones (0-switch coverage)",
      "The answer connects the workflow model to what a Jira workflow change must be tested for",
    ],
  },
];
