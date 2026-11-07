# QABrew - progress file

Working state for AI sessions and contributors. Update after each milestone.
Design contract: DESIGN.md (paper/ink/blue workbook system, MedBrewery-family language).

## Completed (release 1.4 - 2026-11-07)

- **Read-aloud (voice transcriber)**: every lesson section has a Listen/Stop button
  (Web Speech API, `src/lib/speech.ts` + SpeakButton). Click a section to hear it;
  click again (or navigate away) to stop. Markdown-lite markers are stripped before
  speech; long scripts are queued in sentence-sized chunks (some browsers truncate
  long single utterances). Hidden entirely on browsers without speechSynthesis.
  Pure helpers unit-tested (tests/speech.test.ts).
- **Per-module content lazy-loading**: split the shell from the content layer -
  `src/content/goals.ts` (tiny, eager), Layout computes the due-chip count via a
  dynamic import of selectors, ui.tsx slimmed (lesson rendering moved to
  lessonUi.tsx, keeping glossary + all diagram components out of the entry), and the
  Dashboard became a lazy route like every other page. Entry chunk 178.7 -> 64.7 kB
  gzip (-64%); module content rides in one async shared chunk (114 kB gzip) that
  loads behind first paint.
- **Playwright smoke suite** (`e2e/smoke.spec.ts`, `npm run test:e2e`): real-browser
  checks over the production build via vite preview - fresh onboarding, all 13 routes
  via direct SPA navigation with zero console/page errors, Module F diagram rendered,
  read-aloud toggle safe in voice-less headless browsers, 390px mobile (no horizontal
  overflow, drawer opens and closes on Escape), dark theme before paint. Desktop 1440
  + mobile projects. Local-only by design: the deployment GitHub token cannot push
  .github/workflows/*, so repository-CI wiring waits for a workflow-scoped token.
  Two real a11y fixes fell out of it: the dashboard hero lesson title is now a real
  heading (h2), and the mobile drawer test asserts aria state instead of CSS transforms.
- **Module F - SQL and database testing** (third planned roadmap item now built):
  6 lessons (tables/joins as evidence, SELECT to window functions + bound-parameter
  practice, constraints as executable requirements, migration verification incl.
  timezone traps + idempotency + rollback, synthetic/masked test data, end-to-end
  verification from the rows up), 12 flashcards (code-api cards carry real SQL),
  20 quiz questions (5 multi, every distractor annotated), 3 challenges (prove the
  double fee with data, rewrite a migration ticket's missing ACs, diagnose a
  midnight-timezone flaky reconciliation), plus a 10th interactive diagram
  (db-schema: clickable mini banking schema with its constraints).
- Curriculum now: 6 modules, 36 lessons, 72 flashcards, 120 quiz questions,
  19 challenges, 10 interactive diagrams.
- Mimosa deep scan after the changes: 0 findings, 0 advisories.

## Completed (release 1.3 - 2026-11-07)

- **Module E - API testing** (Postman/Bruno/REST Assured flavour, second planned roadmap
  item now built): 6 lessons (HTTP + status codes + idempotency, Postman/Bruno workbench,
  JSON paths + schemas, authentication matrix incl. the IDOR boundary, positive/negative/
  boundary API test design, collections -> REST Assured + CI), 12 flashcards (3 per kind,
  code-api cards carry real REST Assured / pm.test / JSON Schema snippets), 20 original
  quiz questions (5 multi, every distractor annotated), 3 challenges (api-response
  diagnosis of a lying 200-with-ERROR body, data-driven payee-endpoint test cases, the
  amount field's boundary set with the number-vs-string trap). 3 interactive diagrams
  reused (api-request-flow, boundary-values, ci-pipeline).
- Glossary +4 terms: REST, idempotency, JSON Schema, contract testing.
- Roadmap: "API testing" removed (now built), replaced with honestly-labelled planned
  "Performance testing" (k6/JMeter, percentiles). Goal ordering includes E (first for the
  automation goal).
- Curriculum now: 5 modules, 30 lessons, 60 flashcards, 100 quiz questions, 16 challenges,
  4 modules' worth of exercises reference the sandbox bank's transfer/payees domain.

## Completed (release 1.2 - 2026-11-06)

- Route-level code splitting: every page except the dashboard loads as its own chunk
  (~12 on-demand chunks; entry 170.7 -> 137.7 kB gzip before Module D, 158.7 kB after -
  D's content rides in the shared content chunk imported by the dashboard/selectors).
  Suspense fallback: spinner + "Loading..." with role=status.
- **Module D - Defect management and QA documentation** (Jira/Xray/Confluence flavour,
  first planned roadmap item now built): 6 lessons (defect lifecycle, defect reports,
  severity/priority/triage, traceability with Xray, honest metrics, collaboration),
  12 flashcards (3 per kind incl. code-api Xray/Jira JSON), 20 original quiz questions
  (4 multi, every distractor annotated), 3 challenges (defect-report on a double-fee
  banking scenario, regression scope selection, defect-workflow state-machine testing),
  full contract compliance via the same content validation.
- Glossary +4 terms: defect lifecycle, triage, defect escape rate, defect density.
- Roadmap: "Defect management" item removed (now built), replaced with honestly-labelled
  planned "Accessibility testing" (WCAG 2.2/axe) to keep the 10-item honest list.
- Goal ordering updated: D slotted into fundamentals/manual/istqb/automation/interview.
- e2e made lazy-route aware: first assertion on each lazy page uses findBy* (a dashboard
  hero string collision with /Lesson 1 of 6/ had masked navigation failures).
- Mimosa deep scan after the change: 0 findings, 0 advisories (seal sha256:557888a8...).

## Completed (release 1.1 "QABrew" - 2026-11-06)

- Rebrand: QA Lab -> QABrew ("the QA workbook") across UI, title/meta, favicon
  (flask + check SVG), onboarding, docs. Storage key `qa-lab:v1` and export envelope
  `app: "qa-lab"` intentionally unchanged (data continuity).
- Design system rewrite (styles.css): MedBrewery-verified tokens - paper #faf8f1,
  ink #0f172b/#253344, blue #2563eb/#3080ff, dark "midnight ink" theme with cream
  text; DM Serif Display + Plus Jakarta Sans + Caveat self-hosted (@fontsource);
  lucide-react nav icons; hand-drawn sketch border on hero/empty/flashcards/playground;
  graph paper under diagrams; squiggle-underlined eyebrow per page; blue glow on
  primary-CTA hover. See DESIGN.md for the full contract.
- Dashboard restructure: dominant "Continue learning" hero card, due/challenge/mistakes
  row, new Boundary playground (RangeLab) - live 18-65 field with the same tested
  classifier as Boundary Hunter, text verdicts + staggered tick labels (no colour-alone).
- Migration banner: old origin (qa-lab-jiracipika.vercel.app) shows a dismissible
  "moved + how to export/import" notice; no auto-redirect.
- Settings: destructive reset moved to a visually separated danger zone; theme labels
  (Light paper / Dark midnight ink); cross-device data note.
- Mobile drawer closes on Escape; lesson nav uses icon buttons; quiz/challenge pages
  get eyebrows.
- Domain: qabrew.vercel.app claimed on the Vercel project 2026-11-06 (first-come
  namespace); old domain keeps serving.

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

## Verification (2026-11-07, release 1.4)

- `npx tsc -b` clean; `npx vite build` succeeds: entry 64.7 kB gzip + shared content
  chunk 114 kB gzip (async) + ~14 route/component chunks.
- `npx vitest run`: 66/66 across 8 files - content contract validates 6 modules;
  new speech-helper tests cover markdown stripping, sentence-boundary chunking, and
  block serialisation.
- `npm run test:e2e` (Playwright, real Chromium): 9 passed, 1 skipped (mobile-only on
  desktop), 0 runtime errors across 13 routes on desktop 1440 and mobile 390.
- Non-ASCII scan clean on all new/edited files.

## Verification (2026-11-07, release 1.3)

- `npx tsc -b` clean; `npx vite build` succeeds; entry 178.7 kB gzip (content rides in the
  shared chunk; per-module content lazy-loading is the queued fix).
- `npx vitest run`: 62/62 across 7 files - content contract validates 5 modules
  (each: >=5 lessons with >=1 interactive visual, >=10 cards all 4 kinds, exactly 20
  questions with 2-6 multi and unique stems, >=2 challenges); Module E passes all of it.
- Non-ASCII scan clean on the three new content files.

## Verification (2026-11-06, release 1.2)

- `npx tsc -b` clean; `npx vite build` succeeds; entry 158.7 kB gzip + ~12 route chunks.
- `npx vitest run`: 62/62 across 7 files - content contract now validates 4 modules
  (each: >=5 lessons, >=10 cards all 4 kinds, exactly 20 questions 2-6 multi, >=2
  challenges, >=1 diagram ref); Module D passes all of it.
- Non-ASCII scan clean on all new/edited files.

## Verification (2026-11-06, release 1.1)

- `npx tsc -b` clean; `npx vite build` succeeds (~171 kB gzip JS; fonts load per-subset).
- `npx vitest run`: 62/62 tests across 7 files (adds tests/rangelab.test.tsx: classifier
  regions, inclusive validity, live verdict interaction). e2e journey updated for the
  QABrew onboarding dialog.
- Real-browser pass (in-app Chromium, vite preview): desktop 1440 (dashboard hero,
  lesson page, onboarding dialog), mobile 390 (topbar/hero stack, no horizontal overflow:
  scrollWidth 375 <= 390), dark theme, all 12 routes walked via client-side nav with
  zero runtime errors. Vision-model critiques addressed: range-line tick labels staggered
  + viewBox widened, redundant corner captions removed, squiggle moved from wrapping h1
  to the eyebrow, light-theme --bad/--warn darkened to pass 4.5:1 on their tints
  (independent contrast audit: all token pairs now pass AA; earlier chip-bad 4.10 and
  chip-warn 4.42 were the two failures fixed).
- NOT run: screen-reader pass; full WCAG manual audit. Keyboard focus order spot-checked
  in the browser (brand -> nav links); all interactive elements have accessible names
  (independent agent review).
- One test-only fix: srs.test no longer compares newCardState's due date to a hardcoded
  calendar day (broke at UTC midnight).

## Commands

- `npm run dev` - local dev server
- `npm test` - all automated checks (66, unit + content + games + e2e jsdom)
- `npm run test:e2e` - Playwright real-browser smoke suite (desktop + mobile)
- `npm run build` - typecheck + production build
- Deploy: push to GitHub `main`; Vercel builds automatically (vercel.json: vite, SPA rewrites).

## Known limitations

- Progress is per-browser (localStorage); export/import is the migration path.
- Open-ended challenge answers are self-assessed (by design - no keyword-matching theatre).
- Review schedule is day-granular; no intra-day due times.
- Module content rides in the shared entry chunk (routes are split; content is not yet).
- No real-browser visual/screenshot regression suite (Playwright queued, local-only until
  a workflow-scoped token exists).
- Sandbox state (payees/transfers) resets with the in-app reset; only reports persist.

## Next concrete task (pick one)

1. Module G from the roadmap: "Performance testing" (load/stress/soak, k6/JMeter
   scripting, percentiles over averages, finding the breaking point).
2. Optional read-aloud extension: SpeakButton on quiz questions and module overview
   pages (the lib and component are reusable as-is).
3. CI wiring for the Playwright suite once a workflow-scoped GitHub token exists
   (config is ready; `.github/workflows/*` pushes currently fail with the token).

## Deployment

- GitHub: https://github.com/jiracipika/qa-lab (pushes to `main` auto-deploy via the connected Vercel GitHub app).
- Vercel production: **https://qabrew.vercel.app** (project `qa-lab`, explicit public domain,
  claimed 2026-11-06; vercel.app names are first-come-first-served and lowercase).
- Previous address **https://qa-lab-jiracipika.vercel.app** still serves the app (same
  project) with an in-app migration banner: export progress there, import at the new
  address. No auto-redirect (localStorage is per-origin).
- The team's auto alias (`qa-lab-jiracipikas-projects.vercel.app`) is behind Vercel Standard
  Deployment Protection (SSO redirect); explicitly attached project domains serve publicly.
- Note: `qa-lab.vercel.app` belongs to a DIFFERENT Vercel account - do not use it.
