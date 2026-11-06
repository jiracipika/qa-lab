/** Challenge list + single challenge with progressive hints, sample solution, rubric self-assessment. */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { modules } from "../content";
import { challengeById } from "../content";
import { useStore } from "../state/store";
import { CodeBlock, EmptyState, T } from "../components/ui";

export function ChallengesList() {
  const { state } = useStore();
  const all = modules.flatMap((m) => m.challenges.map((c) => ({ c, m })));
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">Practise</div>
        <h1>Practical challenges</h1>
        <p className="lede">
          Exercises that mirror real QA work: test design, defect reporting, regression selection, API diagnosis,
          flaky-test debugging. Open-ended answers are self-assessed against a transparent rubric - no pretend
          keyword-matching.
        </p>
      </div>
      {all.map(({ c, m }) => {
        const st = state.challenges[c.id];
        return (
          <div className="card" key={c.id} style={{ marginBottom: 12 }}>
            <div className="row between">
              <div>
                <Link to={`/challenges/${c.id}`} style={{ fontWeight: 650, fontSize: "1.05rem" }}>
                  {c.title}
                </Link>
                <div className="small muted" style={{ marginTop: 2 }}>
                  Module {m.letter} - {c.kind.replace("-", " ")} - {c.minutes} min
                </div>
              </div>
              <div className="row">
                {st?.status === "self-checked" && <span className="chip chip-ok">self-checked {st.selfScore !== undefined ? st.selfScore + "%" : ""}</span>}
                {st?.status === "attempted" && <span className="chip chip-warn">attempted</span>}
                <Link className="btn" to={`/challenges/${c.id}`}>Open</Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const KIND_LABEL: Record<string, string> = {
  "test-cases": "Write test cases",
  "missing-ac": "Find missing acceptance criteria",
  boundaries: "Boundary value analysis",
  "decision-table": "Build a decision table",
  states: "State transition analysis",
  "defect-report": "Write a defect report",
  regression: "Regression test selection",
  "api-response": "Interpret an API response",
  assertions: "Strengthen assertions",
  flaky: "Diagnose flaky automation",
};

export function ChallengePage() {
  const { challengeId } = useParams();
  const { state, dispatch } = useStore();
  const challenge = challengeById(challengeId ?? "");
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!challenge) {
    return <EmptyState title="Challenge not found">Back to <Link to="/challenges">challenges</Link>.</EmptyState>;
  }
  const mod = modules.find((m) => m.id === challenge.moduleId)!;
  const rubricDone = Object.values(checked).filter(Boolean).length;
  const selfScore = Math.round((rubricDone / challenge.rubric.length) * 100);
  const revealKey = `challenge:${challenge.id}`;
  const alreadyRevealed = Boolean(state.revealedSolutions[revealKey]);

  return (
    <div className="fade-in">
      <div className="crumbs">
        <Link to="/challenges">Challenges</Link> / {challenge.title}
      </div>
      <div className="page-head">
        <div className="eyebrow">Challenge - {challenge.kind.replace("-", " ")}</div>
        <h1>{challenge.title}</h1>
        <p className="lede">
          {KIND_LABEL[challenge.kind]} - {challenge.minutes} min - Module {mod.letter}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Brief</h2>
        <p style={{ marginBottom: 0 }}>
          <T text={challenge.brief} />
        </p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>The scenario</h2>
        {challenge.context.split("\n\n").map((para, i) => (
          <p key={i} style={{ whiteSpace: "pre-wrap" }}>
            <T text={para} />
          </p>
        ))}
        {challenge.code && <CodeBlock code={challenge.code} />}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Hints (progressive)</h2>
        <p className="small muted">Try seriously before opening hints - struggle is where learning happens.</p>
        {challenge.hints.slice(0, hintsShown).map((h, i) => (
          <div className="callout note" key={i}>
            <h4>Hint {i + 1}</h4>
            <p style={{ margin: 0 }}>
              <T text={h} />
            </p>
          </div>
        ))}
        {hintsShown < challenge.hints.length && (
          <button type="button" className="btn" onClick={() => setHintsShown((n) => n + 1)}>
            Show hint {hintsShown + 1} of {challenge.hints.length}
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <h2 style={{ margin: 0 }}>Sample solution</h2>
          {solutionShown || alreadyRevealed ? (
            <span className="chip chip-warn">revealed</span>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setSolutionShown(true);
                dispatch({ type: "revealSolution", key: revealKey });
              }}
            >
              Reveal solution
            </button>
          )}
        </div>
        {(solutionShown || alreadyRevealed) &&
          challenge.solution.split("\n\n").map((para, i) => (
            <p key={i} style={{ whiteSpace: "pre-wrap" }}>
              <T text={para} />
            </p>
          ))}
      </div>

      <div className="card">
        <h2>Rubric self-assessment</h2>
        <p className="small muted">
          Work through your answer honestly. Each item you genuinely covered counts - this self-score is for you;
          it is not proof of mastery, and keyword matching cannot judge a real answer.
        </p>
        <ul className="checklist" style={{ listStyle: "none", padding: 0, margin: "0 0 14px" }}>
          {challenge.rubric.map((r, i) => (
            <li key={i}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={Boolean(checked[i])}
                  onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                />
                <span>{r}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="row between">
          <strong>
            Self-score: {rubricDone}/{challenge.rubric.length} ({selfScore}%)
          </strong>
          <div className="row">
            <button
              type="button"
              className="btn"
              onClick={() => dispatch({ type: "challengeProgress", challengeId: challenge.id, status: "attempted", title: challenge.title })}
            >
              Mark attempted
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => dispatch({ type: "challengeProgress", challengeId: challenge.id, status: "self-checked", selfScore, title: challenge.title })}
            >
              Save self-assessment
            </button>
          </div>
        </div>
        <p className="small muted" style={{ margin: "10px 0 0" }}>
          {state.challenges[challenge.id]?.selfScore !== undefined && `Saved self-score: ${state.challenges[challenge.id].selfScore}%. `}
          Save your written answer in the <Link to="/tools?tab=workspace">workspace</Link> if you want to keep it.
        </p>
      </div>
    </div>
  );
}
