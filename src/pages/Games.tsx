/** Minigames hub + the three games. Accuracy over speed; timers optional (none forced). */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../state/store";
import { EmptyState } from "../components/ui";
import {
  boundaryRounds,
  classLabels,
  evaluateRound,
  formatValue,
  type BoundaryEval,
} from "../games/boundary";
import { bucketLabels, evaluateSort, sortItems, type SortBucket } from "../games/sorter";
import {
  drawRound,
  glossaryPairs,
  matchAccuracy,
  type MatchRound,
} from "../games/matcher";
import {
  detectiveScenes,
  fileFinding,
  filterTxns,
  passwordCheck,
  shopDiscount,
  type FindingVerdict,
} from "../games/detective";

export function GamesPage() {
  const { gameId } = useParams();
  const { state } = useStore();

  if (!gameId) {
    return (
      <div className="fade-in">
        <div className="page-head">
          <div className="eyebrow">Practise</div>
          <h1>Minigames</h1>
          <p className="lede">
            Short, focused exercises. Understanding beats speed - no timers unless noted. Scores are personal bests,
            not leaderboards.
          </p>
        </div>
        <div className="grid2">
          <div className="card">
            <h2>Boundary Hunter</h2>
            <p className="muted small">Given a field's valid range, pick the values the technique needs. Learn the ISTQB 2-value and 3-value BVA sets.</p>
            <div className="row">
              <span className="chip">best {state.games.boundaryBest} pts</span>
              <Link className="btn btn-primary" to="/games/boundary">Play</Link>
            </div>
          </div>
          <div className="card">
            <h2>Defect Detective</h2>
            <p className="muted small">Probe small apps with real planted defects. File findings with evidence - random guessing earns nothing.</p>
            <div className="row">
              <span className="chip">{state.games.detectiveFound.length}/5 defects found</span>
              <Link className="btn btn-primary" to="/games/detective">Play</Link>
            </div>
          </div>
          <div className="card">
            <h2>Test Design Sorter</h2>
            <p className="muted small">Sort testing scenarios into the technique each one demonstrates. Keyboard-friendly.</p>
            <div className="row">
              <span className="chip">best {state.games.sorterBest}/{sortItems.length}</span>
              <Link className="btn btn-primary" to="/games/sorter">Play</Link>
            </div>
          </div>
          <div className="card">
            <h2>Glossary Match</h2>
            <p className="muted small">Pair {glossaryPairs.length} ISTQB terms with their definitions. No repeats until the whole deck is matched.</p>
            <div className="row">
              <span className="chip">best accuracy {matcherBest(state)}%</span>
              <Link className="btn btn-primary" to="/games/matcher">Play</Link>
            </div>
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 14 }}>
          Future games planned: severity vs priority triage, regression selection, state transition puzzles, API response diagnosis, flakiness investigation. See the <Link to="/roadmap">roadmap</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="crumbs">
        <Link to="/games">Minigames</Link> / {gameId}
      </div>
      {gameId === "boundary" && <BoundaryHunter />}
      {gameId === "detective" && <DefectDetective />}
      {gameId === "sorter" && <TestDesignSorter />}
      {gameId === "matcher" && <GlossaryMatch />}
      {!["boundary", "detective", "sorter", "matcher"].includes(gameId) && <EmptyState title="Unknown game">Back to <Link to="/games">minigames</Link>.</EmptyState>}
    </div>
  );
}

/** Best matcher accuracy (0-100) recorded across game sessions, or 100 when never played (no penalty for a first visit). */
function matcherBest(state: { games: { sessions: { game: string; score: number }[] } }): number {
  const scores = state.games.sessions.filter((s) => s.game === "matcher").map((s) => s.score);
  return scores.length ? Math.max(...scores) : 100;
}

/* ================= Glossary Match ================= */

