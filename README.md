# QABrew

**The QA workbook** - an illustrated learning workspace for software testing: lessons,
flashcards, quizzes, practical challenges, minigames, and a bug-hunting sandbox, all
running locally in your browser. No accounts, no API keys, no backend. Progress stays
in your browser's localStorage.

Built for QA engineers and SDETs (with a banking flavour) and for newcomers learning
the craft. The design language - warm paper, dark ink, confident blue, hand-drawn
margins - follows the MedBrewery family (medbrewery.ca) so the products can sit side
by side; QABrew makes no affiliation claim.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm test           # run the 62 automated checks (unit + content + games + e2e, 4 modules)
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
```

## What is inside

- **Five complete modules** (30 lessons, 60 concept flashcards, 100 original quiz
  questions, 16 practical challenges, 9 interactive diagrams):
  - Module A - Testing fundamentals
  - Module B - Testing through development and delivery
  - Module C - Practical test design
  - Module D - Defect management and QA documentation (Jira/Xray/Confluence flavour)
  - Module E - API testing (Postman, Bruno, REST Assured)
- **Boundary playground**: a live teaching widget - probe a numeric field that accepts
  18-65 and watch exactly where it flips from valid to invalid (same engine as the
  Boundary Hunter game).
- **Review system**: concept cards on a documented spaced-repetition schedule (simplified
  SM-2, day-granular), plus test-case cards you execute and record pass/fail/blocked.
- **Quizzes**: practice mode (instant explanations, including why each distractor is wrong)
  and assessment mode (explanations after submit, optional timer, question navigator,
  preserved answers, retry-incorrect). Grading uses stable option ids, so option shuffling
  cannot break it.
- **Challenges**: test design, missing acceptance criteria, defect reporting, regression
  selection, API response diagnosis, assertion strengthening, flaky-test debugging.
  Open-ended work is self-assessed against transparent rubrics - no fake keyword grading.
- **Three minigames**: Boundary Hunter, Defect Detective (evidence required, random guessing
  earns nothing), and Test Design Sorter.
- **Northlake Sandbox Bank**: a fictional bank with a written specification and six documented
  planted defects. Test against the spec, file full defect reports, reveal solutions, reset.
- **Study tools**: glossary + comparison view, mistake notebook, interview practice cards,
  study-session builder (10/20/30 min), personal notes and bookmarks, test-case workspace
  with text export.
- **Honest progress**: evidence-backed topic strengths/weaknesses (attempt counts, not
  invented mastery percentages), activity and optional streak, versioned export/import with
  validation, reset with confirmation.

## Design system

Tokens, typography, and layout rules live in `src/styles.css` and are documented in
[DESIGN.md](DESIGN.md): paper/ink/blue palette, DM Serif Display + Plus Jakarta Sans +
Caveat (all self-hosted via @fontsource - no external requests), lucide icons, a
hand-drawn sketch border on primary surfaces, and a squiggle-underlined eyebrow on
every page. Light (paper) and dark (midnight ink) themes, reduced-motion support,
focus-visible styles.

## Data and privacy

Everything is stored in `localStorage` under `qa-lab:v1` (the key predates the QABrew
name and is kept so existing progress survives) - device and browser specific, and it
does **not** move between addresses or devices by itself. Use Settings -> Export to
back up or migrate progress; imports are validated and overwrite only after
confirmation. No secrets, no tracking, no network calls.

## Content note

Terminology is aligned with the ISTQB Certified Tester Foundation Level (CTFL) v4.0 syllabus
(v4.0.1), checked against istqb.org on 2026-11-05. All quiz questions and exercises are
original practice material - not official certification exam questions - and this project
claims no accreditation.

## Tech

Vite + React 18 + TypeScript (strict) + React Router. Persistence and all game/grading/schedule
logic are pure, tested modules under `src/lib`, `src/games`, and `src/sandbox`. Educational
content lives in `src/content` as typed, validated data records with stable ids; tests assert
the content contract (counts, unique ids, complete distractor explanations).

Deployed on Vercel (SPA rewrites configured in `vercel.json`): **https://qabrew.vercel.app**
