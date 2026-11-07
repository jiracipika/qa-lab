/** Module E lessons: API testing (HTTP, Postman/Bruno, JSON validation, auth, automation). */

import type { Lesson } from "../types/content";

export const lessonsE: Lesson[] = [
  {
    id: "e-l1",
    moduleId: "mod-e",
    title: "HTTP for testers: requests, responses, and status codes",
    minutes: 7,
    objectives: [
      "Read a request/response pair and identify method, headers, body, and status",
      "Classify status codes into 2xx/3xx/4xx/5xx and name the common ones",
      "Explain idempotency and why it matters for retries",
    ],
    blocks: [
      {
        kind: "prose",
        text: "The UI hides the conversation underneath it: every button click becomes an HTTP request with headers and a body, and every screen is one response rendered. API testing means reading that conversation directly - which is where the truth lives. When the UI copes gracefully with a broken response, the defect still exists; it is just wearing a disguise.",
      },
      {
        kind: "definition",
        term: "REST",
        text: "An architectural style for networked APIs: resources identified by URLs, manipulated through HTTP methods with standard status codes, typically stateless interactions and JSON representations. Most 'REST' APIs in practice are resource-oriented HTTP APIs - which is exactly what testers verify.",
        glossaryId: "rest",
      },
      {
        kind: "diagram",
        diagramId: "api-request-flow",
        note: "Click each stage of the round trip: this is the conversation the UI hides - and the one you will read directly when you test APIs.",
      },
      {
        kind: "list",
        items: [
          "**2xx success** - 200 read something (balance fetched), 201 created something (transfer booked), 204 deleted something (payee removed, no body).",
          "**4xx the caller's problem** - 400 malformed request, 401 no or invalid credentials, 403 authenticated but not allowed, 404 unknown resource, 409 conflict (duplicate payee), 422 valid syntax but semantically rejected, 429 rate limited.",
          "**5xx the server's problem** - 500 unhandled error, 503 unavailable. A 4xx is usually *correct behaviour per the spec*; a 5xx is almost always a defect to report.",
          "**3xx** - redirects. Rare in clean JSON APIs; if you meet one unexpectedly, that is a finding.",
        ],
      },
      {
        kind: "prose",
        text: "**Idempotency** is the property that repeating a request has the same effect as doing it once. GET, PUT, and DELETE are idempotent by specification; POST is not - and that asymmetry is why double-submit and retry bugs live in POST endpoints. Payment APIs solve it with an idempotency key: the client sends the same key on retries, and the server returns the original result instead of charging twice. When you test retries and double-clicks, you are testing exactly this.",
      },
      {
        kind: "example",
        title: "Two ways to reject a transfer",
        text: "Send `not-json{{` as the body: the server cannot parse it at all, so 400 is correct. Now send valid JSON with amount 0.001: parseable, but semantically out of range - 422 (or 400 per that API's convention) is correct. Two different failure classes, two different codes, and your report is stronger for knowing which one the contract promises.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Status codes are part of the contract",
        text: "An API that returns 200 with an error object inside is a defect - even if the UI copes and even if the data looks fine. Clients and monitoring reason about status codes; a lying status breaks every one of them.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating every 4xx as a bug",
        fix: "A 4xx is often the system correctly rejecting bad input - exactly what the contract demands. Compare against the API documentation before reporting.",
      },
      {
        mistake: "Concluding 'the API is down' from a single 500",
        fix: "One 500 with a request id, timestamp, and payload is a defect report. An outage is a pattern - capture several instances before you claim one.",
      },
    ],
    confusedWith: [
      {
        a: "401 Unauthorized",
        b: "403 Forbidden",
        tell: "401 means 'who are you?' - credentials missing, invalid, or expired. 403 means 'I know exactly who you are, and you may not do this.'",
      },
    ],
    recap: [
      "2xx succeeded, 4xx the caller erred (often correctly), 5xx the server broke - report 5xx.",
      "400 vs 422: unparseable vs semantically rejected - different defect classes.",
      "POST is not idempotent; retries need an idempotency key or they double-charge.",
    ],
  },
  {
    id: "e-l2",
    moduleId: "mod-e",
    title: "Testing REST APIs with Postman and Bruno",
    minutes: 8,
    objectives: [
      "Organise requests into collections with environments and variables",
      "Write response assertions in Postman's test script",
      "Explain why text-based, git-friendly collections help banking teams",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A collection is the manual tester's API workbench: every request saved, parameterised, and assertable, so testing an endpoint is a click instead of a rebuild. The craft is in the structure - which folders exist, what lives in environments, and where assertions check the contract instead of eyeballing the pretty response view.",
      },
      {
        kind: "list",
        items: [
          "**Collections and folders** - one folder per service or domain (payments, payees, auth).",
          "**Environments** - dev, UAT, prod-lookalike: same collection, different {{baseUrl}} and credentials.",
          "**Variables** - {{baseUrl}}, {{customerId}}, {{token}}: nothing hard-coded, everything swappable.",
          "**Pre-request scripts** - fetch or refresh a token before the request needs it.",
          "**Test scripts** - assertions on status, headers, and body (pm.test in Postman; Bruno has its own chai-style assertions).",
          "**Request chaining** - create a payee, capture its id from the response, use it in the next request.",
        ],
      },
      {
        kind: "code",
        code: {
          lang: "javascript",
          caption: "Postman test script: assert the transfer contract",
          content: `pm.test("creation returns 201 with a CREATED body", () => {
  pm.response.to.have.status(201);
  const body = pm.response.json();
  pm.expect(body.status).to.eql("CREATED");
  pm.expect(body.amount).to.be.a("number");
  pm.expect(body.amount).to.eql(250.75);
  pm.expect(body.ledgerRef).to.be.a("string").and.not.empty;
});`,
        },
      },
      {
        kind: "prose",
        text: "**Bruno** takes a different bet: collections are plain-text folders that live in your repository - reviewable in pull requests, diffable, versioned with the code, no cloud account required. For banking teams that is not a stylistic preference: it means the API tests are auditable artifacts, they never leave the network, and a change to a critical request shows up in code review. Postman counters with richer team collaboration and cloud features. The honest answer is to choose per your organisation's constraints - and to know what you gain and give up either way.",
      },
      {
        kind: "example",
        title: "Chaining: the payee round trip",
        text: "POST /api/payees (201) -> capture body.id into a variable -> GET /api/payees/{id} (200) -> assert the fetched payee's name and IBAN match what you sent -> DELETE it (204) -> GET again (404). One chained scenario exercises create, read, and delete with data that provably connects - far stronger than four unrelated requests.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "One collection, one purpose",
        text: "Keep a small smoke pack (runs in CI, under two minutes), a fuller regression pack, and a scratch/debug space. The moment your CI pack contains everything, it is too slow to gate anything.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Hard-coding tokens and passwords in collections",
        fix: "Use environment variables and inject secrets at runtime. A committed file with a live token is an incident, not a shortcut - it is shared and retained forever.",
      },
      {
        mistake: "One mega-collection holding everything",
        fix: "Split smoke, regression, and debug packs. CI points at smoke; the rest runs on demand or nightly.",
      },
    ],
    recap: [
      "Environments swap the where, variables swap the what - nothing hard-coded.",
      "Assertions in scripts turn a response viewer into a test.",
      "Text-based collections (Bruno) are reviewable and auditable - a banking feature, not a fad.",
    ],
  },
  {
    id: "e-l3",
    moduleId: "mod-e",
    title: "Validating response bodies: JSON paths and schemas",
    minutes: 8,
    objectives: [
      "Navigate JSON with dot and bracket paths, including arrays",
      "Assert field values, types, and presence - not just status codes",
      "Use JSON Schema to check the whole response shape at once",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A 201 with a wrong body is a defect wearing a green hat. The status code says the server thinks it created something; the body is where you check *what* it created. Body validation has two layers: precise assertions on the fields that matter, and a schema check that guards the whole shape at once.",
      },
      {
        kind: "list",
        items: [
          "**Dot paths** - `confirmation.amount` walks into nested objects.",
          "**Array indexing** - `items[0].id` takes the first element; better, find by a field (`items.find(i => i.type === 'FEE')`) when order is not guaranteed.",
          "**Type assertions** - `amount` must be a *number*: \"250.75\" as a string looks fine on screen and breaks accounting downstream.",
          "**Presence and absence** - required fields exist; fields that should be null on this path are actually null.",
          "**Status inside the body** - many APIs carry `status: \"CREATED\"` in the body; assert it agrees with the HTTP status.",
        ],
      },
      {
        kind: "definition",
        term: "JSON Schema",
        text: "A vocabulary for describing the structure of JSON documents: required fields, types, ranges, patterns, and nesting. Validating a response against its schema catches shape drift - missing or renamed fields, wrong types - in a single check.",
        glossaryId: "json-schema",
      },
      {
        kind: "code",
        code: {
          lang: "json",
          caption: "Schema for the transfer confirmation body",
          content: `{
  "type": "object",
  "required": ["status", "amount", "currency", "ledgerRef"],
  "properties": {
    "status": { "type": "string", "const": "CREATED" },
    "amount": { "type": "number", "exclusiveMinimum": 0 },
    "currency": { "type": "string", "minLength": 3, "maxLength": 3 },
    "ledgerRef": { "type": "string", "minLength": 1 }
  },
  "additionalProperties": true
}`,
        },
      },
      {
        kind: "prose",
        text: "Schema checks and field assertions are complements, not rivals. The schema catches **shape drift**: a teammate renames `ledgerRef` to `reference`, or starts returning amount as a string - one validation fails and names the exact violation, across the entire body, even for fields you never thought to assert. Field assertions pin **business values**: this specific transfer really did echo 250.75 and really did book to the right ledger reference. A schema alone cannot prove the right number; assertions alone cannot prove the shape still holds.",
      },
      {
        kind: "example",
        title: "The string amount",
        text: "The response reads {\"amount\": \"250.75\"}. It renders correctly in the UI, a naive truthiness check passes, and a screenshot looks perfect. Weeks later a reconciliation job sorts amounts as strings and 9999.99 sorts before 1000.00. The schema above - `\"type\": \"number\"` - fails this response instantly, at the boundary where it is cheapest to fix.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "Do not assert the whole body verbatim",
        text: "Full-body equality snapshots break the first time the backend harmlessly adds a field. Assert the fields the contract promises - types, required keys, business values - and let additive changes pass.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Asserting only the status code",
        fix: "The status says something was created; the body says *what*. Assert both, every time.",
      },
      {
        mistake: "Snapshotting the entire response and comparing it verbatim",
        fix: "Assert contract fields and types. Verbatim snapshots make every harmless backend addition a test failure.",
      },
    ],
    recap: [
      "Paths navigate; types matter (number, not string); status fields inside bodies must agree with HTTP status.",
      "Schema validation catches shape drift in one check; field assertions pin business values.",
      "Assert what the contract promises - not the whole body verbatim.",
    ],
  },
  {
    id: "e-l4",
    moduleId: "mod-e",
    title: "Authentication and session testing",
    minutes: 7,
    objectives: [
      "Test the 401/403 boundary with missing, invalid, and expired credentials",
      "Handle tokens in automation without leaking secrets",
      "Recognise what belongs to auth middleware versus business logic",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Auth is the part of an API where defects cost the most and get tested the least. The happy path - valid token, allowed action - is the only case anyone tries. The interesting cases are everything around it: no token, a tampered token, an expired one, a valid token for the wrong person. In banking, that last case has a name worth remembering: IDOR, the classic 'change the account id in the URL' vulnerability class.",
      },
      {
        kind: "list",
        items: [
          "**No token** - expect 401, not 500 and not a 200 with an error body.",
          "**Malformed token** - truncated or tampered: 401, and the rejection is at the auth layer.",
          "**Expired token** - 401 with a machine-readable reason; the documented refresh flow works; the old token is dead after refresh.",
          "**Valid token, wrong permission** - 403: authenticated but not authorised for this operation.",
          "**Valid token, someone else's resource** - 403: the IDOR check. Change the account or payee id in the path and the server must refuse.",
          "**Revoked token** - after logout or password change, the old token stops working.",
        ],
      },
      {
        kind: "example",
        title: "Expired token mid-session",
        text: "The contract says: on 401 with code TOKEN_EXPIRED, the client refreshes once and retries the original request. Your test: force an expired token, submit the transfer, assert exactly one refresh and exactly one retry, and the transfer books once. If the client loops refresh-retry on a permanently invalid token, you have built an accidental denial of service against your own backend - a genuinely reportable defect.",
      },
      {
        kind: "prose",
        text: "A useful habit is attributing the rejection: **middleware vs business logic**. A missing scope rejected before the request reaches the handler is middleware behaving; a customer seeing *another customer's* data is business logic failing catastrophically. The 401/403 boundary tells you which layer answered - and therefore where the fix belongs.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "Secrets never live in the repository",
        text: "Tokens pasted into committed collections, environment files, or test code are incidents with a delay. Short-lived test tokens, injected at runtime from a secret store or CI variables - never committed, never shared in chat.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Testing only the happy auth path",
        fix: "Expired, malformed, revoked, and foreign-token cases are where auth defects live. The happy path is the one case the developers already covered.",
      },
      {
        mistake: "Copying a long-lived production token into a test environment file",
        fix: "Use short-lived tokens from the test identity provider, injected at runtime. A committed token outlives everyone's memory of it.",
      },
    ],
    recap: [
      "401 is identity; 403 is permission - the boundary tells you which layer answered.",
      "The IDOR check (own token, someone else's resource id, expect 403) is mandatory in banking.",
      "Secrets are injected at runtime, never committed - a committed token is an incident.",
    ],
  },
  {
    id: "e-l5",
    moduleId: "mod-e",
    title: "Designing API test cases: positive, negative, and boundaries",
    minutes: 7,
    objectives: [
      "Derive API test cases from the endpoint contract: method, fields, and rules",
      "Apply equivalence partitioning and boundary value analysis to API fields",
      "Cover error responses as first-class expectations",
    ],
    blocks: [
      {
        kind: "prose",
        text: "An API document is a specification, and every rule in it is a test condition: 'amount must be 0.01 to 10000.00' is six test cases wearing one sentence. The techniques from Module C apply directly - the fields just happen to travel as JSON instead of form inputs.",
      },
      {
        kind: "list",
        items: [
          "**Happy path per method** - one valid call per operation, asserting status and echoed body.",
          "**Required-field negatives** - each required field missing, one at a time (so you know which one caused it).",
          "**Type negatives** - a string where a number belongs, an object where a string belongs.",
          "**Numeric boundaries** - minus epsilon, min, min+epsilon, max-epsilon, max, max+epsilon.",
          "**String limits** - max length exactly, one over, empty where allowed, unicode and emoji where the field accepts text.",
          "**Auth matrix** - the six credential states from the auth lesson, per endpoint.",
          "**Conflicts** - duplicate creation (409), unknown ids (404), stale updates.",
          "**Pagination edges** - first page, last page, page beyond the end, zero results.",
        ],
      },
      {
        kind: "example",
        title: "The transfer amount boundary set",
        text: "Rule: amount 0.01-10000.00 EUR, two decimals, rejected with 422 AMOUNT_OUT_OF_RANGE. The set: 0.00 (reject), 0.01 (accept), 0.02 (accept), 9999.99 (accept), 10000.00 (accept), 10000.01 (reject). Exactly the Boundary Hunter logic - and the same 2-point/3-point thinking transfers to any numeric field in any API.",
      },
      {
        kind: "diagram",
        diagramId: "boundary-values",
        note: "Click the markers on the number line: the same edges you probe in the UI are the ones you probe in a JSON field.",
      },
      {
        kind: "prose",
        text: "Error responses deserve the same rigor as successes: assert the **status**, the **machine-readable error code** (AMOUNT_OUT_OF_RANGE, not a prose sentence), and the **shape** of the error body. Never assert long human-readable messages verbatim - copywriters edit them, and your tests should not care.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Data-driven beats copy-paste",
        text: "One test with a table of input/expected rows beats thirty duplicated test cases. The table *is* the documentation of the field's contract - and adding a boundary means adding a row, not a function.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Testing only valid inputs",
        fix: "Half the contract is rejection behaviour. Invalid classes are requirements too - untested, they drift silently.",
      },
      {
        mistake: "Picking boundary values by feel",
        fix: "Derive them from the field's stated rule. The 18-65 playground logic applies identically to an amount field or an IBAN length.",
      },
    ],
    recap: [
      "Every rule in the API doc is one or more test conditions.",
      "Boundaries on every numeric rule; error codes asserted like business values.",
      "Data-driven tables document the contract while testing it.",
    ],
  },
  {
    id: "e-l6",
    moduleId: "mod-e",
    title: "Automating API tests: from collections to REST Assured",
    minutes: 8,
    objectives: [
      "Move collection scenarios into code-level tests with REST Assured",
      "Wire an API smoke pack into CI with fast, reliable assertions",
      "Keep API tests stable: test data hygiene, timeouts, and no hidden order",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Collections grow up into code. The same scenarios, expressed in a programming language, gain versioning with the product code, parameterisation, reuse of helpers, and a place in the CI pipeline where they gate every merge. In a Java shop that usually means REST Assured - and the good news is that given/when/then reads like the requests you already scripted.",
      },
      {
        kind: "code",
        code: {
          lang: "java",
          caption: "REST Assured: the same transfer contract, in code",
          content: `given()
    .header("Authorization", "Bearer " + token)
    .contentType(ContentType.JSON)
    .body(new TransferRequest("PY-8814", 250.75))
.when()
    .post("/api/transfers")
.then()
    .statusCode(201)
    .body("status", equalTo("CREATED"))
    .body("amount", equalTo(250.75f))
    .body("currency", equalTo("EUR"))
    .body("ledgerRef", notNullValue());`,
        },
      },
      {
        kind: "prose",
        text: "Placement follows the pyramid: API tests live at the **service layer** - fast, stable, and broad enough to catch contract breaks that unit tests miss, without the flakiness and cost of driving a browser. The UI layer keeps only true journey-level end-to-end checks. When you feel the urge to assert API behaviour through the UI, that is the pyramid telling you to drop a level.",
      },
      {
        kind: "definition",
        term: "Contract testing",
        text: "Testing that a service provider and its consumers agree on the interaction contract - endpoints, payload shapes, status codes - via specifications (OpenAPI) or consumer-driven contracts (Pact). Catches breaking changes before any integration environment does.",
        glossaryId: "contract-testing",
      },
      {
        kind: "list",
        items: [
          "**Unique data per run** - prefix ids with a timestamp or run id; parallel CI runs must never share rows.",
          "**No order dependence** - every test creates what it needs; if deleting payee #5 requires creating #1-4 first, it will fail randomly someday.",
          "**Explicit timeouts** - never the library default forever-and-ever; timeouts are part of the contract too.",
          "**Cleanup or idempotent setup** - leave the environment as you found it, or make setup safe to repeat.",
          "**Retries only for documented transients** - one retry on 503 from a known gateway, never a blind loop that masks real races.",
        ],
      },
      {
        kind: "prose",
        text: "The CI wiring is where the payoff lands: the smoke pack runs on every merge and must stay under roughly two minutes; the deeper pack runs nightly; reports publish where the team reads them. Failures gate the merge; flakes get **quarantined** - moved out of the gate, tracked, and fixed - because a gate that fails randomly trains everyone to ignore it.",
      },
      {
        kind: "diagram",
        diagramId: "ci-pipeline",
        note: "Click each stage: the API smoke pack is the fast gate that fails before a slow UI suite ever runs.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Fast feedback is the point",
        text: "A smoke pack slower than the build it gates gets skipped, then disabled, then deleted. Budget the runtime like a feature, not an afterthought.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Tests that depend on execution order",
        fix: "Each test creates its own data and asserts on its own ids. Order dependence fails randomly in parallel CI - the worst kind of flake.",
      },
      {
        mistake: "Retrying until green",
        fix: "Retry loops mask genuine races and timeout defects. Diagnose the flake, or quarantine it visibly while it is being fixed.",
      },
    ],
    recap: [
      "REST Assured expresses the same contract in code, versioned with the product.",
      "Service layer for API tests; the pyramid keeps UI tests rare and journey-shaped.",
      "Stability is data hygiene: unique ids, no order, explicit timeouts, honest retries.",
    ],
  },
];
