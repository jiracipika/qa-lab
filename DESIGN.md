# QABrew redesign - design and implementation plan

Status: plan locked 2026-11-06, then implemented in the same pass. This file is the
design contract: tokens and rules below are what the UI must obey. Supersedes the
visual direction described in README (functionality notes there still apply).

## 1. Current UI findings (audit, verified)

- One 525-line stylesheet (`src/styles.css`), class-based, light/dark via
  `[data-theme]` tokens. Components consistent but generic: teal accent, system
  sans, uniform 12px radius, every card same visual weight.
- Navigation icons are Unicode glyphs (`◧ ❏ ↺ ? ✎ ◎ ⌗ Aa ✦ → ⚙`) - font-dependent,
  inconsistent optical weight, some read as missing glyphs on some platforms.
- Dashboard: 8+ sibling `.card`s in near-equal weight; "Continue learning" is not
  visually dominant; page reads as a pile rather than a priority order.
- App name "QA Lab" appears in: index.html title/description/noscript, sidebar and
  topbar brand, onboarding dialog, Dashboard greeting, README/PROGRESS. The e2e
  test asserts the onboarding dialog name.
- Everything else (grading, SRS, storage, export/import, content, games, sandbox)
  is presentation-independent and must not change.

## 2. Intended learner experience

"An illustrated QA workbook you can practise inside." The learner opens the app and
the next best action is obvious: continue the current lesson (dominant card), clear
due review cards, or take one practice swing (daily challenge / boundary playground).
Reference material feels like a well-kept notebook: paper, ink, margin notes.
Nothing is decorative-only: sketch borders mark interactive things, margin notes
carry advice, the graph-paper grid lives under diagrams.

Priority order on the dashboard: continue learning > due reviews > next practice >
activity/evidence > saved material. Streak stays a quiet nudge.

## 3. MedBrewery traits to reuse (verified against live site 2026-11-06)

Verified from https://www.medbrewery.ca/ HTML + CSS:

- Paper: page background `#faf8f1`, raised surface `#fffef9`, warm borders
  `#dedbd0 / #e3dfd3 / #dedbc9`.
- Ink: near-black navy `#0f172b` (headings), slate `#253344` (body), muted `#556f7e`.
- Blue: primary `#2563eb`, bright `#3080ff`, light `#54a2ff` (dark-mode friendly).
- Semantic: red `#fb2c36`, green `#00bb7f`/`#00c758`, amber `#edb200`.
- Type: **DM Serif Display** (headings), **Plus Jakarta Sans** (UI text),
  sketchy hand + slab faces for annotations ("Sketch Hand", licensed - we substitute
  **Caveat**, OFL, same role).
- Motifs: hand-drawn wobbly corner radii (`3px 7px 4px 5px`, blob radii
  `46% 52% 47% 53%`), a 4-point spark doodle, blue hover glow
  `0 0 20px rgba(37,99,235,.15)`, short ALL-CAPS section eyebrows, friendly
  plain-language copy with quoted phrases ("the 'why' is the good part").
- Copy pattern: eyebrow + short headline + one-sentence explanation + concrete CTA.

Not copied: their content, their licensed fonts, their exact logo.

## 4. QABrew identity

- Name: **QABrew** (one word, capital Q and B). Tagline: "the QA workbook".
- Mark: a conical lab flask with blue liquid and a check bubble rising from it -
  "brewing quality" + test + inspection. Rendered as inline SVG using CSS tokens so
  it adapts to dark mode; also `public/favicon.svg`.
- Wordmark: "QABrew" set in DM Serif Display (serif), no logo typography tricks.
- Illustration direction: no raster images. Motifs are SVG/CSS only: spark doodle,
  squiggle underline for page titles, graph-paper grid behind diagrams and the
  range playground, Caveat margin notes with a hand-drawn arrow.
- No MedBrewery affiliation claim anywhere. One neutral line in README: design
  language follows the MedBrewery family so the products can sit side by side.

## 5. Design tokens

Typography (self-hosted via @fontsource, no external requests at runtime):

