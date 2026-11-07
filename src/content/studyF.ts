/** Module F flashcards (all four kinds) and practical challenges. */

import type { Challenge, ConceptCard } from "../types/content";

export const cardsF: ConceptCard[] = [
  {
    id: "f-c1",
    moduleId: "mod-f",
    lessonId: "f-l1",
    topic: "SQL basics",
    kind: "definition",
    front: "What is referential integrity, and which constraint enforces it?",
    back: "The rule that a foreign key must point at an existing row (or be NULL by design). Enforced by the FOREIGN KEY constraint - and tested by attempting the violation: insert a child with a missing parent, delete a parent with children, and check both the refusal and the error translation.",
  },
  {
    id: "f-c2",
    moduleId: "mod-f",
    lessonId: "f-l2",
    topic: "SQL basics",
    kind: "definition",
    front: "What is a window function, and which three patterns matter most in testing?",
    back: "A function that computes across a set of rows without collapsing them. The testing trio: ROW_NUMBER() to flag duplicates (occurrence > 1), LAG() to compare each row with the previous one, COUNT(*) OVER (PARTITION BY ...) to attach population counts to every row.",
  },
  {
    id: "f-c3",
    moduleId: "mod-f",
    lessonId: "f-l5",
    topic: "Test data",
    kind: "definition",
    front: "What is data masking, and when is it used instead of fully synthetic data?",
    back: "Deterministic transformation that keeps data's shape, distribution, and relationships while destroying identity - real-scale realism without real people. Used for performance rehearsals and migration dress rehearsals; everything else uses generated synthetic data.",
  },
  {
    id: "f-c4",
    moduleId: "mod-f",
    lessonId: "f-l1",
    topic: "SQL basics",
    kind: "compare",
    front: "INNER JOIN vs LEFT JOIN - and which finds missing rows?",
    back: "INNER JOIN returns only rows matching on both sides. LEFT JOIN keeps every left-side row, with NULLs where the right side has no match - so LEFT JOIN ... WHERE right.id IS NULL finds the absences: completed transfers with no ledger posting, customers with no payees.",
  },
  {
    id: "f-c5",
    moduleId: "mod-f",
    lessonId: "f-l5",
    topic: "Test data",
    kind: "compare",
    front: "DELETE vs TRUNCATE when cleaning test data",
    back: "DELETE removes rows row-by-row, fires triggers, honours WHERE, logs heavily. TRUNCATE wipes the whole table fast, usually ignoring triggers. Test cleanup loves TRUNCATE's speed on scratch tables and DELETE's precision everywhere else - and neither is a substitute for run-scoped seeding.",
  },
  {
    id: "f-c6",
    moduleId: "mod-f",
    lessonId: "f-l3",
    topic: "Data integrity",
    kind: "compare",
    front: "Primary key vs UNIQUE constraint",
    back: "A PK is the row's identity: unique, NOT NULL, one per table. A UNIQUE constraint is a business rule on other columns (often composite, e.g. unique per customer) and usually allows NULLs. Both reject duplicates - test the violation error of each, they differ.",
  },
  {
    id: "f-c7",
    moduleId: "mod-f",
    lessonId: "f-l2",
    topic: "SQL basics",
    kind: "scenario",
    front: "You suspect the monthly overdraft fee was charged twice to some accounts this month. What is the first query you run?",
    back: "A ROW_NUMBER() window over ledger_entries PARTITION BY account_id, month, fee_type, ordered by created_at - then SELECT ... WHERE occurrence > 1. The rows with occurrence 2+ are your evidence, with timestamps and amounts attached.",
  },
  {
    id: "f-c8",
    moduleId: "mod-f",
    lessonId: "f-l4",
    topic: "Migrations",
    kind: "scenario",
    front: "Post-migration, row counts match per table - but a few customers say their addresses are wrong. What went wrong with the verification?",
    back: "Counts alone cannot catch mis-mapped fields: rows swapped, columns shifted, transformation rules applied to the wrong segment. The fix is sampled field mapping across every segment (old vs new, field by field, with evidence) plus checksums per segment.",
  },
  {
    id: "f-c9",
    moduleId: "mod-f",
    lessonId: "f-l6",
    topic: "Verification",
    kind: "scenario",
    front: "The UI shows 'transfer successful', the API returned 201, but the customer's balance did not change. Where do you look, in what order?",
    back: "The database trail: 1) the transfers row (status really COMPLETED?), 2) ledger_entries for that transfer (debit and credit posted?), 3) the account balance. Whichever leg is missing locates the defect - API said success, UI copied it, but the write never completed or was never posted.",
  },
  {
    id: "f-c10",
    moduleId: "mod-f",
    lessonId: "f-l2",
    topic: "SQL basics",
    kind: "code-api",
    front: "Which query proves 'every completed transfer has both a debit and a credit posting'?",
    back: "Group the postings per transfer and count sides: transfers with fewer than two postings (or with two of the same side) are the defect rows. Aggregate + HAVING turns a business rule into a query.",
    code: {
      lang: "sql",
      caption: "Posting completeness check",
      content: `SELECT t.id, t.amount,
       COUNT(*) FILTER (WHERE l.side = 'DEBIT')  AS debits,
       COUNT(*) FILTER (WHERE l.side = 'CREDIT') AS credits
FROM transfers t
JOIN ledger_entries l ON l.transfer_id = t.id
WHERE t.status = 'COMPLETED'
GROUP BY t.id, t.amount
HAVING COUNT(*) FILTER (WHERE l.side = 'DEBIT') <> 1
    OR COUNT(*) FILTER (WHERE l.side = 'CREDIT') <> 1;`,
    },
  },
  {
    id: "f-c11",
    moduleId: "mod-f",
    lessonId: "f-l1",
    topic: "SQL basics",
    kind: "code-api",
    front: "Which query finds 'completed transfers with no ledger posting'?",
    back: "LEFT JOIN from transfers to ledger_entries, keeping the rows with no match: WHERE l.id IS NULL. INNER JOIN would silently hide exactly these rows - the absence-finder is the left join.",
    code: {
      lang: "sql",
      caption: "The absence finder",
      content: `SELECT t.id, t.amount, t.created_at
FROM transfers t
LEFT JOIN ledger_entries l ON l.transfer_id = t.id
WHERE l.id IS NULL
  AND t.status = 'COMPLETED';`,
    },
  },
  {
    id: "f-c12",
    moduleId: "mod-f",
    lessonId: "f-l3",
    topic: "Data integrity",
    kind: "code-api",
    front: "How is a CHECK constraint tested, and what does a violation look like?",
    back: "Attempt the value the constraint forbids and verify the designed refusal: the statement fails with a check-violation error, no row is written, and the API layer (if the write came through one) translates it to a 4xx - not a leaked 500 with a stack trace.",
    code: {
      lang: "sql",
      caption: "The constraint and its violation test",
      content: `ALTER TABLE transfers
  ADD CONSTRAINT transfers_amount_positive CHECK (amount > 0);

-- violation test: must fail, must write nothing
INSERT INTO transfers (id, account_id, amount, status)
VALUES ('TR-TEST', 'AC-4471', -50.00, 'COMPLETED');
-- expected: check violation "transfers_amount_positive", 0 rows inserted`,
    },
  },
];

