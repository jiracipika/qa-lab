/** Interactive diagrams: API request/response flow and CI/CD pipeline gates. */

import React from "react";
import { useDiagramDetails, type DiagramDetail } from "./Diagrams1";

/* ============ 8. API request / response flow ============ */

const apiDetails: DiagramDetail[] = [
  {
    title: "Client builds request",
    body: "Method + URL + headers (auth, content-type, idempotency keys) + body. The request is part of your test design: malformed bodies and missing headers are negative cases.",
    example: "POST /transfers with Authorization: Bearer ..., Idempotency-Key: abc123, body {payeeId, amount, executionDate}.",
    question: "What happens if the client retries without an idempotency key?",
  },
  {
    title: "Gateway / middleware",
    body: "Authentication, rate limiting, routing, TLS. Many 'API bugs' are actually gateway rules: 401 vs 403 semantics, rate-limit headers.",
    example: "Rate limit returns 429 with Retry-After - does your client honour it?",
    question: "Which status code distinguishes 'not authenticated' from 'authenticated but forbidden'?",
  },
  {
    title: "Validation layer",
    body: "Schema and business-rule checks before any work happens. Testers probe: required fields, formats, ranges, cross-field rules, unknown fields.",
    example: "amount 250.755 or executionDate 2026-02-30 should fail here with 400 + field errors.",
    question: "Should validation reject or silently round a 3-decimal amount? What does the spec need to say?",
  },
  {
    title: "Business logic + persistence",
    body: "The service applies rules and writes state. Concurrency, idempotency, and transaction boundaries live here - classic sources of double-submission defects.",
    example: "Two identical POSTs with the same idempotency key must produce one transfer.",
    question: "How would you test a double-submit race through this layer?",
  },
  {
    title: "Downstream systems",
    body: "Core banking, schemes, notifications. Contract mismatches, latency, partial failures (money moved, email failed) - the seams of system integration testing.",
    example: "Core responds slowly: does the API time out gracefully, and is the transfer in a defined state?",
    question: "A partial failure (debit ok, notification failed) - what should the API report?",
  },
  {
    title: "Response contract",
    body: "Status, headers (Location), body fields, error shape. Every field is an assertion; schema validation keeps the whole contract honest.",
    example: "201 + {id, status: SCHEDULED, amount echoing the submitted value, payeeId} + Location header.",
    question: "Why is statusCode(201) alone a weak assertion?",
  },
];

export function ApiFlowDiagram() {
  const { node, panel } = useDiagramDetails(apiDetails);
  return (
    <div>
      <div className="diagram-flow" role="group" aria-label="API request and response flow">
        {["Client request", "Gateway", "Validation", "Logic + store", "Downstream", "Response"].map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span className="diagram-arrow" aria-hidden>→</span>}
            <button type="button" className="diagram-node" {...node(i)}>
              {label}
              <span className="node-sub">{["method+headers+body", "auth + limits", "400s live here", "rules + writes", "core/schemes", "status + body"][i]}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Response flows back the other way (right to left). API testing checks each stage's contract - and the seams between stages.
      </p>
      {panel()}
    </div>
  );
}

/* ============ 9. CI/CD pipeline with quality gates ============ */

const ciDetails: DiagramDetail[] = [
  {
    title: "Commit / merge",
    body: "A change enters the pipeline. Gate zero: pre-commit hooks and branch protection - small diffs, reviewed.",
    question: "Why does a small diff make every later gate more trustworthy?",
  },
  {
    title: "Build + static analysis",
    body: "Compile, lint, static security/quality scans. Minutes fast, blocks the merge. Finds a whole defect class without running tests.",
    example: "SonarQube flags a resource leak; the build fails before any test executes.",
    question: "Which testing family does static analysis belong to?",
  },
  {
    title: "Unit tests",
    body: "Fast, isolated, comprehensive at logic level. The widest layer of the pyramid; flaky units are treated as defects of the suite.",
    question: "What makes a unit test 'isolated'?",
  },
  {
    title: "Integration / API tests",
    body: "Components and services talking: contracts, schemas, auth flows, negative API behaviour. Cheaper and more stable than UI end-to-end.",
    example: "REST Assured run: POST /transfers with boundary amounts asserting the response contract.",
    question: "Which API-level check could replace a fragile UI test of the same behaviour?",
  },
  {
    title: "System / E2E smoke",
    body: "A thin set of critical journeys through a real environment. Slow, expensive - kept deliberately small.",
    example: "Login -> transfer -> statement journey on staging with seeded data.",
    question: "Why 'smoke' rather than the full regression suite at this stage?",
  },
  {
    title: "Non-functional gates",
    body: "Performance budgets, security scans, accessibility checks. They fail the pipeline like any functional gate when thresholds are breached.",
    example: "k6: P95 login under 2s at 10k VUs; axe: zero critical violations on changed pages.",
    question: "A performance budget is what kind of requirement - functional or non-functional?",
  },
  {
    title: "Human gates + release",
    body: "Exploratory test reports, UAT sign-off, change-advisory review in regulated banks. The pipeline informs people; people decide.",
    question: "Which decisions should stay human even in a fully automated pipeline?",
  },
];

export function CiPipelineDiagram() {
  const { node, panel } = useDiagramDetails(ciDetails);
  return (
    <div>
      <div className="diagram-flow" role="group" aria-label="CI/CD pipeline stages and quality gates">
        {["Commit", "Build + static", "Unit", "Integration/API", "E2E smoke", "Non-functional", "Human gates"].map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span className="diagram-arrow" aria-hidden>→</span>}
            <button type="button" className="diagram-node" style={{ maxWidth: 150 }} {...node(i)}>
              {label}
              <span className="node-sub">{["minutes", "minutes", "minutes", "10s of min", "30 min ish", "varies", "hours/days"][i]}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Each stage is a gate: failing checks stop the flow. Fast gates first, slow and human gates last. A green pipeline reports what was encoded - exploration and judgement still happen around it.
      </p>
      {panel()}
    </div>
  );
}
