/** Study tools: notes, bookmarks, mistake notebook, interview cards, study-session builder,
 *  saved workspace test cases. Tab state via ?tab=. */

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { allConceptCards, lessonById, modules, quizQuestionById } from "../content";
import { interviewCards } from "../content/interview";
import { useStore } from "../state/store";
import { dueConceptCards, mistakeCards } from "../state/selectors";
import { EmptyState } from "../components/ui";
import type { WorkspaceTestCase } from "../types/state";

const TABS = [
  { key: "study", label: "Study session builder" },
  { key: "interview", label: "Interview practice" },
  { key: "mistakes", label: "Mistake notebook" },
  { key: "notes", label: "Notes" },
  { key: "cards", label: "All flashcards" },
  { key: "workspace", label: "Test case workspace" },
] as const;

export function ToolsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") ?? "study") as (typeof TABS)[number]["key"];

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1>Study tools</h1>
        <p className="lede">Everything personal: session plans, interview rehearsal, your mistakes, notes, and saved test cases.</p>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className="tab" onClick={() => setParams({ tab: t.key })}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "study" && <StudyBuilder />}
      {tab === "interview" && <InterviewCards />}
      {tab === "mistakes" && <MistakeNotebook />}
      {tab === "notes" && <NotesTab />}
      {tab === "cards" && <AllCards />}
      {tab === "workspace" && <WorkspaceTab />}
    </div>
  );
}

/* ---------- study session builder ---------- */