export const challengesF: Challenge[] = [
  {
    id: "f-ch1",
    moduleId: "mod-f",
    title: "Prove the double fee with data",
    kind: "test-cases",
    minutes: 15,
    brief: "Design the database-level verification cases for the double-overdraft-fee defect - queries and expected results, not clicks.",
    context:
      "Defect NL-4812: some accounts were charged the monthly overdraft fee twice in one statement month (Module D's report). Schema: ledger_entries(id, account_id, fee_type, amount, side, created_at), accounts(id, balance), transfers(...). Business rules to verify: (1) at most one MONTHLY_OVERDRAFT fee per account per calendar month; (2) each fee posting has exactly one matching ledger row and the account balance reflects it; (3) fee amounts equal the schedule value 4.90 EUR; (4) affected accounts' balances are off by exactly 4.90 EUR per duplicate. Design the verification case set: for each rule, the query shape and the expected result on a fixed dataset - plus what evidence you attach to the defect report.",
    hints: [
      "Rules about 'at most one per period' are ROW_NUMBER() PARTITION BY rules.",
      "Rule 2 and 4 are reconciliation shapes: join, aggregate, compare against the schedule value.",
      "A verification case names its query, its input dataset, and the expected rows - a developer must be able to re-run it.",
    ],
    solution: `Verification case set (read-only, test environment):

Case 1 - duplicates per account/month:
Query shape: SELECT account_id, date_trunc('month', created_at) AS m, fee_type, COUNT(*) AS charges FROM ledger_entries WHERE fee_type = 'MONTHLY_OVERDRAFT' GROUP BY 1, 2, 3 HAVING COUNT(*) > 1.
Expected on the fixed dataset: exactly the two known accounts (*4471, *8814) with charges = 2 for October; every other account has charges = 1 or 0. Each returned row is one instance of the defect, evidence-ready (ids, timestamps).

Case 2 - duplicate detection via window (row-level view):
ROW_NUMBER() OVER (PARTITION BY account_id, date_trunc('month', created_at), fee_type ORDER BY created_at) AS occurrence; filter occurrence > 1. Expected: two rows with occurrence = 2, carrying the 00:03/00:07 timestamps - attach both to the report.

Case 3 - balance reconciliation for affected accounts:
Expected invariant: accounts.balance = expected_balance - 4.90 * (charges - 1) for each affected account. Query joins the account's ledger fee rows and compares the balance with the schedule-derived expectation. Expected: *4471 and *8814 off by exactly 4.90; all others exact.

Case 4 - fee amount correctness:
SELECT DISTINCT amount FROM ledger_entries WHERE fee_type = 'MONTHLY_OVERDRAFT' AND created_at >= '2026-10-01'. Expected: exactly one value, 4.90. Any other value is a second defect (schedule mismatch), not noise.

Case 5 - posting completeness for fee rows:
Each fee ledger row joins to exactly one fee transaction and one side = 'DEBIT'. Expected: no fee row with zero or multiple transactions.

Report attachment: the Case 1 and Case 2 result rows (ids, timestamps, amounts) plus the Case 3 balance delta - a developer can re-run all five queries against the fixed dataset before and after the fix, which makes the fix verifiable, not anecdotal.`,
    rubric: [
      "Rule 1 verified two ways: GROUP BY/HAVING population check and ROW_NUMBER row-level view",
      "Rule 4 checks the distinct fee amount against the schedule value 4.90",
      "Balance reconciliation states the expected delta formula (4.90 per duplicate), not 'balance looks wrong'",
      "Every case names query shape + fixed dataset + expected rows - re-runnable by a developer",
      "Evidence attached to the report is query output (ids, timestamps, amounts), not a screenshot of the UI",
      "All queries are read-only against the test environment; no string-concatenated values",
    ],
  },
  {
    id: "f-ch2",
    moduleId: "mod-f",
    title: "The migration ticket with no acceptance criteria",
    kind: "missing-ac",
    minutes: 12,
    brief: "A migration story is ready for sprint planning. It is not actually ready. Write the missing acceptance criteria.",
    context:
      "Ticket DATA-2201, 'Migrate customer addresses to the new normalized tables', says: 'Move ADDRESS_LINE1/2, CITY, POSTCODE, COUNTRY from the customers table into the new addresses table (one row per customer). Handle special characters. Done when migration is done.' The change window is in three weeks. The team plans to 'run it and check a few rows'. You have been asked to make this testable before planning. Draft the acceptance criteria the ticket is missing.",
    hints: [
      "ACs must be checkable without asking anyone what they meant: counts, rules, evidence.",
      "Think in failure modes from the migration lesson: counts, mapping rules, special characters, timezone/date fields, rejects, runtime, rollback.",
      "Each AC should name its evidence: which query or report proves it, and against which dataset.",
    ],
    solution: `Missing acceptance criteria for DATA-2201 (each checkable, each with named evidence):

1. Completeness: after migration, COUNT(*) of addresses = COUNT(*) of customers with a non-empty address pre-migration, and every migrated row joins back to exactly one customer. Evidence: reconciliation query output on the rehearsal dataset.
2. Field mapping: for a documented sample across every segment (country, region, address-format edge cases), each field equals the source field after the documented transformation - verified field by field in a reviewable spreadsheet. Special characters (accents, apostrophes, hyphens, CJK) preserved exactly; evidence includes before/after pairs.
3. Special-character rule is explicit: define what "handle" means - exact preservation, no encoding double-conversion (mojibake check on at least the documented character set).
4. Rejection handling: rows failing validation land in the reject table with reason codes; count of rejects reconciles to zero unexplained; process can resume after a reject is fixed.
5. Idempotency: running the script a second time changes zero rows (or fails safely with a clear guard message). Evidence: before/after counts and checksums of the second run.
6. Runtime: the migration completes within the change window on a real-scale rehearsal dataset - the rehearsal's runtime is recorded in the ticket, with margin documented.
7. Rollback: the documented rollback is rehearsed on real-scale data, including rows written after migration start; post-rollback counts and checksums match the pre-migration baseline.
8. Downstream: the application reads addresses from the new table correctly (spot-check UI/API paths), and the old columns' fate is stated (dropped, or frozen read-only, with date).

Plus the meta-AC the team asked for implicitly: "done when migration is done" is replaced by the rehearsal evidence pack (counts, checksums, sampled mapping, reject reconciliation, runtime, rollback log) reviewed in the change-window go/no-go.`,
    rubric: [
      "Completeness AC uses counts AND a join-back invariant, not 'check a few rows'",
      "Field-mapping AC is sampled across segments with before/after evidence, including special characters defined concretely",
      "Reject handling, idempotency, runtime on real-scale data, and rehearsed rollback each have their own AC",
      "Every AC names its evidence (query/report) and dataset, making it checkable by anyone",
      "The downstream read path and the old columns' fate are covered",
      "The vague 'done when done' is replaced by a named evidence pack for go/no-go",
    ],
  },
  {
    id: "f-ch3",
    moduleId: "mod-f",
    title: "The nightly reconciliation that fails at midnight",
    kind: "flaky",
    minutes: 12,
    brief: "A database verification test passes by day and fails every night around midnight. Diagnose the flake with the timezone/time-window rule in mind.",
    context:
      "A nightly verification test asserts: 'every ledger_entry has a corresponding transfers row created on the same calendar date' with the query WHERE l.entry_date = t.created_at::date, run at 23:58-00:05 UTC. Failures cluster around midnight: on some days 2-5% of rows mismatch; on most days it passes. The database stores created_at as timestamptz (UTC); entry_date is a DATE column written by the posting service using the local date of the business unit (CET/CEST). Twice a year the failure rate spikes for a whole day. The test owner's current plan is to add three retries and a 60-second sleep.",
    hints: [
      "Two different notions of 'date' are being compared: a UTC instant truncated to a date, and a local calendar date.",
      "Where does the mismatch window come from? Think about which rows are created at 23:58-00:05 UTC and what their CET local date is.",
      "Retries and sleeps treat the symptom. What is the correct comparison rule, and how would you prove it?",
    ],
    solution: `Diagnosis: the test compares two different definitions of "date".

- t.created_at::date truncates a UTC instant to the UTC calendar date.
- l.entry_date is the business-unit LOCAL date (CET/CEST) chosen by the posting service.

Between 23:58 and 00:05 UTC, the UTC date and the CET local date disagree (CET is UTC+1: a 23:30 UTC write is already tomorrow in CET). Rows written in that window - which is exactly when the nightly run executes - legitimately have entry_date = local-next-day while created_at::date = UTC-same-day. So the "mismatch" rows are correct data evaluated by a wrong rule. The twice-a-year all-day spike is the DST transition, when the offset shifts and the mismatch window moves an hour - a second fingerprint confirming the timezone theory.

Why the planned fix is wrong: retries and a sleep make the test wait out the window it does not understand; they also train the suite to pass while the underlying comparison stays meaningless for those rows.

The correct fix:
1. Compare like with like: either join on the business key and verify posting EXISTENCE and AMOUNT (the real invariant), or if the date must be checked, compute the local date from the timestamp: (t.created_at AT TIME ZONE 'Europe/Amsterdam')::date = l.entry_date, using the business unit's timezone column, not a hard-coded one.
2. Better: drop the date equality assertion entirely and assert the invariant that matters - every entry joins to a transfer with matching amount and side. Dates were a proxy, and a bad one.
3. Prove it: reproduce the failure window deterministically by running the corrected assertion against the stored midnight rows from the last failure night (they are in the DB - query the historical mismatches, apply the fixed rule, show every "failure" becomes a pass with unchanged data), and add a permanent test-data row pair straddling 00:00 UTC so the boundary is covered deliberately.

Report the finding as a test defect with the timezone evidence, not as an environment flake - and retire the retry/sleep plan in writing so it does not return.`,
    rubric: [
      "Identifies the two different date definitions (UTC truncation vs business-local date) as the root cause",
      "Explains why failures cluster at midnight and spike at DST transitions - the mechanism, not just the pattern",
      "Rejects retries/sleeps as symptom treatment and says why they are harmful",
      "Proposes comparing like with like (timezone-aware local date) or asserting the real invariant (existence + amount match)",
      "Includes a deterministic proof using the historical midnight rows and a permanent boundary test row",
      "Classifies it as a test defect to report, not an environment quirk to tolerate",
    ],
  },
];
