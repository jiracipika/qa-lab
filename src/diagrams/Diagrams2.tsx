/** Interactive diagrams: boundary number line, decision table, state transition graph. */

import { useState } from "react";
import { useDiagramDetails, type DiagramDetail } from "./Diagrams1";

/* ============ 5. Boundary values (number line) ============ */

const boundaryDetails: DiagramDetail[] = [
  { title: "Below: 4,999.99 (max-)", sub: "just inside, valid", body: "One minimum step inside the upper boundary. Catches defects where the comparison uses < instead of <=.", question: "Would max- alone catch a strict-inequality bug at the top edge? Why also test max?" },
  { title: "Max: 5,000.00 (valid)", sub: "the boundary itself", body: "The edge value included in the valid range. The single most classic off-by-one location: is 5,000.00 accepted when the spec says 'up to 5,000.00'?", question: "'Up to 5,000.00' - inclusive or exclusive? What must you do when the spec does not say?" },
  { title: "Above: 5,000.01 (invalid)", sub: "robust neighbour", body: "One step outside. A robust BVA set adds the invalid neighbours; 2-point sets stop at the boundary pair.", question: "For an integer field, what is the neighbour of max 3?" },
  { title: "Mid: 2,500.00 (valid)", sub: "3-point extra", body: "A mid-range representative. 3-point BVA includes a nominal value to confirm ordinary behaviour, not just edges.", question: "Which other technique already gives you the mid-range representative?" },
  { title: "Min / min+ / below-min", sub: "mirror at the lower edge", body: "0.01 (min), 0.02 (min+), 0.00 (invalid). Every range has two edges - testers famously test the upper and forget the lower.", example: "Rule: 0.01 <= amount <= 5,000.00.", question: "A field accepts 1-30 characters. What are min, min+, and below-min here?" },
];

export function BoundaryValuesDiagram() {
  const { node, panel } = useDiagramDetails(boundaryDetails);
  const W = 640;
  const regions = [
    { x: 30, w: 90, label: "0.00", i: 4, cls: "missed" },
    { x: 120, w: 60, label: "0.01", i: 4, cls: "" },
    { x: 180, w: 60, label: "0.02", i: 4, cls: "" },
    { x: 240, w: 160, label: "2,500.00", i: 3, cls: "" },
    { x: 400, w: 60, label: "4,999.99", i: 0, cls: "" },
    { x: 460, w: 70, label: "5,000.00", i: 1, cls: "" },
    { x: 530, w: 80, label: "5,000.01", i: 2, cls: "missed" },
  ];
  return (
    <div>
      <svg className="numberline" viewBox={`0 0 ${W} 110`} role="img" aria-label="Number line from below 0.01 to above 5,000 showing boundary values">
        <line x1="20" y1="70" x2={W - 20} y2="70" stroke="var(--border-strong)" strokeWidth="2" />
        {regions.map((r) => (
          <g key={r.label} onClick={() => node(r.i).onClick()} role="button" tabIndex={0}
             onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); node(r.i).onClick(); } }}
             aria-pressed={node(r.i)["aria-pressed"]} style={{ cursor: "pointer" }}>
            <rect x={r.x} y={40} width={r.w} height={30} rx={6} fill={node(r.i)["aria-pressed"] ? "var(--accent-soft)" : "var(--bg-inset)"} stroke={node(r.i)["aria-pressed"] ? "var(--accent)" : "var(--border-strong)"} />
            <text x={r.x + r.w / 2} y={30} textAnchor="middle" fontSize="12" fill="var(--ink)">{r.label}</text>
            <line x1={r.x + r.w / 2} y1={40} x2={r.x + r.w / 2} y2={70} stroke="var(--border-strong)" />
          </g>
        ))}
        <text x={150} y={98} textAnchor="middle" fontSize="11" fill="var(--ok)">valid range</text>
        <text x={55} y={98} textAnchor="middle" fontSize="11" fill="var(--bad)">invalid</text>
        <text x={570} y={98} textAnchor="middle" fontSize="11" fill="var(--bad)">invalid</text>
      </svg>
      <div className="row" aria-hidden style={{ marginBottom: 6 }}>
        <button type="button" className="btn btn-sm" {...node(4)}>Lower edge</button>
        <button type="button" className="btn btn-sm" {...node(3)}>Mid</button>
        <button type="button" className="btn btn-sm" {...node(0)}>max-</button>
        <button type="button" className="btn btn-sm" {...node(1)}>max</button>
        <button type="button" className="btn btn-sm" {...node(2)}>max+ (robust)</button>
      </div>
      <p className="small muted" style={{ marginTop: 0 }}>
        Click the values on the line (or the buttons) to see which technique each value belongs to. Rule shown: 0.01-5,000.00, step 0.01.
      </p>
      {panel()}
    </div>
  );
}

