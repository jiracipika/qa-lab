/** Interactive diagram: a mini banking schema - click each table to see its constraints and how to test them. */

import { useDiagramDetails, type DiagramDetail } from "./Diagrams1";

const schemaDetails: DiagramDetail[] = [
  {
    title: "accounts - the identity table",
    body: "Primary key id; CHECK constraints on balance (>= overdraft limit) and status IN ('ACTIVE','FROZEN','CLOSED'); UNIQUE iban. The rows other tables point at - which makes this table the parent in every referential action.",
    example: "Violation test: INSERT an account with status 'DELETED' -> rejected by CHECK; duplicate iban -> rejected by UNIQUE with a named violation.",
    question: "Which constraint would catch a transfer written to an account that does not exist?",
  },
  {
    title: "transfers - the movement table",
    body: "FK account_id -> accounts (the relationship). CHECK amount > 0 and status IN ('PENDING','COMPLETED','FAILED'). Referential action on the parent: ON DELETE RESTRICT - an account with transfers cannot be deleted. Each constraint is a requirement you can violate on purpose.",
    example: "Insert a transfer for account 'AC-999999' -> FK violation, no row written; the API layer must translate that into a 4xx, not a leaked 500.",
    question: "The API returned 500 on amount -50: the CHECK held. What is the second half of that defect?",
  },
  {
    title: "ledger_entries - the postings table",
    body: "FK transfer_id -> transfers with ON DELETE CASCADE: deleting a transfer silently deletes its postings - designed data loss you test by deleting one and counting. Each completed transfer needs exactly one DEBIT and one CREDIT posting: a GROUP BY/HAVING query turns that rule into a checker.",
    example: "LEFT JOIN transfers -> ledger_entries WHERE entry id IS NULL finds completed transfers with no posting - the absence finder.",
    question: "Which join shape proves absence, and which proves presence?",
  },
];

export function SchemaDiagram() {
  const { node, panel } = useDiagramDetails(schemaDetails);
  return (
    <div>
      <div className="diagram-flow" role="group" aria-label="Mini banking schema with relationships">
        <button type="button" className="diagram-node" {...node(0)}>
          accounts
          <span className="node-sub">PK id - UNIQUE iban - CHECK status</span>
        </button>
        <span className="diagram-arrow" aria-hidden>←</span>
        <button type="button" className="diagram-node" {...node(1)}>
          transfers
          <span className="node-sub">FK account_id - CHECK amount &gt; 0</span>
        </button>
        <span className="diagram-arrow" aria-hidden>←</span>
        <button type="button" className="diagram-node" {...node(2)}>
          ledger_entries
          <span className="node-sub">FK transfer_id - CASCADE on delete</span>
        </button>
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Arrows read "belongs to": ledger_entries belongs to transfers belongs to accounts. Click a table for its constraints and the tests each one suggests.
      </p>
      {panel()}
    </div>
  );
}
