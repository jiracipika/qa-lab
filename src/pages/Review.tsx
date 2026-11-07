/** Review page: concept flashcards (spaced repetition) + test-case cards (manual execution records).
 *  Review ratings are deliberately separate from quiz scoring. */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { allConceptCards, modules } from "../content";
import { testCaseCards } from "../content/interview";
import { useStore } from "../state/store";
import { dueConceptCards } from "../state/selectors";
import { RATING_LABELS, previewIntervals } from "../lib/srs";
import type { Rating } from "../types/state";
import { EmptyState } from "../components/ui";
import { CodeBlock } from "../components/lessonUi";

export function ReviewPage() {
  const [tab, setTab] = useState<"concepts" | "cases">("concepts");
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">Spaced repetition</div>
        <h1>Review</h1>
        <p className="lede">
          Concept cards follow a documented spaced-repetition schedule. Test-case cards are manual execution records -
          pass/fail/blocked with actual results. Review is separate from quiz scoring by design.
        </p>
      </div>
      <div className="tabs" role="tablist" aria-label="Review type">
        <button role="tab" aria-selected={tab === "concepts"} className="tab" onClick={() => setTab("concepts")}>
          Concept cards
        </button>
        <button role="tab" aria-selected={tab === "cases"} className="tab" onClick={() => setTab("cases")}>
          Test case cards
        </button>
      </div>
      {tab === "concepts" ? <ConceptReview /> : <TestCaseReview />}
    </div>
  );
}