/* ============ 6. Decision table ============ */

interface DTColumn { c1: "Y" | "N" | "-"; c2: "Y" | "N" | "-"; action: string; note: string; gap?: boolean }

const dtColumns: DTColumn[] = [
  { c1: "Y", c2: "-", action: "Decline CARD_BLOCKED", note: "Blocked wins regardless of balance - precedence assumption; most teams evaluate blocking first. The dash means don't-care: balance cannot rescue a blocked card." },
  { c1: "N", c2: "Y", action: "Approve", note: "Sufficient balance: approve normally. Overdraft is irrelevant here - that is why its row is a dash (collapse)." },
  { c1: "N", c2: "N", action: "Approve using overdraft", note: "Shortfall exists and the arranged overdraft covers it. Boundary questions live exactly here: what if it covers all but one cent?" },
  { c1: "N", c2: "N", action: "Decline INSUFFICIENT_FUNDS", note: "Wait - same conditions as the previous column but a different action? Not a contradiction: an extra hidden condition (overdraft covers?) separates them. In the full table that condition is the third row.", gap: true },
];

const dtDetails: DiagramDetail[] = dtColumns.map((c) => ({
  title: `Rule: ${c.c1 === "-" ? "any" : c.c1 === "Y" ? "blocked" : "not blocked"} / ${c.c2 === "-" ? "any" : c.c2 === "Y" ? "funds ok" : "funds short"}`,
  sub: c.action,
  body: c.note,
  question: c.gap ? "Two columns, same visible conditions, different actions. What question do you raise?" : "Which equivalence partition boundary hides inside this rule?",
}));

