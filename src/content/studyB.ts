import type { Challenge, ConceptCard } from "../types/content";

export const cardsB: ConceptCard[] = [
  {
    id: "b-c1",
    moduleId: "mod-b",
    lessonId: "b-l1",
    topic: "Lifecycle",
    kind: "definition",
    front: "What does the V-model pair each development stage with?",
    back: "A test level: user requirements <-> acceptance testing; system specification <-> system testing; architecture/design <-> integration testing; detailed design <-> unit (component) testing. The pairing makes test preparation start as soon as its basis is written.",
  },
  {
    id: "b-c2",
    moduleId: "mod-b",
    lessonId: "b-l1",
    topic: "Lifecycle",
    kind: "compare",
    front: "Sequential vs iterative models - what changes for testing?",
    back: "Sequential: big-bang phases, requirements freeze early, testing concentrated late (risk: late discovery). Iterative: small slices delivered repeatedly, testing continuous within each iteration, regression dominant (risk: constant re-test burden without automation).",
  },
  {
    id: "b-c3",
    moduleId: "mod-b",
    lessonId: "b-l2",
    topic: "Test levels",
    kind: "definition",
    front: "Name the four main test levels and the scope of each",
    back: "Component/unit: one unit in isolation. Component integration: interactions between units. System: the whole system against its specification. Acceptance: fitness for purpose by/for users and stakeholders (plus system-integration testing across organisational boundaries).",
  },
  {
    id: "b-c4",
    moduleId: "mod-b",
    lessonId: "b-l2",
    topic: "Test levels",
    kind: "scenario",
    front: "A defect appears only when the transfer service feeds the email formatter through the full stack. Which level should own a test for it, and why the lowest possible?",
    back: "An integration test of service -> formatter (or system test if the seam is only reachable end-to-end). Prefer the lowest level that can see the defect: faster, cheaper, more stable than UI end-to-end, and it pinpoints the failing seam.",
  },
  {
    id: "b-c5",
    moduleId: "mod-b",
    lessonId: "b-l3",
    topic: "Regression",
    kind: "compare",
    front: "Confirmation testing vs regression testing",
    back: "Confirmation (retesting): re-run the exact failing tests to prove the defect is fixed - scope = the change. Regression: re-run (or select from) the wider suite to prove the change broke nothing else - scope = everything the change could plausibly affect, chosen by impact analysis.",
  },
  {
    id: "b-c6",
    moduleId: "mod-b",
    lessonId: "b-l3",
    topic: "Test types",
    kind: "compare",
    front: "Functional vs non-functional testing",
    back: "Functional: WHAT the system does - transfer, validate, reject, report. Non-functional: HOW WELL - performance, security, usability, reliability, accessibility. Both derive from requirements; both exist at every test level.",
  },
  {
    id: "b-c7",
    moduleId: "mod-b",
    lessonId: "b-l3",
    topic: "Test types",
    kind: "definition",
    front: "Black-box vs white-box testing",
    back: "Black-box: tests derived from specification/behaviour without seeing internals (BVA, EP, decision tables). White-box: tests derived from code structure - statement and branch coverage, path analysis. Grey-box mixes both, common in API testing.",
  },
  {
    id: "b-c8",
    moduleId: "mod-b",
    lessonId: "b-l4",
    topic: "BDD",
    kind: "definition",
    front: "What is BDD, in one breath?",
    back: "Behaviour-driven development: business, development, and testing collaborate on concrete examples of desired behaviour (usually Given/When/Then), turn them into executable specifications, and keep them as living documentation. The conversation is the core; the tooling is optional.",
  },
  {
    id: "b-c9",
    moduleId: "mod-b",
    lessonId: "b-l4",
    topic: "Shift-left",
    kind: "scenario",
    front: "Your team's defects are 80% requirement misunderstandings found in UAT. Name a shift-left response.",
    back: "Move detection to refinement: three-amigos discussions with concrete examples, testable acceptance criteria with boundaries stated, requirement reviews with a testing checklist, and acceptance tests written before coding (ATDD). Cheaper than UAT rounds by an order of magnitude.",
  },
  {
    id: "b-c10",
    moduleId: "mod-b",
    lessonId: "b-l5",
    topic: "CI/CD",
    kind: "definition",
    front: "What quality gates does a typical CI/CD pipeline contain?",
    back: "Commit stage: build + static analysis + unit tests. Merge/test stage: integration + API/contract tests. Staging: system/E2E smoke + non-functional gates (performance budget, security scan, accessibility). Pre-release: human gates - exploratory findings reviewed, UAT, and in regulated banks change-advisory sign-off.",
  },
  {
    id: "b-c11",
    moduleId: "mod-b",
    lessonId: "b-l5",
    topic: "Maintenance",
    kind: "scenario",
    front: "A bank upgrades its core and migrates 12M accounts. Beyond new features, what must maintenance testing cover?",
    back: "Migration/retirement trigger: data reconciliation (record counts, balance checksums old vs new), continuity of interest accruals across the switch, downstream interfaces and reports, plus full regression on critical paths. Silent data corruption is the worst-case escape here.",
  },
  {
    id: "b-c12",
    moduleId: "mod-b",
    lessonId: "b-l5",
    topic: "CI/CD",
    kind: "code-api",
    front: "Pipeline: unit 6 min, integration 14 min, E2E smoke 22 min, nightly full regression 3 h. Release candidates wait 45 min for feedback. What would you do first?",
    back: "Attack the feedback loop at its slowest *blocking* stage: parallelise the E2E smoke (22 min for smoke suggests sequential UI runs) and profile the integration suite for outliers. Move checks left where possible (contract tests can replace some E2E). Measure flake while you are in there - a red herring costs as much as a real failure.",
  },
];