| Role | Family | Weights | Usage |
|---|---|---|---|
| Display | DM Serif Display | 400 | h1, h2, brand wordmark, hero lesson title |
| UI/body | Plus Jakarta Sans (variable) | 400-800 | everything else |
| Hand | Caveat | 500,600 | margin notes, short annotations only |
| Mono | system stack | - | code, values, ids |

Body 15.5px / 1.65. h1 1.9rem, h2 1.45rem, h3 1.1rem (sans 700). Line lengths stay
under ~78ch (lesson body 72ch kept).

Colour (light / "paper"):

| Token | Value | Notes |
|---|---|---|
| --paper | #faf8f1 | page bg |
| --paper-raised | #fffef9 | cards |
| --paper-inset | #f1efe4 | insets, code bg |
| --paper-hover | #f4f1e6 | hover wash |
| --ink / --ink-soft / --muted | #0f172b / #253344 / #556f7e | text |
| --line / --line-strong | #dedbd0 / #c9c4b2 | borders |
| --blue / --blue-strong | #2563eb / #1d4ed8 | primary, hover |
| --blue-bright | #3080ff | accents, links on tint |
| --blue-soft | #e9eefb | tint backgrounds |
| --ok #00a06a / --bad #d92c35 / --warn #9a7b0c | text-safe; borders may use brighter #00bb7f / #fb2c36 / #edb200 |

Dark / "midnight ink": navy paper `#10141f`, raised `#171d2b`, cream text
`#f1efe6`, lines `#2a3145`/`#3c4560`, blue `#54a2ff`, soft `#152541`, ok `#3ecf8e`,
bad `#ff7a80`, warn `#e5b54b`.

Shape + depth:

- radius 10px cards, 7px controls (down from 12/8 - crisper workbook feel).
- `.sketch` modifier: uneven hand-drawn radius
  `255px 15px 225px 15px / 15px 225px 15px 255px` + 1.5px ink border. Reserved for:
  dashboard hero, range playground, empty states, flashcard faces. Not on every card.
- Shadow: `0 1px 2px rgba(15,23,43,.05), 0 6px 16px rgba(15,23,43,.06)`; the blue
  glow (`0 0 20px rgba(37,99,235,.15)`) appears only on primary-CTA hover.
- Graph paper: 22px grid of `rgba(37,99,235,0.055)` lines on `.diagram-frame` and
  the range playground; removed under reduced-motion? (static bg - stays).

## 6. Layout

Desktop (>=880px): existing 250px sidebar + main (max 980px) grid kept. Sidebar
gains the brand block (mark + wordmark + Caveat tagline), lucide icons, blue active
state with a 3px ink left rule. Main column unchanged structurally.

Tablet (<=880px): current mobile behaviour kept - topbar + drawer. Drawer gets the
same brand block; backdrop darker.

Mobile (<=560px): h1 drops to 1.5rem, hero card stacks (CTA full width), stat rows
collapse to 2 columns, quiz options keep >=44px touch targets, no horizontal
overflow (code blocks already scroll internally).

## 7. Route-by-route scope

| Route | Changes |
|---|---|
| / (Dashboard) | Restructured: hero continue-learning card (sketch border, serif lesson title, module chip, progress, single CTA); due review + daily challenge + mistake notebook row; boundary playground strip; then activity, results, strengths, bookmarks (restyle only). |
| /modules, /modules/:id | PageHeader + eyebrow; module cards get chapter numerals in serif, sketch border on the primary/next module card only. |
| /modules/:id/lessons/:lid | Serif lesson title, squiggle underline, reading width kept; prev/next as clear buttons; notes/bookmark controls unchanged. |
| /review | Flashcard faces get sketch border + paper feel; rating buttons unchanged (a11y depends on them); schedule table restyled only. |
| /quizzes, /quizzes/:id | Options restyled (selected = blue ink border + tint); opt-key becomes round workbook letter badge; timer/nav unchanged. |
| /challenges, /challenges/:id | Rubric/hints/reveal mechanics untouched; cards restyled; kind chips stay. |
| /games | Game cards restyled; boards already token-driven (inherit new palette automatically). |
| /sandbox | Bank app framed as "workbench": graph-paper bg, ink header; spec + reports tabs unchanged. |
| /glossary | Term list as definition entries with dotted leaders; compare table restyled. |
| /tools | Tab strip restyled; study builder cards restyled; behaviour unchanged. |
| /roadmap | Honest labels kept; content-health panel unchanged. |
| /settings | Destructive zone visually separated (warning-tinted card + divider); export/import flow untouched. Add note that data does not sync across devices/origins. |