function GlossaryMatch() {
  const { dispatch } = useStore();
  const [deck, setDeck] = useState<{ round: MatchRound; remaining: typeof glossaryPairs }>(() => drawRound(glossaryPairs, 6));
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selDef, setSelDef] = useState<string | null>(null);
  const [wrongSel, setWrongSel] = useState<{ term: string; def: string } | null>(null);
  const [sessionMatched, setSessionMatched] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [reshuffled, setReshuffled] = useState(false);

  const round = deck.round;
  const roundComplete = matchedIds.length === round.pairs.length;

  const pick = (kind: "term" | "def", id: string) => {
    if (wrongSel || matchedIds.includes(id)) return;
    const term = kind === "term" ? id : selTerm;
    const def = kind === "def" ? id : selDef;
    if (kind === "term") setSelTerm(id);
    else setSelDef(id);
    if (term && def) {
      if (term === def) {
        const nextMatched = [...matchedIds, id];
        setMatchedIds(nextMatched);
        setSelTerm(null);
        setSelDef(null);
        setSessionMatched((n) => n + 1);
        if (nextMatched.length === round.pairs.length) {
          // round done: record accuracy over everything attempted this session
          const wrongNow = sessionWrong;
          dispatch({ type: "gameSession", game: "matcher", score: matchAccuracy(sessionMatched + 1, wrongNow) });
        }
      } else {
        setSessionWrong((n) => n + 1);
        // flash only the two clicked cards: track the wrong pick per column, since
        // a pair id names both a term card and a definition card
        setWrongSel(kind === "term" ? { term: id, def: selDef! } : { term: selTerm!, def: id });
        window.setTimeout(() => {
          setWrongSel(null);
          setSelTerm(null);
          setSelDef(null);
        }, 550);
      }
    }
  };

  const nextRound = () => {
    if (deck.remaining.length === 0) {
      // deck mastered: reshuffle all pairs and start a fresh run
      setReshuffled(true);
      setSessionMatched(0);
      setSessionWrong(0);
      setDeck(drawRound(glossaryPairs, 6));
    } else {
      setDeck(drawRound(deck.remaining, 6));
    }
    setMatchedIds([]);
    setSelTerm(null);
    setSelDef(null);
    setWrongSel(null);
  };

  return (
    <div>
      <div className="page-head">
        <h1>Glossary Match</h1>
        <p className="lede">
          Select a term on the left, then its definition on the right. Wrong pairs shake and cost accuracy - the deck
          only reshuffles after every one of the {glossaryPairs.length} terms has been matched.
        </p>
      </div>
      <div className="row" style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <span className="chip chip-accent">deck {deck.remaining.length + (round.pairs.length - matchedIds.length)} to go</span>
        <span className="chip">round {matchedIds.length}/{round.pairs.length}</span>
        <span className="chip">accuracy {matchAccuracy(sessionMatched, sessionWrong)}%</span>
        {reshuffled && <span className="chip chip-ok">deck mastered - full reshuffle</span>}
      </div>
      <div className="match-board" style={roundComplete ? undefined : { marginBottom: 14 }}>
        <div className="match-col" aria-label="Terms">
          <h2 className="match-col-title">Terms</h2>
          {round.termOrder.map((i) => {
            const p = round.pairs[i];
            const matched = matchedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`match-card${matched ? " matched" : selTerm === p.id ? " selected" : ""}${wrongSel?.term === p.id ? " wrong" : ""}`}
                aria-pressed={selTerm === p.id}
                disabled={matched}
                onClick={() => pick("term", p.id)}
              >
                {p.term}
              </button>
            );
          })}
        </div>
        <div className="match-col" aria-label="Definitions">
          <h2 className="match-col-title">Definitions</h2>
          {round.defOrder.map((i) => {
            const p = round.pairs[i];
            const matched = matchedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`match-card match-def${matched ? " matched" : selDef === p.id ? " selected" : ""}${wrongSel?.def === p.id ? " wrong" : ""}`}
                aria-pressed={selDef === p.id}
                disabled={matched}
                onClick={() => pick("def", p.id)}
              >
                {p.def}
              </button>
            );
          })}
        </div>
      </div>
      {roundComplete ? (
        <div className="card fade-in" style={{ marginBottom: 14 }}>
          <h2>Round complete</h2>
          <p className="muted" style={{ margin: "0 0 10px" }}>
            {deck.remaining.length === 0
              ? "That was the last of the deck - all " + glossaryPairs.length + " terms matched. The next round reshuffles everything."
              : deck.remaining.length + " terms left in the deck."}
          </p>
          <button type="button" className="btn btn-primary" onClick={nextRound}>
            {deck.remaining.length === 0 ? "Reshuffle the deck" : "Next round"}
          </button>
        </div>
      ) : (
        <p className="hand-note" style={{ margin: "0 0 14px" }}>
          say the definition out loud before you click - retrieval beats recognition
        </p>
      )}
    </div>
  );
}

/* ================= Boundary Hunter ================= */