export function DecisionTableDiagram() {
  const { node, panel } = useDiagramDetails(dtDetails);
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="data" aria-label="Interactive decision table: card blocked and balance sufficient versus action">
          <thead>
            <tr>
              <th scope="col">Conditions</th>
              <th scope="col">R1</th>
              <th scope="col">R2</th>
              <th scope="col">R3</th>
              <th scope="col">R4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Card blocked?</td>
              {dtColumns.map((c, i) => (
                <td key={i}><button type="button" className="btn btn-sm btn-ghost mono" style={{ padding: "2px 10px" }} {...node(i)} aria-label={`Rule ${i + 1}, card blocked: ${c.c1}`}>{c.c1}</button></td>
              ))}
            </tr>
            <tr>
              <td>Balance sufficient?</td>
              {dtColumns.map((c, i) => (
                <td key={i} className="mono">{c.c2}</td>
              ))}
            </tr>
            <tr>
              <td><strong>Action</strong></td>
              {dtColumns.map((c, i) => (
                <td key={i} className="small">{c.action}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="small muted">Click a rule cell to inspect it. Notice the dashes (collapsed conditions) and the suspicious R3/R4 pair.</p>
      {panel()}
    </div>
  );
}

/* ============ 7. State transition graph ============ */

interface SGNode { id: string; label: string; x: number; y: number }
interface SGEdge { from: string; to: string; label: string; valid: boolean }

const sgNodes: SGNode[] = [
  { id: "draft", label: "Draft", x: 40, y: 60 },
  { id: "scheduled", label: "Scheduled", x: 230, y: 60 },
  { id: "executing", label: "Executing", x: 420, y: 60 },
  { id: "completed", label: "Completed", x: 420, y: 190 },
  { id: "cancelled", label: "Cancelled", x: 230, y: 190 },
];

const sgEdges: SGEdge[] = [
  { from: "draft", to: "scheduled", label: "schedule", valid: true },
  { from: "scheduled", to: "executing", label: "execution day", valid: true },
  { from: "executing", to: "completed", label: "settled", valid: true },
  { from: "scheduled", to: "cancelled", label: "cancel before cutoff", valid: true },
  { from: "executing", to: "cancelled", label: "cancel during execution - INVALID", valid: false },
  { from: "cancelled", to: "executing", label: "execute after cancel - INVALID", valid: false },
  { from: "draft", to: "completed", label: "skip schedule - INVALID", valid: false },
];

const stateDetails: DiagramDetail[] = [
  { title: "Draft", sub: "state", body: "Transfer being composed; nothing committed. Leaving without saving discards. Hidden risk: data reloaded after validation errors.", question: "Is Draft a real backend state, or only a UI concept? How would you find out?" },
  { title: "Scheduled", sub: "state", body: "Stored and waiting for execution day. Cancellation allowed until 23:59 the day before execution.", question: "Which boundary tests the cutoff itself?" },
  { title: "Executing", sub: "state", body: "The batch run is processing the transfer. Cancellation must be rejected - the classic 23:59:59 race.", question: "Cancel request arrives at 23:59:59.500. What behaviour would you expect, and how would you test it?" },
  { title: "Completed", sub: "state", body: "Money moved and recorded. Terminal state for the happy path. Auditable in history.", question: "Can a completed transfer ever legitimately change? What does that imply about 'terminal'?" },
  { title: "Cancelled", sub: "state", body: "Cancelled by customer or system. A cancelled transfer must never execute - check queues, emails, and side effects too.", question: "What side-effect systems should you verify did NOT act?" },
  { title: "Invalid transitions", sub: "the forgotten tests", body: "Cancel during Executing; execute a Cancelled transfer; jump from Draft to Completed. Each forbidden event must produce a defined rejection - not a crash, not silence.", question: "Why are invalid transitions often more bug-prone than valid ones?" },
];

export function StateTransitionsDiagram() {
  const [sel, setSel] = useState(0);
  const nodePos = (id: string) => sgNodes.find((n) => n.id === id)!;
  const edgeDetail = stateDetails[5];

  return (
    <div className="stategraph">
      <svg viewBox="0 0 560 260" role="img" aria-label="State machine for a scheduled transfer">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--muted)" />
          </marker>
          <marker id="arrowhead-bad" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--bad)" />
          </marker>
        </defs>
        {sgEdges.map((e, i) => {
          const a = nodePos(e.from);
          const b = nodePos(e.to);
          const mx = (a.x + b.x) / 2 + (e.valid ? 0 : i * 12 - 24);
          const my = (a.y + b.y) / 2 + (e.from === "draft" && e.to === "completed" ? 120 : e.valid ? (a.y === b.y ? -28 : 0) : 20);
          const d = `M ${a.x + 70} ${a.y + 18} Q ${mx} ${my} ${b.x + (b.x < a.x ? -10 : 35)} ${b.y + (a.y === b.y ? 16 : 4)}`;
          return (
            <g key={i} onClick={() => setSel(5)} role="button" tabIndex={0}
               onKeyDown={(ev) => { if (ev.key === "Enter") setSel(5); }}
               style={{ cursor: "pointer" }} aria-label={`${e.label} from ${a.label} to ${b.label}, ${e.valid ? "valid" : "invalid"}`}>
              <path d={d} fill="none" className={`sg-edge${sel === 5 ? " highlight" : ""}`} stroke={e.valid ? undefined : "var(--bad)"} markerEnd={e.valid ? "url(#arrowhead)" : "url(#arrowhead-bad)"} />
              <text x={mx} y={my - 6} textAnchor="middle" className="sg-label" fill={e.valid ? undefined : "var(--bad)"}>{e.label}</text>
            </g>
          );
        })}
        {sgNodes.map((n, i) => (
          <g key={n.id} className="sg-node" onClick={() => setSel(i)} role="button" tabIndex={0}
             onKeyDown={(ev) => { if (ev.key === "Enter") setSel(i); }}
             aria-pressed={sel === i} aria-label={`State ${n.label}`}>
            <rect x={n.x} y={n.y - 18} width={110} height={38} rx={10} />
            <text x={n.x + 55} y={n.y + 6} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </svg>
      <p className="small muted">Click states (blue) and red invalid edges. Red paths are forbidden transitions that still need tests. Grey edges are valid transitions.</p>
      <div className="diagram-detail fade-in" aria-live="polite" key={sel}>
        <h4>{(stateDetails[sel] ?? edgeDetail).title}</h4>
        <p>{(stateDetails[sel] ?? edgeDetail).body}</p>
        <p className="q">Check yourself: {(stateDetails[sel] ?? edgeDetail).question}</p>
      </div>
    </div>
  );
}
