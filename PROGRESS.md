# QA Lab - progress file

Working state for AI sessions and contributors. Update after each milestone.

## Completed (release 1.0 - 2026-11-05)

- Scaffolding: Vite + React 18 + TS strict + React Router + Vitest/jsdom/RTL.
- Core libs: spaced repetition (simplified SM-2, day-granular, documented), quiz grading by
  stable option ids, seeded shuffle, localStorage persistence with corruption recovery,
  versioned export/import with validation, content-record validation, date/streak helpers,
  markdown-lite renderer (no HTML injection).
- Curriculum: 3 starter modules fully implemented (A fundamentals, B lifecycle/delivery,
  C test design): 18 lessons, 36 concept flashcards (all four kinds), 60 original quiz
  questions (multi + single, distractor notes on every wrong option), 10 challenges covering
  all 10 required kinds, 9 test-case cards.
- Reference content: 32-term glossary, 8 comparison pairs, 12 interview cards, 10-item
  roadmap (honestly labelled planned/not built).
- 9 interactive diagrams (err-defect-failure, test process, defect workflow, test levels,
  boundary number line, decision table, state machine, API flow, CI pipeline).
- Quizzes: practice + assessment modes, optional 20-min timer, navigator, preserved answers,
  retry-incorrect, topic breakdown, results with per-question explanations.
- Review: flip cards, four ratings with interval preview, bookmarks, schedule state table;
  separate test-case execution records (pass/fail/blocked + actual).
- Challenges: progressive hints, solution reveal (tracked), rubric self-assessment saved.
- Games: Boundary Hunter (5 rounds, 2/3-point/robust, missed/extra explanations), Defect
  Detective (3 scenes with genuinely buggy widgets; findings require 40+ chars of evidence
  incl. values), Test Design Sorter (12 scenarios, 6 techniques, explanations).
- Sandbox: Northlake fictional bank - login/payees/transfer/history, 7-line spec, 6 planted
  defects (engine-level, unit-tested), full defect-report form with validation, spec-referenced
  matching, solution reveal, reset.
- Tools: study-session builder (10/20/30), mistake notebook (auto from wrong quiz answers),
  notes, interview cards, all-cards list, test-case workspace with text export.
- Dashboard: continue learning, due cards, daily challenge (date-rotating), recent results,
  evidence-based strengths/weaknesses (min 3 attempts, no mastery %), activity/streak,
  bookmarks/notes, real empty states for new users.
- Onboarding goal picker (5 goals; orders suggestions only), light/dark themes, reduced
  motion (manual + OS), focus-visible styles, mobile drawer nav.
- Settings: goal, theme, motion, export download, import with validation + overwrite
  confirmation, reset with confirmation, storage-error banner.

## Verification (2026-11-05)

- `npx tsc -b` clean; `npx vite build` succeeds (dist, ~165 kB gzip JS).
- `npx vitest run`: 59/59 tests pass across 6 files:
  grading (shuffle invariance, multi-select sets), SRS schedule + streak, storage +
  export/import round trips + invalid-import errors, content contract (counts, unique ids,
  card mix, diagram refs, challenge-kind coverage), game engines (boundary evaluation incl.
  duplicate-class penalties, sorter, detective evidence rules, all 6 sandbox defects real in
  the engine), and a jsdom end-to-end journey: onboard -> lesson complete -> quiz answer +
  explanation -> card flip + rating -> Boundary Hunter perfect round -> sandbox transfer +
  defect report filed -> reload persists -> export/import round trip.
- Content check on Roadmap page mirrors the same validation (currently 0 issues).
- NOT run: real-browser visual pass (desktop/mobile screenshots), screen-reader pass.
  DOM-level e2e covers behaviour; layout was reviewed in code only. Honest limitation.

## Commands

- `npm run dev` - local dev server
- `npm test` - all automated checks
- `npm run build` - typecheck + production build
- Deploy: push to GitHub `main`; Vercel builds automatically (vercel.json: vite, SPA rewrites).

## Known limitations

- Progress is per-browser (localStorage); export/import is the migration path.
- Open-ended challenge answers are self-assessed (by design - no keyword-matching theatre).
- Review schedule is day-granular; no intra-day due times.
- Single JS bundle (~165 kB gzip); no route-level code splitting yet.
- No real-browser visual/screenshot regression suite.
- Sandbox state (payees/transfers) resets with the in-app reset; only reports persist.
- Bundle warning: 520 kB raw (see code-splitting TODO below).

## Next concrete task (pick one)

1. Route-level code splitting (React.lazy for Games/Sandbox/Tools) to halve initial JS.
2. Module D "Defect management and QA documentation" (Jira/Xray/Confluence flavour) - first
   roadmap item, extends sandbox reports into a workflow view.
3. Real-browser smoke test (Playwright) with desktop + mobile viewports and console-error
   assertion, wired into CI.

## Deployment

- GitHub: https://github.com/jiracipika/qa-lab (pushes to `main` auto-deploy).
- Vercel production: https://qa-lab.vercel.app (project `qa-lab`, framework vite, SPA rewrites).
- Verified 2026-11-05: root and /modules return 200 on the production URL.