function ConceptReview() {
  const { state, dispatch } = useStore();
  const due = dueConceptCards(state);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const queue = useMemo(
    () =>
      due.filter(
        (c) => (filterModule === "all" || c.moduleId === filterModule) && (!onlyBookmarked || state.cards[c.id]?.bookmarked),
      ),
    [due, filterModule, onlyBookmarked, state.cards],
  );
  const card = queue[0];

  const rate = (rating: Rating) => {
    if (!card) return;
    dispatch({ type: "rateCard", cardId: card.id, rating });
    setFlipped(false);
    setDoneCount((n) => n + 1);
  };

  const previews = card ? previewIntervals(state.cards[card.id], card.id) : undefined;
  const kindLabels: Record<string, string> = {
    definition: "Definition",
    compare: "Compare and contrast",
    scenario: "Scenario",
    "code-api": "Code / API interpretation",
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <label className="small" htmlFor="rev-module">Module filter</label>
        <select id="rev-module" className="select" style={{ width: "auto" }} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
          <option value="all">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>Module {m.letter}</option>
          ))}
        </select>
        <button
          type="button"
          className="chip chip-button"
          aria-pressed={onlyBookmarked}
          onClick={() => setOnlyBookmarked((v) => !v)}
        >
          bookmarked only
        </button>
        <span className="spacer" />
        <span className="chip chip-accent">{queue.length} due now</span>
        {doneCount > 0 && <span className="chip">{doneCount} reviewed this session</span>}
      </div>

      {!card ? (
        <EmptyState title="No cards due in this filter">
          {due.length === 0
            ? "Cards you rated Good or Easy will come back on their schedule. New cards appear here until you review them once."
            : "All due cards are outside this filter."}{" "}
          See the <Link to="/tools?tab=cards">full card list</Link> or switch to test-case cards.
        </EmptyState>
      ) : (
        <>
          <button
            type="button"
            className={`flashcard ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show question side" : "Reveal answer"}
            aria-live="polite"
          >
            <span className="flashcard-inner" style={{ display: "block" }}>
              <span className="flashface" style={{ position: "absolute" }}>
                <span className="face-kind">{kindLabels[card.kind]} - {card.topic}</span>
                <span className="face-text">{card.front}</span>
                {card.code && <CodeBlock code={card.code} />}
                <span className="face-hint">Click or press Enter to flip</span>
              </span>
              <span className="flashface back" style={{ position: "absolute" }}>
                <span className="face-kind">Answer</span>
                <span className="face-text" style={{ fontWeight: 480 }}>{card.back}</span>
                <span className="face-hint">Rate your recall below</span>
              </span>
            </span>
          </button>

          <div className="rating-row">
            {([0, 1, 2, 3] as Rating[]).map((r) => (
              <button key={r} type="button" className="btn" disabled={!flipped} onClick={() => rate(r)} title={`Next interval: ${previews?.[r]} day(s)`}>
                {RATING_LABELS[r]}
                {flipped && <span className="small muted">{previews?.[r]}d</span>}
              </button>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>
            Schedule (simplified SM-2, day-granular): Again keeps the card due today; Hard ~1.2x; Good multiplies by
            ease (2.5 to start); Easy by ease x 1.3. Flip the card to enable ratings.{" "}
            <button
              type="button"
              className="chip chip-button"
              aria-pressed={Boolean(state.cards[card.id]?.bookmarked)}
              onClick={() => dispatch({ type: "toggleCardBookmark", cardId: card.id })}
            >
              {state.cards[card.id]?.bookmarked ? "★ bookmarked" : "☆ bookmark"}
            </button>
          </p>
        </>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Schedule state</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Cards</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total concept cards</td>
              <td>{allConceptCards.length}</td>
            </tr>
            <tr>
              <td>In schedule (reviewed at least once)</td>
              <td>{Object.keys(state.cards).length}</td>
            </tr>
            <tr>
              <td>Due today</td>
              <td>{dueConceptCards(state).length}</td>
            </tr>
            <tr>
              <td>Lapsed at least once (rated Again)</td>
              <td>{Object.values(state.cards).filter((c) => c.lapses > 0).length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TestCaseReview() {
  const { state, dispatch } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [actual, setActual] = useState("");
  const active = testCaseCards.find((t) => t.id === activeId);

  return (
    <div>
      <p className="muted">
        Execute each test case against its stated requirement (use the <Link to="/sandbox">bug-hunting sandbox</Link>{" "}
        where the requirement fits it), then record pass/fail/blocked with the actual result you observed.
      </p>
      {testCaseCards.map((t) => {
        const r = state.testRuns[t.id];
        const mod = modules.find((m) => m.id === t.moduleId);
        return (
          <div className="card pad-sm" key={t.id} style={{ marginBottom: 10 }}>
            <div className="row between">
              <div>
                <strong>{t.title}</strong>
                <div className="small muted">
                  Module {mod?.letter} - <span className={`chip ${t.classification === "positive" ? "chip-ok" : t.classification === "negative" ? "chip-bad" : "chip-warn"}`}>{t.classification}</span> {t.topic}
                </div>
              </div>
              <div className="row">
                {r && <span className={`chip ${r.status === "pass" ? "chip-ok" : r.status === "fail" ? "chip-bad" : "chip-warn"}`}>{r.status}</span>}
                <button type="button" className="btn btn-sm" onClick={() => { setActiveId(t.id === activeId ? null : t.id); setActual(r?.actual ?? ""); }}>
                  {t.id === activeId ? "Close" : "Open"}
                </button>
              </div>
            </div>
            {t.id === activeId && (
              <div style={{ marginTop: 12 }} className="fade-in">
                <div className="defn">
                  <dt>Requirement</dt>
                  <dd>{t.requirement}</dd>
                </div>
                <div className="grid2">
                  <div>
                    <h4>Preconditions</h4>
                    <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
                      {t.preconditions.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <h4 style={{ marginTop: 10 }}>Test data</h4>
                    <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
                      {t.testData.map((p) => (
                        <li key={p} className="mono">{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Steps</h4>
                    <ol style={{ paddingLeft: "1.2em", margin: 0 }}>
                      {t.steps.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="callout tip" style={{ marginTop: 12 }}>
                  <h4>Expected result</h4>
                  <p style={{ margin: 0 }}>{t.expected}</p>
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <label htmlFor="tc-actual">Actual result you observed</label>
                  <textarea id="tc-actual" className="textarea" value={actual} onChange={(e) => setActual(e.target.value)} placeholder="What actually happened - facts only, no interpretation." />
                </div>
                <div className="row">
                  <button type="button" className="btn" style={{ borderColor: "var(--ok)", color: "var(--ok)" }} disabled={!active} onClick={() => { dispatch({ type: "recordTestRun", testCardId: t.id, status: "pass", actual: actual || "As expected" }); setActiveId(null); }}>
                    Record pass
                  </button>
                  <button type="button" className="btn btn-danger" disabled={actual.trim().length < 5} onClick={() => { dispatch({ type: "recordTestRun", testCardId: t.id, status: "fail", actual: actual.trim() }); setActiveId(null); }}>
                    Record fail (actual result required)
                  </button>
                  <button type="button" className="btn" onClick={() => { dispatch({ type: "recordTestRun", testCardId: t.id, status: "blocked", actual: actual || "Blocked - reason not given" }); setActiveId(null); }}>
                    Blocked
                  </button>
                </div>
                <p className="small muted" style={{ margin: "8px 0 0" }}>
                  If the actual result differs from expected, consider filing it in the <Link to="/sandbox">defect report workspace</Link>.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
