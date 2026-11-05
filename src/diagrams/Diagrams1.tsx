/** Interactive diagrams: error chain, test process, defect workflow, test levels.
 *  Every hotspot is a real <button>; the detail panel below teaches and asks a check question. */

import React, { useState } from "react";

export interface DiagramDetail {
  title: string;
  sub?: string;
  body: string;
  example?: string;
  question?: string;
}

export function useDiagramDetails(details: DiagramDetail[]) {
  const [selected, setSelected] = useState(0);
  const node = (i: number) => ({
    "aria-pressed": selected === i,
    onClick: () => setSelected(i),
  });
  const panel = () => {
    const d = details[selected];
    return (
      <div className="diagram-detail fade-in" key={selected} aria-live="polite">
        <h4>{d.title}</h4>
        {d.sub && <div className="chip" style={{ marginBottom: 8 }}>{d.sub}</div>}
        <p style={{ marginBottom: d.example ? 8 : 0 }}>{d.body}</p>
        {d.example && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            <strong>Example:</strong> {d.example}
          </p>
        )}
        {d.question && <p className="q">Check yourself: {d.question}</p>}
      </div>
    );
  };
  return { selected, node, panel };
}

/* ============ 1. Error -> defect -> failure ============ */

const errDetails: DiagramDetail[] = [
  {
    title: "Error (mistake)",
    sub: "human action",
    body: "A misunderstanding, typo, or wrong assumption made by a person. Errors are reduced by reviews, pairing, checklists, and clearer requirements - not by more end testing.",
    example: "A developer reads 'round half up at two decimals' as 'round down' when tired.",
    question: "Which activity prevents errors most directly: more system tests, or a requirement walkthrough?",
  },
  {
    title: "Defect (flaw in the product)",
    sub: "exists at rest",
    body: "The flaw the error leaves behind in code or a document. It exists whether or not anyone has ever triggered it.",
    example: "The code contains Math.floor(amount * 100) / 100 where rounding should be half-up.",
    question: "If no test ever executes this line, does the defect still exist?",
  },
  {
    title: "Guard: execution reaches the defect",
    sub: "necessary condition",
    body: "A defect can only fail when the code containing it actually runs. Whole branches may never execute for years.",
    example: "The rounding line only runs for amounts with more than two decimals.",
    question: "What coverage information would tell you whether this branch ran?",
  },
  {
    title: "Guard: input triggers it",
    sub: "necessary condition",
    body: "Even when the code runs, the input must hit the faulty logic - the specific values or state the defect lives on.",
    example: "A transfer of 10.005 triggers it; 10.00 does not.",
    question: "Which test design technique deliberately targets such trigger values?",
  },
  {
    title: "Failure (observed deviation)",
    sub: "runtime event",
    body: "The system deviates from expected behaviour. Failtures are what users and testers observe - the visible tip of the chain. Note: failures can also come from environments or bad data, not only code defects.",
    example: "The customer's confirmation shows 10.00 instead of 10.01.",
    question: "A failure appears on one server but not another with identical code. What does that suggest about the cause?",
  },
];

export function ErrorDefectFailureDiagram() {
  const { node, panel } = useDiagramDetails(errDetails);
  return (
    <div>
      <div className="diagram-flow" role="group" aria-label="Error, defect, failure chain">
        <button type="button" className="diagram-node" {...node(0)}>
          Error <span className="node-sub">human mistake</span>
        </button>
        <span className="diagram-arrow" aria-hidden>→ produces</span>
        <button type="button" className="diagram-node" {...node(1)}>
          Defect <span className="node-sub">in the product</span>
        </button>
        <span className="diagram-arrow" aria-hidden>→</span>
        <button type="button" className="diagram-node" {...node(2)}>
          Code executes? <span className="node-sub">guard</span>
        </button>
        <span className="diagram-arrow" aria-hidden>and</span>
        <button type="button" className="diagram-node" {...node(3)}>
          Input triggers? <span className="node-sub">guard</span>
        </button>
        <span className="diagram-arrow" aria-hidden>→ then</span>
        <button type="button" className="diagram-node" {...node(4)}>
          Failure <span className="node-sub">observed</span>
        </button>
      </div>
      <p className="small muted" style={{ margin: "10px 0 0" }}>
        A defect leads to a <em>possible</em> failure - both guards must hold. Not every defect fails; not every failure comes from a defect.
      </p>
      {panel()}
    </div>
  );
}

