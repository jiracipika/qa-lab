/**
 * Quiz page: practice mode (instant explanations) and assessment mode (explanations after
 * submission, optional timer). Grading uses stable option ids; the display order is shuffled
 * with a seeded shuffle so the same session is stable across re-renders.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { moduleById, modules } from "../content";
import type { QuizQuestion } from "../types/content";
import { useStore } from "../state/store";
import { gradeAnswer, topicBreakdown } from "../lib/grading";
import { shuffled } from "../lib/shuffle";
import { hashString } from "../lib/dates";
import { EmptyState } from "../components/ui";

type Mode = "practice" | "assessment";

export function QuizzesHub() {
  const { state } = useStore();
  return (
    <div className="fade-in">
      <div className="page-head">
        <h1>Quizzes</h1>
        <p className="lede">
          Original practice questions written for this course - practice mode for learning, assessment mode for
          testing yourself. Not official certification exam questions.
        </p>
      </div>
      {modules.map((m) => {
        const sessions = state.quizSessions.filter((s) => s.moduleId === m.id);
        const best = sessions.length ? Math.max(...sessions.map((s) => (s.total ? Math.round((s.score / s.total) * 100) : 0))) : null;
        return (
          <div className="card" key={m.id} style={{ marginBottom: 12 }}>
            <div className="row between">
              <div>
                <h2 style={{ margin: "0 0 4px" }}>Module {m.letter}: {m.title}</h2>
                <span className="muted small">{m.quiz.length} questions - recall, comparison, and scenario</span>
              </div>
              <div className="row">
                {best !== null && <span className="chip chip-ok">best {best}%</span>}
                <Link className="btn btn-primary" to={`/modules/${m.id}/quiz`}>
                  {sessions.length ? "Retake" : "Start"}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function QuizPage() {
  const { moduleId } = useParams();
  const mod = moduleById(moduleId ?? "");
  const { dispatch } = useStore();
  const [mode, setMode] = useState<Mode | null>(null);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);

  if (!mod) return <EmptyState title="Quiz not found">Back to <Link to="/quizzes">quizzes</Link>.</EmptyState>;

  return (
    <div className="fade-in">
      <div className="crumbs">
        <Link to="/quizzes">Quizzes</Link> / Module {mod.letter}
      </div>
      <div className="page-head">
        <h1>Module {mod.letter} quiz: {mod.title}</h1>
      </div>
      {mode === null ? (
        <div className="card">
          <h2>Choose a mode</h2>
          <div className="grid2" style={{ margin: "12px 0" }}>
            <button type="button" className="card tight pad-sm" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setMode("practice")}>
              <h3>Practice</h3>
              <p className="muted small" style={{ margin: 0 }}>
                Feedback immediately after each answer: why the correct answer is correct and why each distractor is wrong.
              </p>
            </button>
            <div className="card tight pad-sm">
              <h3>Assessment</h3>
              <p className="muted small" style={{ margin: "6px 0" }}>All explanations after you submit. Optional timer.</p>
              <div className="row">
                <button type="button" className="btn" onClick={() => { setTimerMinutes(0); setMode("assessment"); }}>No timer</button>
                <button type="button" className="btn" onClick={() => { setTimerMinutes(20); setMode("assessment"); }}>20-minute timer</button>
              </div>
            </div>
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            {mod.quiz.length} questions. Multi-select questions are labelled <strong>select all that apply</strong>. Your answers are preserved as you navigate.
          </p>
        </div>
      ) : (
        <QuizRunner
          key={`${mod.id}-${mode}`}
          questions={mod.quiz}
          moduleId={mod.id}
          mode={mode}
          timerMinutes={timerMinutes}
          dispatch={dispatch}
          onExit={() => setMode(null)}
        />
      )}
    </div>
  );
}

interface RunnerProps {
  questions: QuizQuestion[];
  moduleId: string;
  mode: Mode;
  timerMinutes: number;
  dispatch: ReturnType<typeof useStore>["dispatch"];
  onExit: () => void;
}

function QuizRunner({ questions, moduleId, mode, timerMinutes, dispatch, onExit }: RunnerProps) {
  const sessionSeed = useMemo(() => Date.now(), []);
  const [order, setOrder] = useState<string[]>(() => questions.map((q) => q.id));
  const [optionOrder] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const q of questions) {
      map[q.id] = shuffled(q.options.map((o) => o.id), hashString(q.id) ^ sessionSeed);
    }
    return map;
  });
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [retryIds, setRetryIds] = useState<string[] | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timerMinutes * 60);

  const pool = retryIds ? questions.filter((q) => retryIds.includes(q.id)) : questions;
  const q = questions.find((x) => x.id === order[current]) ?? pool[0];

  useEffect(() => {
    if (timerMinutes > 0 && !submitted && secondsLeft > 0) {
      const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [timerMinutes, submitted, secondsLeft]);

  useEffect(() => {
    if (timerMinutes > 0 && secondsLeft === 0 && !submitted) {
      setSubmitted(true);
    }
  }, [secondsLeft, submitted, timerMinutes]);

  const choose = (qid: string, optionId: string, multi: boolean) => {
    if (revealed[qid] || submitted) return;
    setAnswers((prev) => {
      if (!multi) return { ...prev, [qid]: [optionId] };
      const cur = prev[qid] ?? [];
      return { ...prev, [qid]: cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId] };
    });
  };

  const answerOne = (question: QuizQuestion) => {
    const chosen = answers[question.id] ?? [];
    if (chosen.length === 0) return;
    const ok = gradeAnswer(question, chosen);
    dispatch({ type: "quizAnswer", question, chosen, correct: ok });
    setRevealed((r) => ({ ...r, [question.id]: true }));
  };

  const submitAll = () => {
    setSubmitted(true);
    dispatch({ type: "quizFinished", moduleId, mode, questions, answers });
    for (const question of questions) {
      const chosen = answers[question.id];
      if (chosen && chosen.length > 0 && !revealed[question.id]) {
        dispatch({ type: "quizAnswer", question, chosen, correct: gradeAnswer(question, chosen) });
      }
    }
  };

  const answeredCount = pool.filter((x) => (answers[x.id] ?? []).length > 0).length;
  const score = pool.filter((x) => answers[x.id] && gradeAnswer(x, answers[x.id])).length;

  /* ---------- results view ---------- */
  if (submitted) {
    const breakdown = topicBreakdown(pool, answers);
    const wrong = pool.filter((x) => answers[x.id] && !gradeAnswer(x, answers[x.id]));
    return (
      <div className="fade-in">
        <div className="card" style={{ marginBottom: 14 }}>
          <h2>
            Result: {score}/{answeredCount} correct
            {timerMinutes > 0 && <span className="chip chip-warn" style={{ marginLeft: 10 }}>timed</span>}
          </h2>
          <div className="stat-row" style={{ margin: "10px 0" }}>
            {Object.entries(breakdown).map(([topic, st]) => (
              <div className="stat" key={topic}>
                <div className="stat-num">{st.correct}/{st.total}</div>
                <div className="stat-label">{topic}</div>
              </div>
            ))}
          </div>
          {wrong.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setRetryIds(wrong.map((w) => w.id));
                setOrder(wrong.map((w) => w.id));
                setCurrent(0);
                setAnswers({});
                setRevealed({});
                setSubmitted(false);
                setSecondsLeft(0);
              }}
            >
              Retry the {wrong.length} incorrect question{wrong.length === 1 ? "" : "s"}
            </button>
          )}
          <div className="row" style={{ marginTop: 10 }}>
            <button type="button" className="btn" onClick={onExit}>Back to mode selection</button>
            <Link className="btn" to="/review">Review cards</Link>
          </div>
        </div>
        {pool.map((question, i) => {
          const chosen = answers[question.id] ?? [];
          const ok = chosen.length > 0 && gradeAnswer(question, chosen);
          return (
            <div className="card" key={question.id} style={{ marginBottom: 12 }}>
              <h3>
                {ok ? "✓" : chosen.length === 0 ? "–" : "✗"} Q{i + 1}. {question.stem}
              </h3>
              <QuestionBody question={question} chosen={chosen} optionOrder={optionOrder[question.id]} revealed />
              <div className="explain-box">
                <p style={{ margin: 0 }}>
                  <strong>{ok ? "Correct." : chosen.length === 0 ? "Not answered." : "Incorrect."}</strong> {question.why}
                </p>
                {!ok && chosen.filter((c) => !question.correct.includes(c)).length > 0 && (
                  <div className="why-wrong">
                    {chosen
                      .filter((c) => !question.correct.includes(c))
                      .map((c) => (
                        <p key={c} style={{ margin: "4px 0 0" }}>
                          - {question.distractors[c]}
                        </p>
                      ))}
                  </div>
                )}
                {question.multi && chosen.length === 0 && <p className="why-wrong">This question required selecting all correct options.</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---------- question view ---------- */
  const chosen = answers[q.id] ?? [];
  const isRevealed = Boolean(revealed[q.id]);
  const inPoolIndex = pool.findIndex((x) => x.id === q.id);

  return (
    <div>
      <div className="row between" style={{ marginBottom: 10 }}>
        <span className="chip chip-accent">{mode === "practice" ? "Practice" : "Assessment"}</span>
        {timerMinutes > 0 && (
          <span className={`chip ${secondsLeft < 120 ? "chip-bad" : ""}`} role="timer" aria-live="off">
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")} left
          </span>
        )}
        <span className="muted small">{inPoolIndex + 1} / {pool.length}</span>
      </div>

      <div className="qnav" role="group" aria-label="Question navigator">
        {order
          .filter((id) => pool.some((p) => p.id === id))
          .map((id, i) => (
            <button
              key={id}
              type="button"
              className={`${(answers[id] ?? []).length > 0 ? "answered" : ""} ${i === current ? "current" : ""}`}
              aria-label={`Question ${i + 1}${(answers[id] ?? []).length > 0 ? ", answered" : ""}`}
              aria-current={i === current}
              onClick={() => setCurrent(i)}
            >
              {i + 1}
            </button>
          ))}
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="chip">{q.topic}</span>
          {q.multi && <span className="chip chip-warn">Select all that apply</span>}
        </div>
        <h2 style={{ fontSize: "1.15rem" }}>{q.stem}</h2>
        <div>
          {optionOrder[q.id].map((oid, i) => {
            const opt = q.options.find((o) => o.id === oid)!;
            const selected = chosen.includes(oid);
            let cls = "quiz-option";
            if (selected) cls += " selected";
            if (isRevealed || submitted) {
              if (q.correct.includes(oid)) cls += " correct";
              else if (selected) cls += " wrong";
              else cls += " dimmed";
            }
            return (
              <button
                key={oid}
                type="button"
                className={cls}
                aria-pressed={selected}
                disabled={isRevealed || submitted}
                onClick={() => choose(q.id, oid, q.multi)}
              >
                <span className="opt-key" aria-hidden>{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {mode === "practice" && isRevealed && (
          <div className="explain-box fade-in">
            <p style={{ margin: 0 }}>
              <strong>{gradeAnswer(q, chosen) ? "Correct." : "Incorrect."}</strong> {q.why}
            </p>
            {!gradeAnswer(q, chosen) && (
              <div className="why-wrong">
                {chosen
                  .filter((c) => !q.correct.includes(c))
                  .map((c) => (
                    <p key={c} style={{ margin: "4px 0 0" }}>
                      - {q.distractors[c]}
                    </p>
                  ))}
              </div>
            )}
            <details className="small" style={{ marginTop: 8 }}>
              <summary>Why the other options are wrong</summary>
              <ul style={{ marginTop: 6, paddingLeft: "1.2em" }}>
                {q.options
                  .filter((o) => !q.correct.includes(o.id))
                  .map((o) => (
                    <li key={o.id}>
                      <strong>{o.text.slice(0, 60)}...</strong> {q.distractors[o.id]}
                    </li>
                  ))}
              </ul>
            </details>
          </div>
        )}

        <div className="row between" style={{ marginTop: 12 }}>
          <button type="button" className="btn" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            ← Previous
          </button>
          {mode === "practice" && !isRevealed && (
            <button type="button" className="btn btn-primary" disabled={chosen.length === 0} onClick={() => answerOne(q)}>
              Answer
            </button>
          )}
          {current < order.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>
              Next →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submitAll} disabled={mode === "practice" && answeredCount < pool.length}>
              Submit ({answeredCount}/{pool.length} answered)
            </button>
          )}
        </div>
        {mode === "practice" && current === order.length - 1 && answeredCount < pool.length && (
          <p className="small muted" style={{ marginBottom: 0 }}>Answer every question to finish the practice session.</p>
        )}
      </div>
    </div>
  );
}

function QuestionBody({
  question,
  chosen,
  optionOrder,
  revealed,
}: {
  question: QuizQuestion;
  chosen: string[];
  optionOrder?: string[];
  revealed?: boolean;
}) {
  const ids = optionOrder ?? question.options.map((o) => o.id);
  return (
    <div>
      {ids.map((oid, i) => {
        const opt = question.options.find((o) => o.id === oid)!;
        const selected = chosen.includes(oid);
        let cls = "quiz-option";
        if (selected) cls += " selected";
        if (revealed) {
          if (question.correct.includes(oid)) cls += " correct";
          else if (selected) cls += " wrong";
          else cls += " dimmed";
        }
        return (
          <div key={oid} className={cls} style={{ cursor: "default" }}>
            <span className="opt-key" aria-hidden>{String.fromCharCode(65 + i)}</span>
            <span>{opt.text}</span>
          </div>
        );
      })}
    </div>
  );
}