export const challengesB: Challenge[] = [
  {
    id: "b-ch1",
    moduleId: "mod-b",
    title: "Select regression tests after a change",
    kind: "regression",
    minutes: 15,
    brief: "A small fix touches shared code. Choose a defensible regression set and justify every inclusion and exclusion.",
    context:
      "Change under review: a defect fix in the shared `Money.parse()` utility used by: (1) funds transfer, (2) statements, (3) tax reporting, (4) the payee search, and (5) the marketing microsite banner (shows prices).\n\nThe fix changes how four-decimal inputs are rounded (previously truncated).\n\nAvailable regression suites and costs:\n- S1 transfer core regression: 40 min, high value\n- S2 statements end-to-end: 90 min\n- S3 tax reporting: 120 min (quarterly run anyway)\n- S4 payee search unit+integration: 15 min\n- S5 marketing banner smoke: 10 min\n- Full regression (all suites): 4 h 55 min total\n\nYou have one 8-hour day that also contains exploratory testing and a release meeting. Which suites do you run, in what order, and what do you deliberately not run? What extra tests would you design beyond the existing suites?",
    hints: [
      "Who consumes the changed behaviour? Rounding vs truncation of 4-decimal inputs matters most where money amounts are stored, summed, or reported - less where a string is merely displayed.",
      "Order matters when time is short: run cheap, high-relevance suites first? Or highest risk first? Decide and justify.",
      "Existing suites cover the past. The *change* is new: what targeted tests would you add for the rounding behaviour itself (half-up? half-even? negative amounts? zeros)?",
    ],
    solution:
      "A strong answer looks like:\n\n**Run**: S1 (money moved - highest risk, 40 min), S2 (statements recompute and display stored amounts - rounding visible to customers, 90 min), S4 (cheap, exercises the parser broadly, 15 min).\n\n**Judgement call - S3**: tax reporting is exactly where rounding policy is regulated (e.g., banker's rounding vs half-up). Run it if time allows after S1/S2/S4 (120 min); if not, run a targeted subset: any test asserting a value with >2 decimals, plus one reconciliation check. Flag explicitly.\n\n**Skip with rationale**: S5 - the banner displays a formatted string from a different service and does not parse four-decimal user input; 10 min is cheap but the *reasoning* is what matters (no consumption of the changed path).\n\n**New targeted tests (the missing part)**: parse('1.0055') -> assert documented rounding policy; negative values; '0.0000'; values at parse boundaries (max precision, integer strings, trailing zeros); a property test comparing Money.parse against the old behaviour to enumerate every divergence, so the team sees the full blast radius of the fix.\n\n**Order**: S1 -> S4 (cheap sanity) -> S2 -> S3-subset. Document what was skipped and why - the release decision needs the gaps, not just the greens.",
    rubric: [
      "Selects suites by consumption of the changed behaviour, not by suite size or habit",
      "Prioritises money-movement and customer-visible reporting (S1, S2)",
      "Gives an explicit skip with a reason (S5) rather than running everything",
      "Flags S3 as a judgement call with a mitigation (subset/reconciliation)",
      "Designs new tests for the rounding change itself, including divergences old vs new",
      "States the ordering rationale under the time constraint",
      "Documents what was not run - release-decision honesty",
    ],
  },
  {
    id: "b-ch2",
    moduleId: "mod-b",
    title: "Interpret an API response like an API tester",
    kind: "api-response",
    minutes: 12,
    brief: "A transfer API response is in front of you. Find what is wrong, what is unverifiable, and what you would report.",
    context:
      "POST /api/v1/transfers was called with: payeeId \"py-991\", amount 250.755, currency \"EUR\", executionDate \"2026-02-30\".\n\nThe service returned HTTP 200 with:\n\n```json\n{\n  \"id\": \"tr-88123\",\n  \"status\": \"SCHEDULED\",\n  \"amount\": 250.75,\n  \"currency\": \"EUR\",\n  \"executionDate\": \"2026-02-30\",\n  \"createdAt\": \"2026-02-30T14:22:09Z\",\n  \"links\": { \"self\": \"/api/v1/transfers/tr-88123\" }\n}\n```\n\nSpec summary: amounts have 2 decimals and must be 1.00-10,000.00; executionDate must be a valid ISO date, not in the past; the response must echo the *submitted* amount and include a payee reference.\n\nList every problem you can find with this response, classify each (defect / unverifiable / question for the team), and write the one-line defect title you would file for the clearest one.",
    hints: [
      "Count the problems in the request itself first: the request contained a three-decimal amount and an impossible date (30 February). What did the API do with each?",
      "200 means success - did every input rule actually pass? Compare submitted vs echoed values.",
      "What is *missing* from the response that the spec promised? (payee reference)",
    ],
    solution:
      "Findings a strong answer lists:\n\n**Defects**\n1. Impossible date accepted: executionDate '2026-02-30' is not a valid calendar date; the spec requires a valid ISO date. 200 + SCHEDULED for an unschedulable date is a validation defect.\n2. Three-decimal amount accepted and silently rounded: request 250.755 -> response 250.75. The spec says amounts have 2 decimals; the service should reject (400) with a field error, not silently coerce - silent coercion hides caller bugs.\n3. Response does not echo the submitted amount as required (related to 2: spec says echo submitted value).\n4. Missing payee reference: spec requires it; absent from the response body.\n\n**Unverifiable from this exchange**\n- Whether createdAt's date is plausible relative to the request (we do not know the wall clock; also suspicious if the transfer was really created on the impossible date).\n- Whether the transfer was actually persisted with the rounded or submitted amount (need a GET /transfers/tr-88123 and the account ledger).\n\n**Questions for the team**\n- Is rounding policy defined anywhere (half-up vs half-even)? If coercion is intended, the spec must say so and the response should flag it.\n- Should past-date validation be enforced against server time in UTC or the customer's timezone?\n\n**One-line title**: '[Transfers API] POST /transfers accepts invalid executionDate 2026-02-30 and 3-decimal amount, returns 200 SCHEDULED with silently rounded amount'.\n\nMeta-point: API testing = contract verification. Status code alone says almost nothing; every field is an assertion, and the *request* is part of the test design.",
    rubric: [
      "Identifies the invalid date accepted as a defect",
      "Identifies silent amount rounding/coercion as a defect",
      "Notes the response does not echo the submitted amount per spec",
      "Notes the missing payee reference",
      "Separates defects from unverifiable items and open questions",
      "Writes a specific, actionable defect title",
      "Connects findings to the contract/spec rather than intuition",
    ],
  },
  {
    id: "b-ch3",
    moduleId: "mod-b",
    title: "Diagnose a flaky automation test",
    kind: "flaky",
    minutes: 15,
    brief: "A Selenium test fails 'randomly'. Diagnose the likeliest causes and fix the test properly, not with a sleep.",
    context: `A Selenium test from the payments suite:

\`\`\`java
@Test
public void transferConfirmationShowsAmount() {
  driver.get(BASE_URL + "/transfer");
  driver.findElement(By.id("amount")).sendKeys("250.00");
  driver.findElement(By.xpath("/html/body/div[2]/div/form/div[3]/button")).click();
  Assert.assertTrue(driver.getPageSource().contains("250.00"));
}
\`\`\`

Symptoms: passes locally 'always', fails in CI roughly 1 run in 4, with either \`NoSuchElementException\` on the button or \`AssertionError\` on the amount. The confirmation screen renders amounts asynchronously after a spinner. The team's proposed fix: wrap everything in \`Thread.sleep(5000)\` and retry the whole test twice.

List every smell you can find, explain each likely failure mode, and describe the fix you would actually make.`,
    hints: [
      "Two failure symptoms = at least two problems. NoSuchElementException on click vs AssertionError on assert - what causes each?",
      "Absolute XPath from the root is a maintenance and timing landmine. What is a stable locator strategy?",
      "getPageSource().contains() - what happens if the spinner shows '250.00' somewhere, or the amount renders after the assert runs? What is a precise wait for a precise element?",
    ],
    solution:
      `Smells and failure modes a strong answer finds:

1. **No synchronisation with async rendering** -> the click or the assert races the app. CI machines are slower/parallel, so the race appears 'randomly'. Fix: explicit wait for a *specific* expected condition (element visible with exact text), never blanket sleeps.
2. **Absolute XPath** \`/html/body/div[2]/...\` -> breaks on any DOM shuffle; also slower. Fix: stable locator - id, data-testid, or short relative XPath/CSS anchored on semantics.
3. **Weak assertion**: \`getPageSource().contains("250.00")\` -> matches the amount anywhere (input echo, spinner text, unrelated transaction) and nothing about structure. Fix: assert a scoped element's exact text (confirmation amount label).
4. **No wait between sendKeys and click** is usually fine, but combined with rerenders (React re-mount) the reference can go stale -> \`StaleElementReferenceException\`, cousin of the NoSuchElement symptom.
5. **Retrying the whole test** hides real defects and flake alike - makes the suite lie. Retry only as a last-resort quarantine with tracking, not as the fix.
6. **Thread.sleep(5000)**: worst of both - slow *and* still unreliable (5 s is not an upper bound on reality).

**Fixed sketch** (Java/Selenium, idiom):

\`\`\`java
By confirmAmount = By.cssSelector("[data-testid=confirmation-amount]");
driver.findElement(By.id("amount")).sendKeys("250.00");
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.elementToBeClickable(By.id("submit-transfer"))).click();
String shown = new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.visibilityOfElementLocated(confirmAmount)).getText();
Assert.assertEquals("EUR 250.00", shown);
\`\`\`

Plus: run it against a throttled CI-like profile locally (CPU throttle) before declaring victory, and add the test to a flake dashboard for two weeks. Diagnosis beats retries.`,
    rubric: [
      "Identifies missing explicit waits as the core race condition",
      "Rejects Thread.sleep with the reason (slow AND still unreliable)",
      "Identifies absolute-XPath fragility and proposes stable locators",
      "Identifies the page-source contains() assertion as too weak and scopes it",
      "Explains why CI (slower, parallel) exposes races that local runs hide",
      "Rejects blanket retries as masking failures",
      "Provides a corrected code approach with a scoped assertion",
    ],
  },
];
