/** Modules list + single module overview. */

import { Link, useParams } from "react-router-dom";
import { CONTENT_NOTE, moduleById, modules } from "../content";
import { useStore } from "../state/store";
import { moduleLessonProgress, moduleQuizBest } from "../state/selectors";
import { EmptyState, PageHead, ProgressBar } from "../components/ui";

export function ModulesList() {
  const { state } = useStore();
  const firstOpen = modules.find((m) => moduleLessonProgress(state, m.id).done < moduleLessonProgress(state, m.id).total)?.id;
  return (
    <div className="fade-in">
      <PageHead
        eyebrow="Chapters"
        title="Learning modules"
        lede={
          <>
            Three complete starter modules with lessons, flashcards, quizzes, challenges, and interactive visuals.
            Internal course numbering - not official certification chapters.
          </>
        }
      />
      {modules.map((m) => {
        const p = moduleLessonProgress(state, m.id);
        const best = moduleQuizBest(state, m.id);
        return (
          <div className={`card module-card${m.id === firstOpen ? " sketch" : ""}`} key={m.id} style={{ marginBottom: 14 }}>
            <span className="module-letter" aria-hidden>{m.letter}</span>
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>{m.letter}. {m.title}</h2>
                <p className="muted" style={{ margin: 0 }}>{m.subtitle}</p>
              </div>
              <span className={`chip ${m.level === "foundation" ? "chip-info" : "chip-warn"}`}>{m.level}</span>
            </div>
            <div className="row" style={{ margin: "12px 0" }}>
              <span className="chip">{m.lessons.length} lessons</span>
              <span className="chip">{m.cards.length} flashcards</span>
              <span className="chip">{m.quiz.length} quiz questions</span>
              <span className="chip">{m.challenges.length} challenges</span>
              <span className="chip">~{m.minutes} min</span>
              {best !== null && <span className="chip chip-ok">quiz best {best}%</span>}
              {p.pct > 0 && <span className="chip chip-accent">{p.pct}% read</span>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <ProgressBar pct={p.pct} label={`Module ${m.letter} lesson progress`} />
              <span className="small muted">{p.done}/{p.total} lessons completed</span>
            </div>
            {m.prereqIds.length > 0 && (
              <p className="small muted" style={{ margin: "0 0 10px" }}>
                Prerequisite: {m.prereqIds.map((id) => moduleById(id)?.title).join(", ")} - recommended, not enforced.
              </p>
            )}
            <Link className="btn btn-primary" to={`/modules/${m.id}`}>Open module</Link>
          </div>
        );
      })}
      <p className="small muted">{CONTENT_NOTE}</p>
    </div>
  );
}

export function ModulePage() {
  const { moduleId } = useParams();
  const { state, dispatch } = useStore();
  const mod = moduleById(moduleId ?? "");
  if (!mod) {
    return <EmptyState title="Module not found">Check the modules list.</EmptyState>;
  }
  const p = moduleLessonProgress(state, mod.id);
  const quizDone = state.quizSessions.some((s) => s.moduleId === mod.id);

  return (
    <div className="fade-in">
      <div className="crumbs">
        <Link to="/modules">Modules</Link> / Module {mod.letter}
      </div>
      <div className="page-head">
        <div className="eyebrow">Module {mod.letter} of {modules[modules.length - 1].letter}</div>
        <h1>
          {mod.title}
        </h1>
        <p className="lede">{mod.subtitle}</p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Learning objectives</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
          {mod.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <h2 style={{ margin: 0 }}>Lessons</h2>
          <span className="small muted">
            {p.done}/{p.total} completed
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <ProgressBar pct={p.pct} label="Lesson progress" />
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
          {mod.lessons.map((l, i) => {
            const done = Boolean(state.lessons[l.id]);
            return (
              <li key={l.id} style={{ borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
                <div className="row between">
                  <div>
                    <Link to={`/modules/${mod.id}/lessons/${l.id}`} style={{ fontWeight: 600 }}>
                      {done ? "✓ " : ""}
                      {i + 1}. {l.title}
                    </Link>
                    <div className="small muted">{l.minutes} min - {l.objectives[0]}</div>
                  </div>
                  <div className="row">
                    {l.blocks.some((b) => b.kind === "diagram") && <span className="chip chip-accent">visual</span>}
                    <button
                      type="button"
                      className="chip chip-button"
                      aria-pressed={state.bookmarks.some((b) => b.kind === "lesson" && b.refId === l.id)}
                      onClick={() => dispatch({ type: "toggleBookmark", kind: "lesson", refId: l.id })}
                    >
                      bookmark
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Quiz</h2>
          <p className="muted small">
            {mod.quiz.length} original questions - practice mode (instant explanations) or assessment mode (explanations after submit, optional timer).
          </p>
          <Link className={`btn ${quizDone ? "" : "btn-primary"}`} to={`/modules/${mod.id}/quiz`}>
            {quizDone ? "Retake quiz" : "Take the quiz"}
          </Link>
        </div>
        <div className="card">
          <h2>Flashcards</h2>
          <p className="muted small">{mod.cards.length} concept cards feed the spaced-repetition schedule in Review.</p>
          <Link className="btn" to="/review">Review cards</Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Challenges</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {mod.challenges.map((c) => {
            const st = state.challenges[c.id];
            return (
              <li key={c.id} style={{ borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
                <div className="row between">
                  <Link to={`/challenges/${c.id}`} style={{ fontWeight: 600 }}>
                    {c.title}
                  </Link>
                  <span className="row">
                    <span className="chip">{c.minutes} min</span>
                    {st?.status === "self-checked" && <span className="chip chip-ok">self-checked</span>}
                    {st?.status === "attempted" && <span className="chip chip-warn">attempted</span>}
                  </span>
                </div>
                <div className="small muted">{c.brief}</div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Module recap</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
          {mod.recap.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