function StudyBuilder() {
  const { state } = useStore();
  const [minutes, setMinutes] = useState<10 | 20 | 30>(20);
  const due = dueConceptCards(state);
  const mistakes = mistakeCards(state);
  const nextMod = modules.find((m) => m.lessons.some((l) => !state.lessons[l.id])) ?? modules[0];
  const nextLesson = nextMod.lessons.find((l) => !state.lessons[l.id]) ?? nextMod.lessons[0];

  const plan = buildPlan(minutes, due.length, mistakes.length, nextLesson.minutes);

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Build a session</h2>
        <div className="row" role="group" aria-label="Session length">
          {([10, 20, 30] as const).map((m) => (
            <button key={m} type="button" className={`btn ${minutes === m ? "btn-primary" : ""}`} onClick={() => setMinutes(m)}>
              {m} minutes
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Your {minutes}-minute plan</h2>
        <ol style={{ margin: 0, paddingLeft: "1.3em" }}>
          <li>
            <strong>{plan.cardMinutes} min - review cards</strong> ({Math.min(plan.cardCount, due.length)} due now).{" "}
            <Link to="/review">Start review</Link>
          </li>
          <li>
            <strong>{plan.lessonMinutes} min - lesson</strong>: {nextLesson.title} (Module {nextMod.letter}, {nextLesson.minutes} min - read at your pace).{" "}
            <Link to={`/modules/${nextMod.id}/lessons/${nextLesson.id}`}>Open</Link>
          </li>
          {plan.mistakeMinutes > 0 && mistakes.length > 0 && (
            <li>
              <strong>{plan.mistakeMinutes} min - mistakes</strong>: {mistakes.length} open from your notebook.{" "}
              <Link to="/tools?tab=mistakes">Revisit</Link>
            </li>
          )}
          {plan.quizMinutes > 0 && (
            <li>
              <strong>{plan.quizMinutes} min - quiz questions</strong> on a weak topic.{" "}
              <Link to="/quizzes">Choose a quiz</Link>
            </li>
          )}
        </ol>
        <p className="small muted" style={{ margin: "10px 0 0" }}>
          Plans adapt to what is actually due - nothing here is invented. If cards or mistakes run out, time shifts to lessons and quizzes.
        </p>
      </div>
    </div>
  );
}

function buildPlan(minutes: 10 | 20 | 30, dueCards: number, openMistakes: number, lessonMinutes: number) {
  const base = { cardMinutes: 0, lessonMinutes: 0, mistakeMinutes: 0, quizMinutes: 0, cardCount: 0 };
  let remaining: number = minutes;
  const p = { ...base };
  // Cards first (short, high value), then mistakes, then a lesson, remainder quiz.
  if (dueCards > 0) {
    p.cardMinutes = Math.min(remaining, Math.max(4, Math.min(10, Math.ceil(dueCards / 2))));
    p.cardCount = p.cardMinutes * 2;
    remaining -= p.cardMinutes;
  }
  if (openMistakes > 0 && remaining >= 4) {
    p.mistakeMinutes = Math.min(remaining, 5);
    remaining -= p.mistakeMinutes;
  }
  if (remaining >= 5) {
    p.lessonMinutes = Math.min(remaining, lessonMinutes, minutes >= 30 ? 15 : 10);
    remaining -= p.lessonMinutes;
  }
  if (remaining >= 3) {
    p.quizMinutes = remaining;
    remaining = 0;
  }
  return p;
}

/* ---------- interview cards ---------- */

function InterviewCards() {
  const [open, setOpen] = useState<string | null>(interviewCards[0]?.id ?? null);
  return (
    <div className="stack">
      <p className="muted">
        Answer out loud first (or in writing), then compare with the structure and sample. The sample is one strong
        answer, not the only one - your real examples matter more.
      </p>
      {interviewCards.map((c) => {
        const isOpen = open === c.id;
        return (
          <div className="card pad-sm" key={c.id}>
            <button type="button" className="btn btn-ghost" style={{ width: "100%", justifyContent: "space-between", fontWeight: 650 }} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)}>
              <span>{c.question}</span>
              <span className="chip">{c.category}</span>
            </button>
            {isOpen && (
              <div className="fade-in" style={{ marginTop: 10 }}>
                <h4>Answer structure</h4>
                <ol style={{ marginTop: 0, paddingLeft: "1.2em" }}>
                  {c.structure.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <h4>Sample answer</h4>
                <p style={{ whiteSpace: "pre-wrap" }}>{c.sample}</p>
                <h4>Pitfalls</h4>
                <ul style={{ marginTop: 0, paddingLeft: "1.2em" }}>
                  {c.pitfalls.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- mistake notebook ---------- */

function MistakeNotebook() {
  const { state, dispatch } = useStore();
  const mistakes = state.mistakes;
  if (mistakes.length === 0) {
    return <EmptyState title="No mistakes recorded">When you answer a quiz question incorrectly, it lands here with the full explanation until you resolve it.</EmptyState>;
  }
  return (
    <div className="stack">
      {mistakes
        .slice()
        .reverse()
        .map((m) => {
          const q = quizQuestionById(m.questionId);
          if (!q) return null;
          return (
            <div className="card pad-sm" key={m.questionId} style={{ opacity: m.resolved ? 0.7 : 1 }}>
              <div className="row between">
                <span className={`chip ${m.resolved ? "chip-ok" : "chip-bad"}`}>{m.resolved ? "resolved" : "open"}</span>
                <span className="chip">{m.topic}</span>
              </div>
              <h3>{q.stem}</h3>
              <p className="small muted">Your answer: {m.chosen.map((id) => q.options.find((o) => o.id === id)?.text).filter(Boolean).join(" | ") || "(none)"}</p>
              <div className="explain-box">
                <p style={{ margin: 0 }}>
                  <strong>Correct:</strong> {q.correct.map((id) => q.options.find((o) => o.id === id)?.text).join(" | ")}
                </p>
                <p className="why-wrong" style={{ margin: "8px 0 0" }}>{q.why}</p>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-sm" onClick={() => dispatch({ type: "resolveMistake", questionId: m.questionId })}>
                  {m.resolved ? "Reopen" : "Mark resolved"}
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

/* ---------- notes ---------- */

function NotesTab() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState("");
  if (state.notes.length === 0 && text === "") {
    return (
      <div>
        <EmptyState title="No notes yet">
          Notes can be lesson-specific (add them on any lesson page) or standalone here.
        </EmptyState>
        <NewNote text={text} setText={setText} dispatch={dispatch} standalone />
      </div>
    );
  }
  return (
    <div>
      <NewNote text={text} setText={setText} dispatch={dispatch} standalone />
      <div className="stack">
        {[...state.notes].reverse().map((n) => {
          const lesson = n.lessonId ? lessonById(n.lessonId) : undefined;
          return (
            <div className="card pad-sm" key={n.id}>
              {lesson && (
                <Link to={`/modules/${lesson.moduleId}/lessons/${lesson.id}`} className="small">
                  on: {lesson.title}
                </Link>
              )}
              <p style={{ whiteSpace: "pre-wrap", margin: "6px 0" }}>{n.text}</p>
              <div className="row between">
                <span className="small muted">{new Date(n.updatedAt).toLocaleString()}</span>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => dispatch({ type: "deleteNote", id: n.id })}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewNote({
  text,
  setText,
  dispatch,
  standalone,
}: {
  text: string;
  setText: (t: string) => void;
  dispatch: ReturnType<typeof useStore>["dispatch"];
  standalone?: boolean;
}) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="field">
        <label htmlFor="tool-note">{standalone ? "New note" : "Note"}</label>
        <textarea id="tool-note" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Definitions in your own words, questions to ask, patterns to remember..." />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={text.trim().length < 3}
        onClick={() => {
          dispatch({ type: "addNote", text: text.trim() });
          setText("");
        }}
      >
        Save note
      </button>
    </div>
  );
}

/* ---------- all flashcards ---------- */

function AllCards() {
  const { state } = useStore();
  return (
    <div className="stack">
      {allConceptCards.map((c) => {
        const cs = state.cards[c.id];
        const mod = modules.find((m) => m.id === c.moduleId);
        return (
          <details className="card pad-sm" key={c.id}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {c.front}
              <span className="chip" style={{ marginLeft: 8 }}>{mod?.letter}</span>
              {cs?.bookmarked && <span className="chip chip-accent" style={{ marginLeft: 4 }}>★</span>}
              {cs && <span className="chip" style={{ marginLeft: 4 }}>next: {cs.due}</span>}
            </summary>
            <p style={{ margin: "10px 0 0" }}>{c.back}</p>
          </details>
        );
      })}
    </div>
  );
}

/* ---------- workspace ---------- */

function WorkspaceTab() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState<Omit<WorkspaceTestCase, "id" | "createdAt">>({
    title: "",
    requirement: "",
    steps: "",
    expected: "",
    classification: "positive",
    source: "manual",
  });
  const [exportText, setExportText] = useState<string | null>(null);

  return (
    <div>
      <p className="muted">
        Save the test cases you design in challenges or elsewhere. Export them as text for Jira/Xray/Confluence. Saved cases live only in this browser - export before switching devices.
      </p>
      <div className="card" style={{ marginBottom: 14 }}>
        <h2>New test case</h2>
        <div className="field">
          <label htmlFor="wt-title">Title</label>
          <input id="wt-title" className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Transfer exactly at daily limit accepted" />
        </div>
        <div className="field">
          <label htmlFor="wt-req">Requirement / user story</label>
          <input id="wt-req" className="input" value={draft.requirement} onChange={(e) => setDraft({ ...draft, requirement: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="wt-steps">Steps</label>
          <textarea id="wt-steps" className="textarea" value={draft.steps} onChange={(e) => setDraft({ ...draft, steps: e.target.value })} placeholder={"1) ...\n2) ..."} />
        </div>
        <div className="field">
          <label htmlFor="wt-exp">Expected result</label>
          <textarea id="wt-exp" className="textarea" style={{ minHeight: 60 }} value={draft.expected} onChange={(e) => setDraft({ ...draft, expected: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="wt-class">Classification</label>
          <select id="wt-class" className="select" value={draft.classification} onChange={(e) => setDraft({ ...draft, classification: e.target.value as WorkspaceTestCase["classification"] })}>
            <option value="positive">positive</option>
            <option value="negative">negative</option>
            <option value="boundary">boundary</option>
            <option value="other">other</option>
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={draft.title.trim().length < 5 || draft.expected.trim().length < 5}
          onClick={() => {
            dispatch({ type: "addWorkspaceCase", testCase: { ...draft, title: draft.title.trim() } });
            setExportText(null);
            setDraft({ title: "", requirement: "", steps: "", expected: "", classification: "positive", source: "manual" });
          }}
        >
          Save test case
        </button>
      </div>

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Saved test cases ({state.workspace.testCases.length})</h2>
          {state.workspace.testCases.length > 0 && (
            <button type="button" className="btn btn-sm" onClick={() => setExportText(exportTestCases(state.workspace.testCases))}>
              Export as text
            </button>
          )}
        </div>
        {exportText && (
          <div className="codeblock" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>
            <code>{exportText}</code>
          </div>
        )}
        {state.workspace.testCases.length === 0 ? (
          <p className="muted" style={{ marginTop: 10 }}>Nothing saved yet.</p>
        ) : (
          [...state.workspace.testCases].reverse().map((t) => (
            <div className="card pad-sm tight" key={t.id} style={{ marginTop: 10 }}>
              <div className="row between">
                <strong>{t.title}</strong>
                <div className="row">
                  <span className={`chip ${t.classification === "positive" ? "chip-ok" : t.classification === "negative" ? "chip-bad" : "chip-warn"}`}>{t.classification}</span>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => dispatch({ type: "deleteWorkspaceCase", id: t.id })}>
                    Delete
                  </button>
                </div>
              </div>
              {t.requirement && <p className="small muted" style={{ margin: "4px 0 0" }}>Req: {t.requirement}</p>}
              {t.steps && <p className="small" style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>Steps: {t.steps}</p>}
              <p className="small" style={{ margin: "4px 0 0" }}>Expected: {t.expected}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function exportTestCases(cases: WorkspaceTestCase[]): string {
  return cases
    .map(
      (t, i) =>
        `TC-${String(i + 1).padStart(3, "0")}: ${t.title} [${t.classification}]\n` +
        (t.requirement ? `Requirement: ${t.requirement}\n` : "") +
        (t.steps ? `Steps:\n${t.steps}\n` : "") +
        `Expected: ${t.expected}\n`,
    )
    .join("\n");
}