## 8. Shared components and contracts

Existing class names stay (`.card`, `.btn`, `.chip`, `.quiz-option`, ...) so page
edits stay small. New shared pieces:

- `PageHead({ eyebrow, title, lede, children })` - eyebrow (small caps label),
  serif title with squiggle underline, lede.
- `BrandMark({ size })` - inline SVG flask mark.
- `Spark` - 4-point spark doodle (decorative, aria-hidden).
- `HandNote({ children })` - Caveat margin note.
- `RangeLab` - the boundary-value playground (see 9).
- lucide-react icons in nav (one icon per entry, 16-18px, stroke 2).

## 9. Behaviour that must remain intact (regression list)

- Stable-option-id grading, seeded shuffle, multi-select exact-set rules.
- SRS schedule + rating actions and their accessible names (e2e clicks "Good").
- localStorage key `qa-lab:v1`, export envelope `app: "qa-lab"` - NOT renamed
  (a rename would orphan every learner's data for zero benefit).
- Onboarding goal picker labels (tests assert them).
- All 59 existing tests except the onboarding dialog title string ("QA Lab" ->
  "QABrew").
- Sandbox planted defects, reveal gating, report validation.
- Reduced-motion, focus-visible, aria patterns.

## 10. Storage compatibility and domain migration

- qabrew.vercel.app was claimed and verified on the Vercel project on 2026-11-06
  (first-come-first-served *.vercel.app namespace). It is a **different origin**
  from qa-lab-jiracipika.vercel.app: localStorage does not travel.
- Migration path (no auto-redirect): the old host shows a dismissible banner -
  "QABrew has a new address. Export your progress (Settings -> Export) and import
  it there." with a link to the new origin. Export/import is versioned, validated,
  and round-trip tested; it is the only cross-origin vehicle. No claims of
  automatic migration.
- The old domain keeps serving the app (same project) - nothing breaks.

## 11. Ownership / agents

The lead agent (this session) owns styles.css, Layout, ui.tsx, Dashboard, RangeLab,
branding, and deployment - the shared system. Route pages are light edits on top of
the locked tokens, done by the lead sequentially to avoid contract drift. One
subagent is spawned at the end as an independent verifier (fresh checkout of the
built app: run tests, grep for stale "QA Lab" strings and non-ASCII artifacts,
check contrast + focus order) - the codebase owner rate-limits concurrent GLM
children to 1, so verification is the only parallelism that pays for itself.

## 12. Acceptance criteria and verification

- `npx tsc -b`, `npm test` (59 + boundary playground checks), `npm run build` pass.
- e2e journey updated and green (onboarding -> lesson -> quiz -> review -> game ->
  sandbox -> reload -> export/import).
- Screenshots reviewed at ~390 / 768 / 1440 px (browser tooling if available;
  otherwise stated as not run).
- Keyboard pass: tab through nav + hero + playground + one quiz question.
- WCAG 2.2 AA intent: token pairs above were chosen for contrast (blue 2563eb on
  fffef9 = 4.9:1; muted 556f7e on faf8f1 = 5.5:1); any failure found gets fixed or
  reported.
- Non-ASCII scan of all new/edited files (CJK check per machine convention).

## 13. Implementation order

1. deps + fonts + favicon + index.html branding
2. styles.css token rewrite (all existing classes restyled, new utilities added)
3. ui.tsx (PageHead, BrandMark, Spark, HandNote) + Layout (nav icons, brand,
   migration banner, onboarding copy)
4. RangeLab + Dashboard restructure
5. route pages pass (Module/Lesson/Quiz/Review/Challenges/Games/Sandbox/Glossary/
   Tools/Roadmap/Settings)
6. tests updated + new checks; run suite, build
7. README/PROGRESS; commit, push, verify qabrew.vercel.app deploy; verifier agent
8. memory update
