/** Modules list + single module overview. */

import { ArrowRight, Bookmark, Check, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CONTENT_NOTE, moduleById, modules } from "../content";
import { useStore } from "../state/store";
import { moduleLessonProgress, moduleQuizBest, nextLesson } from "../state/selectors";
import { EmptyState, PageHead, ProgressBar } from "../components/ui";

export function ModulesList() {
  const { state } = useStore();
  const recommended = nextLesson(state)?.module.id;

  return (
    <div className="fade-in">
      <PageHead
        title="Learning modules"
        lede={`${modules.length} modules with lessons, flashcards, quizzes, and hands-on exercises.`}
      />
      <div className="module-grid">
        {modules.map((module) => {
          const progress = moduleLessonProgress(state, module.id);
          const best = moduleQuizBest(state, module.id);
          const suggested = module.id === recommended;
          return (
            <article className="module-card" data-suggested={suggested} key={module.id}>
              <div className="module-card-header">
                <span className="module-letter" aria-hidden>{module.letter}</span>
                <div>
                  <p>Module {module.letter} · <span>{module.level}</span></p>
                  {suggested && <span className="chip chip-accent">Up next</span>}
                </div>
              </div>
              <h2>{module.title}</h2>
              <p className="module-summary">{module.subtitle}</p>
              <div className="module-facts">
                <span>{module.lessons.length} lessons</span>
                <span><Clock3 size={15} aria-hidden /> {module.minutes} min</span>
                {best !== null && <span>Quiz best {best}%</span>}
              </div>
              <div className="module-card-footer">
                <div className="module-card-progress">
                  <span>{progress.done} of {progress.total} lessons complete</span>
                  <ProgressBar pct={progress.pct} label={`Module ${module.letter} lesson progress`} />
                </div>
                <Link className="module-card-link" to={`/modules/${module.id}`} aria-label={`Open module ${module.letter}, ${module.title}`}>
                  Open module <ArrowRight size={17} aria-hidden />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <p className="small muted module-content-note">{CONTENT_NOTE}</p>
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

      <section className="card module-lessons" aria-labelledby="module-lessons-title">
        <div className="row between">
          <h2 id="module-lessons-title">Lessons</h2>
          <span className="small muted">{p.done} of {p.total} completed</span>
        </div>
        <ProgressBar pct={p.pct} label="Lesson progress" />
        <ol className="module-lesson-list">
          {mod.lessons.map((lesson, index) => {
            const done = Boolean(state.lessons[lesson.id]);
            const bookmarked = state.bookmarks.some((bookmark) => bookmark.kind === "lesson" && bookmark.refId === lesson.id);
            return (
              <li key={lesson.id}>
                <Link to={`/modules/${mod.id}/lessons/${lesson.id}`} className="module-lesson-link">
                  <span className="module-lesson-number" data-done={done} aria-hidden>{done ? <Check size={17} /> : index + 1}</span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <span className="module-lesson-objective">{lesson.minutes} min · {lesson.objectives[0]}</span>
                    {done && <span className="visually-hidden">Completed</span>}
                  </span>
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost lesson-bookmark"
                  aria-label={`Bookmark ${lesson.title}`}
                  aria-pressed={bookmarked}
                  onClick={() => dispatch({ type: "toggleBookmark", kind: "lesson", refId: lesson.id })}
                >
                  <Bookmark size={19} aria-hidden />
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card module-objectives" aria-labelledby="module-objectives-title">
        <h2 id="module-objectives-title">Learning objectives</h2>
        <ul>
          {mod.objectives.map((objective) => <li key={objective}>{objective}</li>)}
        </ul>
        {mod.prereqIds.length > 0 && (
          <div className="small muted module-prerequisites">
            <span>Recommended first</span>
            {mod.prereqIds.map((id) => <Link key={id} to={`/modules/${id}`}>{moduleById(id)?.title}</Link>)}
          </div>
        )}
      </section>

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