function BoundaryHunter() {
  const { state, dispatch } = useStore();
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<BoundaryEval | null>(null);
  const [total, setTotal] = useState(0);
  const round = boundaryRounds[roundIdx];
  const finished = roundIdx >= boundaryRounds.length;

  const finishRound = () => {
    const evalResult = evaluateRound(round, selected);
    setResult(evalResult);
    setTotal((t) => t + evalResult.points);
  };

  if (finished) {
    const best = Math.max(state.games.boundaryBest, total);
    return (
      <div className="card">
        <h1>Boundary Hunter complete</h1>
        <p className="stat-num">{total} points</p>
        <p className="muted">
          Missed values teach more than hits: each round's explanation names the exact class (min, min+, max-, ...) you skipped.
        </p>
        <div className="row">
          <span className="chip chip-ok">personal best {best}</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              dispatch({ type: "gameSession", game: "boundary", score: total, best: "boundaryBest" });
              setRoundIdx(0);
              setSelected([]);
              setResult(null);
              setTotal(0);
            }}
          >
            Save score + play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h1>Boundary Hunter</h1>
        <p className="lede">
          Round {roundIdx + 1} of {boundaryRounds.length} - <strong>{round.technique}</strong> BVA. {round.scenario}
        </p>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h2>Specification</h2>
        <p>
          <strong>{round.spec.name}</strong>: {round.spec.rule}
        </p>
        <p className="small muted">Technique target: {round.technique} set - {techniqueHint(round.technique)}</p>
      </div>
      <div className="card">
        <h2>Pick your values ({selected.length} selected)</h2>
        <div className="value-pool" role="group" aria-label="Candidate values">
          {round.candidates.map((v) => {
            const isSel = selected.includes(v);
            let cls = "value-token";
            if (result) {
              const c = classLabelsForResult(round.spec, v, result);
              if (c) cls += ` ${c}`;
            }
            return (
              <button
                key={v}
                type="button"
                className={cls}
                aria-pressed={isSel}
                disabled={Boolean(result)}
                onClick={() => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))}
              >
                {formatValue(round.spec, v)}
              </button>
            );
          })}
        </div>
        {!result ? (
          <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} disabled={selected.length === 0} onClick={finishRound}>
            Submit values
          </button>
        ) : (
          <div className="fade-in" style={{ marginTop: 14 }}>
            <h3>
              {result.points}/{result.targetCount} points
              {result.extra.length > 0 && <span className="chip chip-warn" style={{ marginLeft: 8 }}>{result.extra.length} outside the technique</span>}
            </h3>
            {result.missed.length > 0 ? (
              <>
                <p><strong>Missed:</strong></p>
                <ul style={{ marginTop: 0 }}>
                  {result.missed.map((m) => (
                    <li key={m.cls}>
                      <code>{formatValue(round.spec, m.value)}</code> - {classLabels[m.cls]}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="chip chip-ok">Complete set - nothing missed</p>
            )}
            {result.extra.length > 0 && (
              <>
                <p><strong>Not part of this technique's set:</strong></p>
                <ul style={{ marginTop: 0 }}>
                  {result.extra.map((e) => (
                    <li key={e.value}>
                      <code>{formatValue(round.spec, e.value)}</code> - {classLabels[e.cls]} (useful in other techniques, extra here)
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setRoundIdx((i) => i + 1);
                setSelected([]);
                setResult(null);
              }}
            >
              {roundIdx === boundaryRounds.length - 1 ? "See score" : "Next round"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function classLabelsForResult(spec: BoundarySpecAlias, v: number, result: BoundaryEval): string {
  if (result.missed.some((m) => Math.abs(m.value - v) < spec.step / 2)) return "missed";
  if (result.extra.some((e) => Math.abs(e.value - v) < spec.step / 2)) return "extra";
  return "correct";
}
type BoundarySpecAlias = { step: number };

function techniqueHint(t: "2-value" | "3-value"): string {
  if (t === "2-value") return "each boundary value plus its closest neighbour in the adjacent partition (min-1, min, max, max+1)";
  return "each boundary value plus both its neighbours (min-1, min, min+1, max-1, max, max+1)";
}

/* ================= Defect Detective ================= */

function DefectDetective() {
  const { state, dispatch } = useStore();
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = detectiveScenes[sceneIdx];
  const [ruleId, setRuleId] = useState("");
  const [repro, setRepro] = useState("");
  const [verdict, setVerdict] = useState<FindingVerdict | null>(null);
  const [revealed, setRevealed] = useState(false);

  const submit = () => {
    const v = fileFinding(scene, ruleId, repro, state.games.detectiveFound);
    setVerdict(v);
    if (v === "accepted") dispatch({ type: "detectiveFound", defectId: ruleId });
  };

  return (
    <div>
      <div className="page-head">
        <h1>Defect Detective</h1>
        <p className="lede">{scene.intro} Findings need evidence: reproduction steps containing what you did and what you observed.</p>
      </div>
      <div className="tabs" role="tablist">
        {detectiveScenes.map((s, i) => (
          <button key={s.id} role="tab" aria-selected={i === sceneIdx} className="tab" onClick={() => { setSceneIdx(i); setRuleId(""); setRepro(""); setVerdict(null); }}>
            {s.name.replace("Scene ", "S")}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Specification (ground truth)</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
          {scene.rules.map((r) => (
            <li key={r.id} style={{ marginBottom: 6 }}>
              <code>{r.id}</code> {r.text}
            </li>
          ))}
        </ul>
        <p className="small muted" style={{ margin: "8px 0 0" }}>Not every rule is broken. Findings against correct behaviour are not defects.</p>
      </div>

      {scene.id === "dd-shop" && <ShopWidget />}
      {scene.id === "dd-pass" && <PasswordWidget />}
      {scene.id === "dd-tx" && <TxnWidget />}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>File a finding</h2>
        <div className="field">
          <label htmlFor="dd-rule">Which specification line does your finding concern?</label>
          <select id="dd-rule" className="select" value={ruleId} onChange={(e) => { setRuleId(e.target.value); setVerdict(null); }}>
            <option value="">- choose a rule -</option>
            {scene.rules.map((r) => (
              <option key={r.id} value={r.id}>{r.id}: {r.text.slice(0, 60)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dd-repro">Reproduction steps + observed vs expected (evidence: at least 40 characters, include the values you used)</label>
          <textarea id="dd-repro" className="textarea" value={repro} onChange={(e) => setRepro(e.target.value)} placeholder="1) Entered 145.55 in the amount field. 2) Widget showed total 130.99. Expected: 131.00 (10% off 145.55 = 130.995, rounds half-up)." />
        </div>
        <button type="button" className="btn btn-primary" disabled={!ruleId || repro.trim().length < 10} onClick={submit}>
          Submit finding
        </button>
        {verdict && (
          <div className="fade-in" style={{ marginTop: 12 }}>
            {verdict === "accepted" && (
              <div className="callout tip">
                <h4>Finding accepted - it is a real defect</h4>
                <p style={{ margin: 0 }}>{scene.rules.find((r) => r.id === ruleId)?.explanation}</p>
              </div>
            )}
            {verdict === "weak-evidence" && (
              <div className="callout mistake">
                <h4>Insufficient evidence</h4>
                <p style={{ margin: 0 }}>
                  A finding needs reproduction steps with the values you used (numbers) and what you observed - at least 40 characters.
                  "It feels wrong" is not evidence.
                </p>
              </div>
            )}
            {verdict === "no-defect" && (
              <div className="callout note">
                <h4>Not a defect</h4>
                <p style={{ margin: 0 }}>The behaviour you filed against matches its specification. Well-tested hypotheses include negatives.</p>
              </div>
            )}
            {verdict === "duplicate" && <p className="chip chip-warn">Already found this one.</p>}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row between">
          <span className="chip chip-accent">{state.games.detectiveFound.length}/5 defects found with evidence</span>
          <button type="button" className="btn btn-danger" onClick={() => setRevealed(true)}>Reveal all solutions</button>
        </div>
        {revealed && (
          <ul style={{ marginTop: 12 }}>
            {detectiveScenes.flatMap((s) =>
              s.rules
                .filter((r) => r.hasDefect)
                .map((r) => (
                  <li key={r.id} style={{ marginBottom: 8 }}>
                    <strong>{r.defectTitle}</strong> ({r.id}): {r.explanation}
                  </li>
                )),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function ShopWidget() {
  const [amount, setAmount] = useState("100");
  const n = Number(amount);
  const valid = !Number.isNaN(n) && n >= 0;
  const r = valid ? shopDiscount(n) : null;
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h2>Order calculator</h2>
      <div className="field">
        <label htmlFor="shop-amount">Order amount (EUR)</label>
        <input id="shop-amount" className="input mono" style={{ maxWidth: 200 }} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      {r && (
        <div>
          <p style={{ margin: "0 0 4px" }}>
            Total: <strong className="mono">{r.total.toFixed(2)}</strong>
            {r.discounted ? <span className="chip chip-ok" style={{ marginLeft: 8 }}>discount applied</span> : <span className="chip" style={{ marginLeft: 8 }}>no discount</span>}
          </p>
          <p className="muted small mono" style={{ margin: 0 }}>discount line: {r.discountLine !== null ? r.discountLine.toFixed(2) : "-"}</p>
        </div>
      )}
    </div>
  );
}

function PasswordWidget() {
  const [pw, setPw] = useState("Sandbox1");
  const r = passwordCheck(pw);
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h2>Password validator</h2>
      <div className="field">
        <label htmlFor="pw-input">Choose a password</label>
        <input id="pw-input" className="input mono" style={{ maxWidth: 280 }} value={pw} onChange={(e) => setPw(e.target.value)} />
        <span className="hint">You entered {pw.length} characters.</span>
      </div>
      <p style={{ margin: 0 }}>
        <span className={`chip ${r.valid ? "chip-ok" : "chip-bad"}`}>{r.reason}</span>{" "}
        <span className="chip">strength: {r.strength}</span>
      </p>
    </div>
  );
}

function TxnWidget() {
  const [mode, setMode] = useState<"all" | "recent" | "large">("all");
  const list = filterTxns(mode);
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h2>Account history</h2>
      <div className="row" style={{ marginBottom: 10 }}>
        {(["all", "recent", "large"] as const).map((m) => (
          <button key={m} type="button" className={`btn btn-sm ${mode === m ? "btn-primary" : ""}`} onClick={() => setMode(m)}>
            {m === "all" ? "All" : m === "recent" ? "Recent (last 7 days)" : "Large (100+)"}
          </button>
        ))}
      </div>
      {list.map((t) => (
        <div className="txrow" key={t.id}>
          <span>{t.label}</span>
          <span className="mono" style={{ color: t.amount > 0 ? "var(--ok)" : "var(--ink)" }}>
            {t.amount > 0 ? "+" : ""}
            {t.amount.toFixed(2)}
          </span>
          <span className="muted small">{t.daysAgo === 0 ? "today" : `${t.daysAgo} day${t.daysAgo === 1 ? "" : "s"} ago`}</span>
        </div>
      ))}
      {list.length === 0 && <p className="muted">No transactions shown.</p>}
    </div>
  );
}

/* ================= Test Design Sorter ================= */

function TestDesignSorter() {
  const { dispatch } = useStore();
  const [answers, setAnswers] = useState<Record<string, SortBucket>>({});
  const [submitted, setSubmitted] = useState(false);
  const result = evaluateSort(answers);
  const bucketKeys = Object.keys(bucketLabels) as SortBucket[];

  return (
    <div>
      <div className="page-head">
        <h1>Test Design Sorter</h1>
        <p className="lede">
          Which technique does each scenario demonstrate? Use the dropdown for each card (fully keyboard-accessible),
          then check your answers with explanations.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <p className="small muted" style={{ margin: 0 }}>
          Answered {Object.keys(answers).length}/{sortItems.length}
          {submitted && ` - correct: ${result.correct}/${result.total}`}
        </p>
      </div>

      {sortItems.map((item, i) => {
        const given = answers[item.id];
        const isRight = given === item.bucket;
        return (
          <div className="card pad-sm" key={item.id} style={{ marginBottom: 10 }}>
            <div className="sorter-item" style={{ border: "none", padding: 0 }}>
              <div style={{ flex: 1 }}>
                <span className="muted small">{i + 1}.</span> {item.text}
              </div>
              <div className="row">
                <label className="visually-hidden" htmlFor={`bucket-${item.id}`.replace(/_/g, "-")}>
                  Technique for scenario {i + 1}
                </label>
                <select
                  id={`bucket-${item.id}`.replace(/_/g, "-")}
                  className="select"
                  style={{ width: 230 }}
                  value={given ?? ""}
                  disabled={submitted}
                  onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value as SortBucket }))}
                >
                  <option value="">choose technique...</option>
                  {bucketKeys.map((b) => (
                    <option key={b} value={b}>{bucketLabels[b]}</option>
                  ))}
                </select>
                {submitted && given && (
                  <span className={`chip ${isRight ? "chip-ok" : "chip-bad"}`}>{isRight ? "correct" : "incorrect"}</span>
                )}
              </div>
            </div>
            {submitted && given && (
              <p className={`small ${isRight ? "muted" : ""}`} style={{ margin: "8px 0 0" }}>
                {isRight ? "Correct. " : `Actually: ${bucketLabels[item.bucket]}. `}{item.why}
              </p>
            )}
          </div>
        );
      })}

      <div className="row">
        {!submitted ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={Object.keys(answers).length < sortItems.length}
            onClick={() => {
              setSubmitted(true);
              dispatch({ type: "gameSession", game: "sorter", score: result.correct, best: "sorterBest" });
            }}
          >
            Check answers
          </button>
        ) : (
          <>
            <span className="chip chip-accent">Score {result.correct}/{result.total}</span>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Play again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