/* ============ 2. Test process with feedback loops ============ */

const processDetails: DiagramDetail[] = [
  {
    title: "Test planning",
    body: "Define objectives, scope, approach, resources, schedule, and exit criteria. Produces the test plan.",
    example: "Exit criteria: zero open severity-1 defects; all critical-path cases executed twice.",
    question: "If the deadline moves a week earlier, which document changes first?",
  },
  {
    title: "Test analysis",
    body: "Work out WHAT to test: derive test conditions from requirements, risks, and regulatory rules. Produces the list of conditions and traceability.",
    example: "From 'daily limit 5,000.00' derive the condition 'limit boundary enforced'.",
    question: "A requirement is ambiguous at this stage. What is the correct output of analysis: a guess, or a question?",
  },
  {
    title: "Test design",
    body: "Turn conditions into concrete cases: data, steps, expected results - using techniques like EP, BVA, decision tables. Produces test cases and procedures.",
    example: "Condition becomes case: transfer 5,000.01 -> expect rejection DAILY_LIMIT_EXCEEDED.",
    question: "Which technique would design the 5,000.00 / 5,000.01 pair?",
  },
  {
    title: "Test implementation",
    body: "Make cases runnable: manual procedures written up, automation coded, environments and data prepared. Produces executable suites and test data.",
    example: "The Selenium script, the seeded test account, the Postman collection.",
    question: "Flaky data setup belongs to which stage's quality?",
  },
  {
    title: "Test execution",
    body: "Run the tests, compare actual vs expected, log results and defects with reproduction evidence. Produces results and defect reports.",
    example: "Case fails: confirmation shows 5,000.00 accepted above limit -> defect filed with steps.",
    question: "What makes a defect report actionable at this stage: the word 'broken', or exact steps + observed/expected?",
  },
  {
    title: "Test completion",
    body: "Evaluate exit criteria, summarise coverage and residual risk, hand over information for the release decision. Produces the test summary report.",
    example: "92% planned cases run, 3 known issues open, tax-report suite deferred with rationale.",
    question: "Which principle forbids summarising as 'the build is defect-free'?",
  },
];

export function TestProcessDiagram() {
  const { node, panel } = useDiagramDetails(processDetails);
  return (
    <div>
      <div className="diagram-flow" role="group" aria-label="Test process activities">
        {["Plan", "Analyse", "Design", "Implement", "Execute", "Complete"].map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span className="diagram-arrow" aria-hidden>→</span>}
            <button type="button" className="diagram-node" {...node(i)}>
              {label}
              <span className="node-sub">{["plan", "conditions", "cases", "suites+data", "results+defects", "summary"][i]}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <p className="small muted" style={{ margin: "10px 0 0" }}>
        Feedback loops: defect fixes return work to execution (confirmation); missing coverage returns work to design; changed scope returns work to planning. Testing is a loop, not a line.
      </p>
      {panel()}
    </div>
  );
}

/* ============ 3. Example defect workflow ============ */

const defectDetails: DiagramDetail[] = [
  {
    title: "New",
    body: "The report arrives. Triage checks: is it reproducible, is it a duplicate, is there enough evidence?",
    example: "A report with exact steps, environment, and a screenshot enters triage quickly.",
    question: "What is missing from 'transfer broken pls fix'?",
  },
  {
    title: "Triaged",
    body: "Severity is assessed against the system; priority set with the business. Owner and target release agreed.",
    example: "Severity 2 (wrong data displayed), priority high (launch feature).",
    question: "Severity and priority move independently - give a low-severity, high-priority example.",
  },
  {
    title: "In progress",
    body: "Development debugges: locate the defect, fix, add or update tests at the right level.",
    example: "Fix in Money.parse; new unit cases for 4-decimal rounding added.",
    question: "Who leads debugging - the tester or the developer?",
  },
  {
    title: "Resolved / ready for verification",
    body: "The fix is deployed to a test environment. The reporter runs confirmation tests; regression runs on impacted areas.",
    example: "Retest the failing case; regress statements and exports that share the utility.",
    question: "Why is 'the fix works' not enough to close the story?",
  },
  {
    title: "Closed",
    body: "Confirmation passed and regression clean. The report closes with evidence attached - the audit trail matters in banking.",
    example: "Retest evidence and regression run linked in Jira/Xray.",
    question: "What work products does a closed defect leave behind?",
  },
  {
    title: "Reopened",
    body: "Confirmation failed or the defect resurfaced: the report returns to development with the new evidence.",
    example: "Rounding still wrong for .005 cases on the EUR path only.",
    question: "Is reopening a failure of the tester, or normal feedback?",
  },
  {
    title: "Rejected / deferred",
    body: "Not a defect (works as specified), a duplicate, or consciously postponed with documented business rationale.",
    example: "'Works as specified in REQ-TR-07; spec change requested instead.'",
    question: "Why must a rejection carry a reason, not just a status?",
  },
];

