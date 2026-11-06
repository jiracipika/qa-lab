/** Roadmap: honestly labelled upcoming modules (no empty pages) + content health note. */

import { Link } from "react-router-dom";
import { roadmap } from "../content/interview";
import { modules } from "../content";
import { validateModules, validateTestCaseCards } from "../lib/contentValidation";
import { testCaseCards } from "../content/interview";

export function RoadmapPage() {
  const issues = [
    ...validateModules(modules, { minLessons: 5, minCards: 10, minQuiz: 20, minChallenges: 2 }),
    ...validateTestCaseCards(testCaseCards, modules),
  ];

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">Where this goes</div>
        <h1>Curriculum roadmap</h1>
        <p className="lede">
          Available now: three complete starter modules. Everything below is <strong>planned, not playable</strong> -
          no stub lessons, no fake content. Built next based on demand and study data.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Available now</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
          {modules.map((m) => (
            <li key={m.id}>
              <Link to={`/modules/${m.id}`}>Module {m.letter}: {m.title}</Link> - {m.lessons.length} lessons, {m.cards.length} cards, {m.quiz.length} quiz questions, {m.challenges.length} challenges
            </li>
          ))}
          <li><Link to="/games">Three minigames</Link> - Boundary Hunter, Defect Detective, Test Design Sorter</li>
          <li><Link to="/sandbox">Bug-hunting sandbox</Link> - fictional bank with 6 documented planted defects</li>
        </ul>
      </div>

      <h2 style={{ marginBottom: 10 }}>Planned modules (not yet available)</h2>
      <div className="stack">
        {roadmap.map((r) => (
          <div className="card pad-sm" key={r.id}>
            <div className="row between">
              <h3 style={{ margin: 0 }}>{r.title}</h3>
              <span className="chip chip-warn">planned - not yet built</span>
            </div>
            <p className="muted small" style={{ margin: "6px 0" }}>{r.blurb}</p>
            <div className="row">
              {r.tracks.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
              {r.tools.map((t) => (
                <span key={t} className="chip chip-info">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Content health</h2>
        <p className="small muted">
          All content records are validated automatically (unique stable IDs, complete options and explanations, minimum
          counts per module). Current check: <strong>{issues.length === 0 ? "all validations pass" : `${issues.length} issues`}</strong>.
        </p>
        {issues.length > 0 && (
          <ul style={{ paddingLeft: "1.2em" }}>
            {issues.slice(0, 20).map((i, idx) => (
              <li key={idx} className="small">
                [{i.scope}] {i.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
