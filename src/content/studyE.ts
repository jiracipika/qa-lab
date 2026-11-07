/** Module E flashcards (all four kinds) and practical challenges. */

import type { Challenge, ConceptCard } from "../types/content";

export const cardsE: ConceptCard[] = [
  {
    id: "e-c1",
    moduleId: "mod-e",
    lessonId: "e-l1",
    topic: "HTTP basics",
    kind: "definition",
    front: "What is idempotency, which HTTP methods have it, and why does it matter for payments?",
    back: "Repeating a request has the same effect as doing it once. GET, PUT, DELETE are idempotent by spec; POST is not - which is why payment APIs add idempotency keys so a retried request cannot charge twice.",
  },
  {
    id: "e-c2",
    moduleId: "mod-e",
    lessonId: "e-l3",
    topic: "Response validation",
    kind: "definition",
    front: "What does validating a response against its JSON Schema catch that field assertions miss?",
    back: "Shape drift across the whole body in one check: missing or renamed fields, wrong types, unexpected structure - including fields you never thought to assert. Field assertions then pin the exact business values.",
  },
  {
    id: "e-c3",
    moduleId: "mod-e",
    lessonId: "e-l6",
    topic: "Automation",
    kind: "definition",
    front: "What is contract testing?",
    back: "Verifying that a service provider and its consumers agree on the interaction contract - endpoints, payload shapes, status codes - via specs (OpenAPI) or consumer-driven contracts (Pact). Catches breaking changes before integration environments do.",
  },
  {
    id: "e-c4",
    moduleId: "mod-e",
    lessonId: "e-l1",
    topic: "Status codes",
    kind: "compare",
    front: "200 OK vs 201 Created - when is each correct?",
    back: "200: a successful read or action that did not create a new resource. 201: a POST that created one, ideally with a Location header or the new resource echoed. Returning 200 for a creation is a contract defect even when the body is right.",
  },
  {
    id: "e-c5",
    moduleId: "mod-e",
    lessonId: "e-l1",
    topic: "Status codes",
    kind: "compare",
    front: "401 Unauthorized vs 403 Forbidden",
    back: "401: identity problem - no token, invalid, or expired ('who are you?'). 403: permission problem - authenticated and known, but not allowed ('I know you; no.'). The boundary tells you whether auth middleware or business logic answered.",
  },
  {
    id: "e-c6",
    moduleId: "mod-e",
    lessonId: "e-l1",
    topic: "HTTP basics",
    kind: "compare",
    front: "PUT vs PATCH",
    back: "PUT replaces the whole resource with the sent representation (idempotent; missing fields typically become empty/default). PATCH applies a partial change (not guaranteed idempotent). Test what each leaves behind: a PUT without a field is a deletion, a PATCH without it is a no-op.",
  },
  {
    id: "e-c7",
    moduleId: "mod-e",
    lessonId: "e-l4",
    topic: "Authentication",
    kind: "scenario",
    front: "Mid-session, every request starts returning 401 with code TOKEN_EXPIRED. What should the client do, and what do you assert?",
    back: "The documented flow: refresh the token once, retry the original request once, succeed. Assert exactly one refresh and one retry, the transfer books once, and a permanently invalid token does NOT loop - a refresh-retry loop is a self-inflicted denial of service.",
  },
  {
    id: "e-c8",
    moduleId: "mod-e",
    lessonId: "e-l1",
    topic: "Status codes",
    kind: "scenario",
    front: "An API returns 500 for submitting an invalid payload (amount as a string). Is this a defect?",
    back: "Yes. Invalid input must be rejected with a 4xx (400/422) - a 500 means the server hit an unhandled path. Invalid input is a designed-for case; crashing is not. Report with request id, payload, and timestamp.",
  },
  {
    id: "e-c9",
    moduleId: "mod-e",
    lessonId: "e-l1",
    topic: "HTTP basics",
    kind: "scenario",
    front: "The user double-clicks Submit; the client retries POST /transfers. How does a well-designed API prevent double payment, and what do you test?",
    back: "An idempotency key: the retry carries the same key, and the server returns the original result instead of creating a second transfer. Test: same key twice -> one transfer, identical response both times; different key -> genuinely new transfer.",
  },
  {
    id: "e-c10",
    moduleId: "mod-e",
    lessonId: "e-l6",
    topic: "Automation",
    kind: "code-api",
    front: "How does a REST Assured test assert the transfer creation contract?",
    back: "given() the request (auth header, content type, body), when() the call, then() the assertions: status 201, status field CREATED, amount as number 250.75, currency EUR, ledgerRef present - the same checks as the Postman script, versioned with the code.",
    code: {
      lang: "java",
      caption: "given / when / then",
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
    .body("ledgerRef", notNullValue());`,
    },
  },
  {
    id: "e-c11",
    moduleId: "mod-e",
    lessonId: "e-l2",
    topic: "Postman and Bruno",
    kind: "code-api",
    front: "What does a proper Postman test script assert on a transfer response?",
    back: "Status 201; body.status CREATED; amount is a number and equals the submitted 250.75; ledgerRef is a non-empty string - never just 'the response looks right' in the viewer.",
    code: {
      lang: "javascript",
      caption: "pm.test assertions",
      content: `pm.test("creation returns 201 with a CREATED body", () => {
  pm.response.to.have.status(201);
  const body = pm.response.json();
  pm.expect(body.status).to.eql("CREATED");
  pm.expect(body.amount).to.be.a("number").and.eql(250.75);
  pm.expect(body.ledgerRef).to.be.a("string").and.not.empty;
});`,
    },
  },
  {
    id: "e-c12",
    moduleId: "mod-e",
    lessonId: "e-l3",
    topic: "Response validation",
    kind: "code-api",
    front: "Which schema rules catch the 'string amount' defect (\"amount\": \"250.75\")?",
    back: "\"type\": \"number\" on the amount property - and exclusiveMinimum > 0 to also reject zero and negatives. One schema validation fails the response the moment the backend starts serialising amounts as strings.",
    code: {
      lang: "json",
      caption: "The amount property, defended",
      content: `"properties": {
  "amount": {
    "type": "number",
    "exclusiveMinimum": 0
  },
  "currency": {
    "type": "string",
    "minLength": 3,
    "maxLength": 3
  }
}`,
    },
  },
];

export const challengesE: Challenge[] = [
  {
    id: "e-ch1",
    moduleId: "mod-e",
    title: "Diagnose the transfer response",
    kind: "api-response",
    minutes: 12,
    brief: "One API call, several defects. Read the response against the contract and file what you find.",
    context:
      "Contract (API doc, transfer creation): POST /api/transfers with a valid token returns 201 Created with body {status: \"CREATED\", amount: <number>, currency: \"EUR\", ledgerRef: <string>}. Amounts are always numbers (two decimals). Rejections use 4xx with a machine-readable error code. What you actually got on the first call: HTTP 200 OK, body {\"status\": \"ERROR\", \"message\": \"Amount below minimum\", \"amount\": \"250.75\", \"ledgerRef\": null}. You sent amount 250.75 - above the documented minimum of 0.01. The ledger system shows the transfer WAS booked once (ledgerRef L-91824 exists). A second identical request returned 201 with the correct documented body.",
    hints: [
      "Compare each field against the documented contract: status code, status field, amount type, ledgerRef.",
      "The ledger says the transfer succeeded - the response body says ERROR. Which one do you trust, and what does that discrepancy risk?",
      "The second call succeeding is evidence, not comfort: intermittent contract behaviour is its own finding.",
    ],
    solution: `Three distinct defects, one report each (or one report with clearly separated findings):

1. Wrong status code and lying body (Critical): first call returned 200 with status "ERROR" and message "Amount below minimum" - yet the transfer WAS booked (ledgerRef L-91824). A client following the contract sees ERROR and retries the exact same amount -> second transfer booked (the second 201 call is exactly that double payment, in the worst case on a real customer). Risk: duplicate charges from retry logic. Expected per contract: 201, status "CREATED". Rationale: incorrect money movement risk from a lying response.

2. Amount serialised as a string (Major): "amount": "250.75" is a string, contract says number. Schema validation fails; downstream accounting that expects numeric amounts breaks (string sorting, precision handling). Expected: amount as number 250.75.

3. Intermittent contract behaviour (Major, investigate): identical request succeeded with the documented body on retry. The first response is not reproducible by spec - race or caching in the confirmation path. Report with both request ids and timestamps; ask developers to check what differed.

Evidence to attach: both raw responses with headers and timestamps, the ledger extract showing L-91824, and the request payloads (identical).`,
    rubric: [
      "Identifies the lying body: 200 + status ERROR while the ledger shows success - the most dangerous finding",
      "Explains the double-payment risk: retry logic reading ERROR would re-submit an already-booked transfer",
      "Separately flags the string amount against the documented number type",
      "Treats the successful retry as its own intermittent-behaviour finding, with request ids/timestamps as evidence",
      "Cites the documented contract (201, CREATED, number) as the expected result, not personal preference",
      "Assigns severity with a money-movement rationale, not a UI-impact rationale",
    ],
  },
  {
    id: "e-ch2",
    moduleId: "mod-e",
    title: "Test cases for the payee endpoint",
    kind: "test-cases",
    minutes: 15,
    brief: "Turn an endpoint contract into a structured, data-driven set of API test cases.",
    context:
      "Contract: POST /api/payees creates a payee for the authenticated customer. Request: {\"name\": string, 1-70 chars, required, unique per customer}, {\"iban\": string, valid checksum, required}, {\"nickname\": string, 0-35 chars, optional}. Responses: 201 with {id, name, iban, nickname}; 400 malformed JSON; 409 duplicate name for the same customer; 422 IBAN_CHECKSUM_FAILED; 401 no/invalid token; 403 token of another customer. Design the test set as a data-driven table: for each case give input, expected status, and the one assertion that proves it (beyond the status code).",
    hints: [
      "Start with one happy path per behaviour the contract promises, then attack each field rule separately.",
      "Boundaries: name length 1, 70, 71; nickname omitted vs empty vs 35 vs 36 chars.",
      "Auth is a row too: 401 and the 403 IDOR check belong in the table, not in a separate suite you never write.",
    ],
    solution: `Happy paths:
- Valid payee, nickname present -> 201; assert echoed name + iban match the request and id is non-empty.
- Valid payee, nickname omitted -> 201; assert nickname is null or empty per contract.

Name field:
- Name of exactly 1 char -> 201 (boundary minimum).
- Name of exactly 70 chars -> 201 (boundary maximum).
- Name of 71 chars -> 422-style rejection per contract error code; assert the error names the offending field.
- Empty name -> rejected; assert the error code targets "name", not a generic error.
- Duplicate name for the same customer -> 409; assert the error identifies the conflict (and that the 201 from the first creation is untouched).

IBAN field:
- Valid-checksum IBAN -> 201 (assert echoed iban unchanged - no silent reformatting).
- Wrong checksum, right format -> 422 with IBAN_CHECKSUM_FAILED.
- Missing iban -> rejected with a field-specific error.

Nickname field:
- Exactly 35 chars -> 201 (boundary maximum).
- 36 chars -> rejected; error targets "nickname".

Auth matrix:
- No Authorization header -> 401; assert machine-readable code, not a prose message.
- Expired token -> 401 TOKEN_EXPIRED; documented refresh flow then succeeds.
- Valid token of customer B creating a payee that duplicates customer A's name -> 201 or 409 per business rule, and crucially customer B's list never contains customer A's payees (IDOR-adjacent check).

Data-driven notes: one table, columns input / expected status / expected error code / key assertion. Adding the 71-char case is a row, not a new test function.`,
    rubric: [
      "Happy paths assert echoed fields (name, iban, id), not just the status code",
      "Both name boundaries (1 and 70) plus one-over (71) are present with expected outcomes",
      "IBAN checksum and duplicate-name (409) cases assert their specific error codes",
      "Nickname boundary (35 vs 36) and the omitted-nickname case are covered",
      "Auth rows include 401 and the cross-customer 403/IDOR-adjacent check",
      "The set is expressed data-driven (rows), with one key assertion named per row",
    ],
  },
  {
    id: "e-ch3",
    moduleId: "mod-e",
    title: "The amount field's edges",
    kind: "boundaries",
    minutes: 12,
    brief: "Derive the API boundary set for a numeric field with a written rule - including the type trap.",
    context:
      "Contract for POST /api/transfers: amount is a number in EUR, 0.01 to 10000.00 inclusive, at most two decimal places. Out-of-range or over-precision values are rejected with 422 and error code AMOUNT_OUT_OF_RANGE (the doc uses one code for both). The endpoint has a known habit of mis-serialising amounts sent as JSON strings. Design the boundary test set: values, why each is in the set, and the assertion beyond the status code.",
    hints: [
      "Both edges plus their neighbours: what does 2-point and 3-point BVA give you here?",
      "The precision rule (two decimals) is its own boundary: 250.755 is in-range but over-precision.",
      "JSON distinguishes 10000.00 (number) from \"10000.00\" (string) - the type trap deserves its own rows.",
    ],
    solution: `Boundary set for amount 0.01-10000.00 (3-point thinking on both edges):

- 0.00 -> 422 AMOUNT_OUT_OF_RANGE (just below the minimum: proves the minimum is inclusive).
- 0.01 -> 201 (exactly the minimum - the classic boundary pick).
- 0.02 -> 201 (first value beyond the minimum: catches off-by-one rejections of legal amounts).
- 9999.99 -> 201 (last two-decimal value below the maximum).
- 10000.00 -> 201 (exactly the maximum).
- 10000.01 -> 422 AMOUNT_OUT_OF_RANGE (just above the maximum).

Precision boundary (the rule "at most two decimals"):
- 250.755 -> 422 per contract (in range, over-precision); assert the error code, and note if the backend instead rounds silently - that is a separate defect class.

Type/serialisation rows (the known habit):
- amount as JSON string "10000.00" -> must be rejected (422 with a type-specific code if the contract has one) - never accepted, never coerced silently.
- amount as number 10000.00 -> 201 and the response echoes amount as a NUMBER (assert type, not just value); the response amount must not come back as "10000.00".

Assertions beyond status: response amount is a number and equals the submitted value; error responses carry AMOUNT_OUT_OF_RANGE; the ledger entry for each accepted value matches the submitted amount to the cent.`,
    rubric: [
      "All six edge/neighbour values present (0.00, 0.01, 0.02, 9999.99, 10000.00, 10000.01) with per-value rationale",
      "Precision boundary (three decimals) treated as its own rule with its own expected outcome",
      "The number-vs-string serialisation trap gets explicit rows, tied to the documented habit",
      "Error code AMOUNT_OUT_OF_RANGE asserted, not just the 422 status",
      "Accepted values assert the echoed amount's TYPE as well as its value",
      "Set maps visibly to the BVA technique from the field's stated rule - not values picked by feel",
    ],
  },
];
