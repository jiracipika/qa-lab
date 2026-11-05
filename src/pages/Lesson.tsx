/** Lesson page: objectives, structured content, mistakes, confusion pairs, note-taking, recap, navigation. */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { moduleById } from "../content";
import { useStore } from "../state/store";
import { EmptyState, LessonBlocks } from "../components/ui";

export function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const { state, dispatch } = useStore();
  const mod = moduleById(moduleId ?? "");
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  const [note, setNote] = useState("");
  const existingNote = state.notes.filter((n) => n.lessonId === lessonId);

  if (!mod || !lesson) {
    return <EmptyState title="Lesson not found">Back to <Link to="/modules">modules</Link>.</EmptyState>;
  }

  const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const prev = mod.lessons[idx - 1];
  const next = mod.lessons[idx + 1];
  const done = Boolean(state.lessons[lesson.id]);
  const bookmarked = state.bookmarks.some((b) => b.kind === "lesson" && b.refId === lesson.id);

  return (
    <article className="fade-in">
      <div className="crumbs">
        <Link to="/modules">Modules</Link> / <Link to={`/modules/${mod.id}`}>Module {mod.letter}</Link> / {lesson.title}
      </div>
      <div className="page-head">
        <h1>{lesson.title}</h1>
        <p className="lede">
          Lesson {idx + 1} of {mod.lessons.length} - {lesson.minutes} min
        </p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Objectives</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
          {lesson.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      <LessonBlocks blocks={lesson.blocks} />

      {lesson.commonMistakes.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Common mistakes</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
            {lesson.commonMistakes.map((m) => (
              <li key={m.mistake} style={{ marginBottom: 8 }}>
                <strong>{m.mistake}</strong>
                <br />
                <span className="muted">{m.fix}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.confusedWith && lesson.confusedWith.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Easily confused</h2>
          {lesson.confusedWith.map((c) => (
            <div key={c.a + c.b} className="defn" style={{ background: "var(--bg-raised)" }}>
              <strong>{c.a}</strong> vs <strong>{c.b}</strong>
              <dd style={{ margin: "6px 0 0" }}>{c.tell}</dd>
            </div>
          ))}
          <p className="small muted" style={{ margin: 0 }}>
            More pairs in the <Link to="/glossary?tab=compare">comparison view</Link>.
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Your notes</h2>
        {existingNote.map((n) => (
          <div key={n.id} className="sorter-item" style={{ marginBottom: 8 }}>
            <span style={{ whiteSpace: "pre-wrap" }}>{n.text}</span>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => dispatch({ type: "deleteNote", id: n.id })}>
              Delete
            </button>
          </div>
        ))}
        <div className="field">
          <label htmlFor="lesson-note">Add a note for this lesson</label>
          <textarea
            id="lesson-note"
            className="textarea"
            value={note}
            placeholder="What clicked? What is still fuzzy? Your own words beat re-reading."
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn"
          disabled={note.trim().length < 3}
          onClick={() => {
            dispatch({ type: "addNote", text: note.trim(), lessonId: lesson.id, moduleId: mod.id });
            setNote("");
          }}
        >
          Save note
        </button>
      </div>

      {/* Recap */}
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Recap</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
          {lesson.recap.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      {/* Completion + navigation */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="row between">
          <div>
            {done ? (
              <span className="chip chip-ok">Lesson completed - knowledge is demonstrated in the quiz, not here</span>
            ) : (
              <span className="muted small">Marking complete records reading progress; quiz answers are the evidence of knowledge.</span>
            )}
          </div>
          {!done && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => dispatch({ type: "completeLesson", lessonId: lesson.id, moduleId: mod.id, title: lesson.title })}
            >
              Mark lesson complete
            </button>
          )}
        </div>
        <div className="lesson-nav">
          {prev ? (
            <Link className="btn" to={`/modules/${mod.id}/lessons/${prev.id}`}>
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="chip chip-button"
            aria-pressed={bookmarked}
            onClick={() => dispatch({ type: "toggleBookmark", kind: "lesson", refId: lesson.id })}
          >
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>
          {next ? (
            <Link className="btn btn-primary" to={`/modules/${mod.id}/lessons/${next.id}`}>
              {next.title} →
            </Link>
          ) : (
            <Link className="btn btn-primary" to={`/modules/${mod.id}/quiz`}>
              Finish with the quiz →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
