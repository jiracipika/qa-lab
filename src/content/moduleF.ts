/** Module F lessons: SQL and database testing (queries, integrity, migrations, test data, verification). */

import type { Lesson } from "../types/content";

export const lessonsF: Lesson[] = [
  {
    id: "f-l1",
    moduleId: "mod-f",
    title: "Databases for testers: tables, joins, and what the data really says",
    minutes: 8,
    objectives: [
      "Read a schema: tables, primary keys, foreign keys, and their relationships",
      "Use inner and left joins to follow data across tables",
      "Treat the database as evidence when the UI and the data disagree",
    ],
    blocks: [
      {
        kind: "prose",
        text: "The database is where the product stops performing and starts *recording*. A screen can be wrong, a confirmation can be misleading, a cache can be stale - but the row that was (or was not) written is the ground truth a defect report needs. Testers who can read that truth directly move from 'the screen looked odd' to 'row X references account Y that does not exist', which no one can argue with.",
      },
      {
        kind: "list",
        items: [
          "**Table** - one kind of thing: accounts, transfers, payees. Columns are its attributes.",
          "**Primary key (PK)** - the identity of a row: unique, never null. `transfers.id`.",
          "**Foreign key (FK)** - a column pointing at another table's PK: `transfers.account_id -> accounts.id`. Relationships live here.",
          "**Join** - combining tables on their keys. `INNER JOIN`: rows must match on both sides. `LEFT JOIN`: keep every left-side row, nulls where the right side has no match - which is exactly how you find *missing* related rows.",
        ],
      },
      {
        kind: "example",
        title: "Following one transfer across tables",
        text: "The UI says a transfer of 250.75 EUR succeeded. The evidence chain in SQL: the transfers row (amount, status, created_at), joined to accounts for sender and receiver, joined to ledger_entries for the posted debit and credit. An INNER JOIN across transfers and ledger_entries shows the posting; a LEFT JOIN from transfers to ledger_entries shows transfers with NO posting - the 'UI said success, money never moved' defect class. Same query shape, opposite defect.",
      },
      {
        kind: "prose",
        text: "Joins answer questions the UI never asks. How many payees does each customer actually have? Which transfers from October lack a ledger entry? Are there accounts with no owner? Each is one query - and each is the kind of question an auditor, a reconciliation job, or a defect investigation will eventually ask in front of you.",
      },
      {
        kind: "diagram",
        diagramId: "db-schema",
        note: "Click each table to see its constraints and the tests each one suggests - the schema is the requirements document that cannot lie.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "Read-only access is enough",
        text: "You rarely need write access to test the database: SELECT against a test environment reveals almost everything. Ask for a read-only role - it is an easier yes, and it cannot cause damage.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Trusting the UI over the data when they disagree",
        fix: "Query the tables. The UI is one rendering of the data; the rows are the record. Your report should quote rows, not impressions.",
      },
      {
        mistake: "Using INNER JOIN and concluding 'no rows' means nothing exists",
        fix: "An INNER JOIN hides left-side rows without matches - exactly the rows you hunt for. Reach for LEFT JOIN ... WHERE right.id IS NULL to find the missing.",
      },
    ],
    recap: [
      "PK is identity, FK is relationship - the schema is the product's real data model.",
      "INNER JOIN proves presence; LEFT JOIN + IS NULL proves absence.",
      "Read-only SELECT access is enough evidence for most defect reports.",
    ],
  },
  {
    id: "f-l2",
    moduleId: "mod-f",
    title: "SELECT to window functions: querying as a testing skill",
    minutes: 8,
    objectives: [
      "Write SELECT queries with WHERE, ORDER BY, and aggregates",
      "Use GROUP BY and window functions to find duplicates and gaps",
      "Follow safe-query practice: bound parameters, read-only roles",
    ],
    blocks: [
      {
        kind: "prose",
        text: "SQL is the most under-used testing tool in manual QA. While a UI click tests one path, one query tests a *population*: every transfer in October, every payee named twice, every account balance that disagrees with its ledger sum. Learning a handful of query patterns converts hours of clicking into seconds of asking.",
      },
      {
        kind: "code",
        code: {
          lang: "sql",
          caption: "The workhorse patterns",
          content: `-- Everything about one incident
SELECT * FROM transfers WHERE id = 'TR-91824';

-- Aggregates: how many transfers per status this month
SELECT status, COUNT(*) AS n
FROM transfers
WHERE created_at >= '2026-10-01' AND created_at < '2026-11-01'
GROUP BY status;

-- Window function: flag duplicate fee charges per account per month
SELECT account_id, created_at, amount,
       ROW_NUMBER() OVER (
         PARTITION BY account_id, date_trunc('month', created_at), fee_type
         ORDER BY created_at
       ) AS occurrence
FROM ledger_entries
WHERE fee_type = 'MONTHLY_OVERDRAFT';`,
        },
      },
      {
        kind: "prose",
        text: "**Window functions** rank and compare rows without collapsing them: `ROW_NUMBER()` spots duplicates (occurrence > 1 is a double charge - the exact defect class from Module D's sandbox), `LAG()` compares each row with the previous one (balance jumps, timestamp gaps), `COUNT(*) OVER (PARTITION BY ...)` puts a population count on every row. These three patterns alone find most data-level defects in a banking dataset.",
      },
      {
        kind: "example",
        title: "Finding the missing ledger entries",
        text: "SELECT t.id, t.amount FROM transfers t LEFT JOIN ledger_entries l ON l.transfer_id = t.id WHERE l.id IS NULL AND t.status = 'COMPLETED'; - every 'completed' transfer with no ledger posting. Run it monthly; a non-empty result is not a test failure, it is a report with evidence attached.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "Never concatenate values into queries",
        text: "In any tool or script that takes input (ids, dates, names), use bound parameters - prepared statements with placeholders - never string concatenation or f-string assembly. Concatenated input is how SQL injection happens, and in test tooling it is how a stray quote in a test name deletes a table.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Querying production data 'just to check one thing'",
        fix: "Use the test environment. Production queries need a reason, an approval, and often a data-protection justification - and real customer data must never end up in a defect report.",
      },
      {
        mistake: "Building queries by pasting user input into strings",
        fix: "Bound parameters, always. Prepared statements are the safe shape of the same query, in every tool from psql scripts to REST Assured fixtures.",
      },
    ],
    recap: [
      "One query tests a population; one UI click tests a path.",
      "ROW_NUMBER finds duplicates, LAG finds jumps, LEFT JOIN + IS NULL finds absences.",
      "Bound parameters and read-only roles are non-negotiable query hygiene.",
    ],
  },
  {
    id: "f-l3",
    moduleId: "mod-f",
    title: "Data integrity: constraints are executable requirements",
    minutes: 7,
    objectives: [
      "Read constraints (PK, FK, UNIQUE, CHECK, NOT NULL) as requirements you can test",
      "Predict and verify the behaviour when a constraint is violated",
      "Check referential actions like CASCADE before trusting them",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A constraint is a requirement that the database enforces on every single write, forever - no release schedule, no code path that skips it. That makes constraints the most reliable requirements in the system, and testing them is straightforward: try to violate each one, and check the system refuses *in the designed way*.",
      },
      {
        kind: "list",
        items: [
          "**NOT NULL** - the column always has a value. Try inserting without it: rejected, with a clear error.",
          "**UNIQUE** - no duplicates (often 'unique per customer', a composite constraint). Try the duplicate: rejected with a specific violation, not a generic error.",
          "**CHECK** - a boolean rule on the row: `CHECK (amount > 0)`, `CHECK (status IN ('PENDING','COMPLETED','FAILED'))`. Try the value that should be impossible.",
          "**FK (referential integrity)** - the referenced row must exist. Insert a transfer for account 999999: rejected. Delete the referenced account: what happens to its transfers? That is the referential action.",
          "**Referential actions** - ON DELETE CASCADE (children vanish silently - test what disappears), RESTRICT (deletion refused), SET NULL (children orphaned on purpose). Each is a designed behaviour with user-visible consequences.",
        ],
      },
      {
        kind: "example",
        title: "The constraint that saves money",
        text: "`CHECK (amount > 0)` on transfers looks trivial until you meet the API bug that sends -50. With the constraint, the write fails loudly and the ledger stays clean; without it, a negative amount posts, and two systems now disagree about whether money moved. Constraints are the last line of defence behind every UI validation - and they are tested by attempting the violation.",
      },
      {
        kind: "prose",
        text: "Two things to verify beyond the refusal: **the error path** (does the API translate the database rejection into a sane 4xx, or does it leak a 500 with a stack trace?) and **the migration path** (adding a constraint to a table with existing rows - does the migration fail on legacy data that already violates it?). Both are common integration findings.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Constraints document intent",
        text: "When the API doc and the schema disagree, the schema usually reflects what was actually built. Reading the constraints is requirements analysis that cannot lie.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming the database will 'just reject' bad data politely",
        fix: "Verify the refusal AND its translation: the API should answer 4xx with a machine-readable error, not leak a raw database error as a 500.",
      },
      {
        mistake: "Trusting CASCADE without testing it",
        fix: "Delete a parent in the test environment and count what disappeared. Cascades are designed data loss - they deserve explicit, written test cases.",
      },
    ],
    recap: [
      "Constraints are requirements enforced on every write - violate each one deliberately.",
      "The refusal is only half the test; the error translation is the other half.",
      "Referential actions (CASCADE/RESTRICT/SET NULL) are designed data loss or retention - test them explicitly.",
    ],
  },
  {
    id: "f-l4",
    moduleId: "mod-f",
    title: "Testing data migrations and ETL",
    minutes: 8,
    objectives: [
      "Plan migration verification: counts, checksums, sampled field mapping",
      "Test the failure modes: nulls, timezones, truncation, and idempotency",
      "Verify the rollback path before the migration runs, not after it fails",
    ],
    blocks: [
      {
        kind: "prose",
        text: "A data migration is code whose input is the company's data and whose output is un-done only with great pain. Unlike feature code, it usually runs once, against everything, often under a change window. Testing one is reconciliation: proving that what came out is exactly what went in, transformed by the documented rules and nothing else.",
      },
      {
        kind: "list",
        items: [
          "**Row counts** - per table, before vs after, split by type/status. A count is weak evidence alone (rows can be swapped), but a mismatch is an instant stop.",
          "**Checksums and sums** - SUM(amount), checksum of concatenated key fields, per segment. Catches swaps that counts miss.",
          "**Sampled field mapping** - pick rows across the population (first, last, oldest, newest, every edge type), and compare every mapped field, old to new, in a spreadsheet with evidence.",
          "**Rule cases** - each transformation rule gets a row: the customer renamed, the legacy status mapped to the new enum, the amount converted to minor units.",
          "**The rejects** - rows that fail validation during migration: where do they land, who is told, and can the process resume?",
        ],
      },
      {
        kind: "example",
        title: "The timezone that moved everyone's birthday",
        text: "A migration reads DATE columns as timestamps in UTC, shifts them for storage, and every date of birth moves a day for customers in negative offsets. Counts match perfectly - so a count-only verification signs off a defect affecting every customer. The catch: sampled field mapping on rows from *each timezone* would have caught it in rehearsal. Dates without timezones, timestamps with them: the classic migration trap.",
      },
      {
        kind: "prose",
        text: "Two properties to test explicitly. **Idempotency**: run the migration script twice - the second run must change nothing (or fail safely), because change windows get interrupted and scripts get re-run. **Rollback**: the documented way back must be tested on a copy of real-scale data before the window, including the data written *after* migration started. A rollback that loses the evening's transactions is its own incident.",
      },
      {
        kind: "callout",
        tone: "mistake",
        title: "Rehearse on real-scale data",
        text: "A migration that runs in four minutes on a 10,000-row copy can run for nine hours on production - missing the change window and leaving the system in an undefined state. The rehearsal's runtime is as much a test result as its row counts.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Verifying migrations with row counts only",
        fix: "Counts miss swapped, corrupted, and mis-mapped rows. Add sums, checksums, and per-segment sampled field comparison.",
      },
      {
        mistake: "Testing the rollback plan after the migration fails",
        fix: "Rehearse the rollback on real-scale data before the window, including transactions that arrive mid-migration. An untested rollback is a hope, not a plan.",
      },
    ],
    recap: [
      "Migration testing is reconciliation: counts, sums, checksums, sampled field mapping.",
      "Timezones, nulls, and truncation are the classic silent corruptors.",
      "Idempotency and a rehearsed rollback are part of the deliverable, not extras.",
    ],
  },
  {
    id: "f-l5",
    moduleId: "mod-f",
    title: "Test data design: realistic, synthetic, safe",
    minutes: 7,
    objectives: [
      "Design test data that covers boundaries, edges, and realistic distributions",
      "Keep data synthetic and masked - never test with real customer records",
      "Seed and clean up deterministically so suites repeat safely",
    ],
    blocks: [
      {
        kind: "prose",
        text: "Test results are only as good as the data under them. A suite that always runs against three neat rows proves the happy path of a happy path. Real systems fail on the edges: the name with an apostrophe and an emoji, the balance at exactly the minimum, the customer with two payees whose IBANs differ by one character, the transfer created one second before midnight in a DST-switching timezone.",
      },
      {
        kind: "list",
        items: [
          "**Boundary rows** - min/max balances, longest allowed names, zero-fee accounts, accounts at the overdraft limit.",
          "**Edge content** - unicode and emoji in names, leading zeros in account references, apostrophes (O'Brien), very long addresses.",
          "**Edge time** - UTC boundaries, month ends, DST switch days, leap years, timestamps one second apart (ordering tests).",
          "**Relationship shapes** - customers with 0, 1, and many payees; transfers with and without ledger entries; orphan candidates.",
          "**Realistic distribution** - a few thousand rows with a realistic mix of statuses, so query plans and pagination behave like production.",
        ],
      },
      {
        kind: "prose",
        text: "Everything is **synthetic**: generated names, generated IBANs with valid checksums, generated amounts. Never copies of production data - a 'realistic' customer row is a real person, and a copy in a test environment with weaker access controls is a breach waiting for an auditor to find. When realism is genuinely needed (performance rehearsal), the data is **masked**: deterministic transformation that keeps shape and distribution while destroying identity.",
      },
      {
        kind: "example",
        title: "Deterministic seeding",
        text: "A seeding script generates the same dataset every run: customer ids prefixed with the run id (QA-20261107-...), a fixed random seed, teardown that removes the prefix's rows. Two suites can run in parallel without eating each other's data, a failure leaves its data behind for investigation, and CI reruns never collide. The alternative - 'whatever is in the shared UAT database today' - is the root cause of most 'works on my machine' test failures.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Data setup is part of the test",
        text: "A test that begins 'given the usual data' is not repeatable. The rows it needs are part of the case: create them, assert against them, clean them up (or make cleanup safe to skip).",
      },
    ],
    commonMistakes: [
      {
        mistake: "Copying production data into test 'for realism'",
        fix: "Generate synthetic data with realistic shape and distribution instead. A masked or generated dataset keeps the edge cases and loses the people.",
      },
      {
        mistake: "Suites depending on whatever data happens to be in the shared environment",
        fix: "Deterministic seeding with run-scoped ids and documented teardown. Shared-environment dependence is the top cause of flaky suites.",
      },
    ],
    recap: [
      "Design for edges: boundaries, unicode, time, relationships - not three neat rows.",
      "Synthetic always; masked when realism is required; never real customer data.",
      "Deterministic seeding plus teardown makes suites repeatable and parallel-safe.",
    ],
  },
  {
    id: "f-l6",
    moduleId: "mod-f",
    title: "Verifying from the database up: the audit trail query",
    minutes: 7,
    objectives: [
      "Verify an end-to-end flow by its database trail: UI action to API to rows",
      "Write the reconciliation query that proves (or disproves) correctness",
      "Know when transactions and isolation matter to a test's verdict",
    ],
    blocks: [
      {
        kind: "prose",
        text: "The strongest verification in manual testing is the full chain: perform the action in the UI (or the API), then follow it down to the rows it should have written. The screen says success, the API said 201 - and the question that settles everything is 'what does the database say?'. A saved reconciliation query turns that question into a thirty-second check you can attach to any defect report.",
      },
      {
        kind: "example",
        title: "One transfer, proven in three queries",
        text: "1) The transfer row: SELECT status, amount, currency, created_at FROM transfers WHERE id = 'TR-91824'; - status COMPLETED, amount 250.75. 2) The postings: SELECT side, amount FROM ledger_entries WHERE transfer_id = 'TR-91824'; - a debit of 250.75 and a credit of 250.75, balancing. 3) The account balance: SELECT balance FROM accounts WHERE id = 'AC-4471'; - reduced by exactly 250.75. If any leg disagrees, the defect is located, not just observed.",
      },
      {
        kind: "prose",
        text: "Two database behaviours change verdicts when you are not looking for them. **Transactions**: an operation is atomic - all rows or none; the 'partial write' you observed was probably two separate transactions, which is itself the defect. **Isolation**: what your query sees while writes are in flight depends on the isolation level - a reconciliation query running *during* activity can legitimately see intermediate states, so run verdict queries when the flow is settled, and never conclude from a snapshot taken mid-flight.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "The audit trail is the deliverable",
        text: "When you report 'the fee was charged twice', attach the query and its rows - occurrence numbers, timestamps, amounts. A defect with its evidence query is fixed faster and survives triage arguments.",
      },
      {
        kind: "prose",
        text: "Build yourself a small verification notebook: one query per business rule you test regularly (fee charged once per month; balance matches ledger sum; every completed transfer has both postings; no payee belongs to two customers). When a release candidate lands, running the notebook is a database-level regression suite - in read-only mode, from the test environment, in minutes.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Concluding from a query snapshot taken while the flow is still running",
        fix: "Settle first, then query. Isolation levels legitimately show in-flight states; a mid-flight snapshot proves nothing about the final outcome.",
      },
      {
        mistake: "Reporting the symptom without the trail",
        fix: "Attach the reconciliation query and its result rows. Evidence that a developer can re-run turns a dispute into a fix.",
      },
    ],
    recap: [
      "Verify the chain: UI action -> API response -> the rows it should have written.",
      "Atomicity means all-or-nothing; isolation means mid-flight snapshots are not verdicts.",
      "A personal notebook of reconciliation queries is a database regression suite.",
    ],
  },
];