export function DefectWorkflowDiagram() {
  const { node, panel } = useDiagramDetails(defectDetails);
  return (
    <div>
      <div className="diagram-flow" role="group" aria-label="Example defect workflow">
        {["New", "Triaged", "In progress", "Ready to verify", "Closed"].map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span className="diagram-arrow" aria-hidden>→</span>}
            <button type="button" className="diagram-node" {...node(i)}>
              {label}
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button type="button" className="diagram-node" {...node(5)}>
          Reopened <span className="node-sub">from verification</span>
        </button>
        <button type="button" className="diagram-node" {...node(6)}>
          Rejected / deferred <span className="node-sub">with reason</span>
        </button>
      </div>
      <p className="small muted" style={{ margin: "10px 0 0" }}>
        This is one example workflow. Teams and tools differ (Jira configurations vary) - what is universal: reproducible evidence, severity/priority with rationale, and a verification step before closing.
      </p>
      {panel()}
    </div>
  );
}

/* ============ 4. Test levels ============ */

const levelDetails: DiagramDetail[] = [
  {
    title: "Acceptance testing",
    sub: "validates fitness for purpose",
    body: "Led by users and business. Kinds: user acceptance, regulatory, operational. Answers: is this the right product for real use?",
    example: "Product owner walks the rent-payment journey against agreed acceptance criteria.",
    question: "Acceptance testing verifies or validates?",
  },
  {
    title: "System testing",
    sub: "whole system vs specification",
    body: "End-to-end behaviour against functional and non-functional requirements, usually by independent testers.",
    example: "Transfer -> confirmation -> history -> statement, plus P95 response budgets.",
    question: "Why does system testing often find integration-shaped defects that unit tests cannot?",
  },
  {
    title: "System integration testing",
    sub: "against external systems",
    body: "The system talking to neighbours: payment schemes, credit bureaux, partner APIs. Seams fail: contracts, latency, data formats.",
    example: "SEPA file produced by the app consumed correctly by the scheme simulator.",
    question: "Who owns a seam if both sides 'tested their half'?",
  },
  {
    title: "Component integration testing",
    sub: "between internal units",
    body: "Interfaces and interactions between the system's own components.",
    example: "Transfer service -> notification service message contract.",
    question: "What is the cheapest level to catch a wrong interface signature?",
  },
  {
    title: "Component (unit) testing",
    sub: "one unit in isolation",
    body: "Smallest scope, fastest feedback. Developers mock neighbours and verify logic precisely.",
    example: "Money.parse('10.005') unit test asserting the documented rounding policy.",
    question: "Which level gives the cheapest defect feedback, and why do we still need the levels above?",
  },
];

export function TestLevelsDiagram() {
  const { node, panel } = useDiagramDetails(levelDetails);
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
        {["Acceptance", "System", "System integration", "Component integration", "Component (unit)"].map((label, i) => (
          <button
            key={label}
            type="button"
            className="diagram-node"
            style={{ maxWidth: `${340 + i * 60}px`, width: "100%" }}
            {...node(i)}
          >
            {label} testing
            <span className="node-sub">{["users & business", "whole product", "external neighbours", "internal interfaces", "one unit, mocked"][i]}</span>
          </button>
        ))}
      </div>
      <p className="small muted" style={{ margin: "10px 0 0" }}>
        Read top-down: each level answers a bigger question, slower and more realistically. V-model pairing: acceptance mirrors user requirements, system mirrors the system spec, integration mirrors architecture, unit mirrors detailed design.
      </p>
      {panel()}
    </div>
  );
}
