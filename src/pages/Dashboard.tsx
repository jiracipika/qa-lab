/** Dashboard: the next lesson, practice shortcuts and real study activity. */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BookOpen, CalendarDays, Check, Clock3, Flame, Layers, NotebookPen, Target,
} from "lucide-react";
import { useStore } from "../state/store";
import {
  bookmarkedCards,
  bookmarkedLessons,
  currentStreakCount,
  dailyChallenge,
  dueConceptCards,
  mistakeCards,
  moduleLessonProgress,
  newConceptCards,
  nextLesson,
  recentSessions,
  streakDays,
  strongTopics,
  weakTopics,
} from "../state/selectors";
import { goalLabels, modules } from "../content";
import { addDays, dayKey } from "../lib/dates";
import { EmptyState, PageHead, ProgressBar } from "../components/ui";
import { RangeLab } from "../components/RangeLab";

function PracticeLink({ to, icon, title, children }: {
  to: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="practice-link">
      <span className="practice-icon" aria-hidden>{icon}</span>
      <span className="practice-copy"><strong>{title}</strong><span>{children}</span></span>
      <ArrowRight className="practice-arrow" size={17} aria-hidden />
    </Link>
  );
}

const weekday = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

export function Dashboard() {
  const { state } = useStore();
  const next = nextLesson(state);
  const progress = next ? moduleLessonProgress(state, next.module.id) : null;
  const lessonTotals = modules.map((module) => moduleLessonProgress(state, module.id));
  const completed = lessonTotals.reduce((total, module) => total + module.done, 0);
  const totalLessons = lessonTotals.reduce((total, module) => total + module.total, 0);
  const newCards = newConceptCards(state).length;
  const due = dueConceptCards(state).length - newCards;
  const challenge = dailyChallenge(state);
  const recent = recentSessions(state, 3);
  const weak = weakTopics(state);
  const strong = strongTopics(state);
  const streak = currentStreakCount(state);
  const activeDays = new Set(streakDays(state));
  const today = dayKey();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const bmLessons = bookmarkedLessons(state);
  const bmCards = bookmarkedCards(state);
  const openMistakes = mistakeCards(state);
  const goal = state.preferences.goal;

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-heading">
        <PageHead title="Study dashboard" />
        <Link className="study-goal" to="/settings">
          <Target size={16} aria-hidden />
          {goal ? goalLabels[goal] : "Set a study goal"}
        </Link>
      </div>

      <section className="hero-card" aria-labelledby="next-lesson-title">
        <div className="hero-copy">
          <span className="hero-kicker">
            <BookOpen size={16} aria-hidden /> {completed ? "Continue learning" : "Start learning"}
          </span>
          {next && progress ? (
            <>
              <h2 className="hero-title" id="next-lesson-title">{next.lesson.title}</h2>
              <p className="hero-module">Module {next.module.letter} · {next.module.title}</p>
              <p className="hero-meta">
                <span>Lesson {next.module.lessons.indexOf(next.lesson) + 1} of {progress.total}</span>
                <span><Clock3 size={15} aria-hidden /> {next.lesson.minutes} min</span>
              </p>
              <Link className="btn hero-cta" to={`/modules/${next.module.id}/lessons/${next.lesson.id}`}>
                Open lesson <ArrowRight size={17} aria-hidden />
              </Link>
              <div className="hero-progress">
                <span>{progress.done} of {progress.total} lessons complete in this module</span>
                <ProgressBar pct={progress.pct} label={`Module ${next.module.letter} progress`} />
              </div>
            </>
          ) : (
            <>
              <h2 className="hero-title" id="next-lesson-title">All lessons complete</h2>
              <p className="hero-module">Refresh what you’ve learned with a flashcard session.</p>
              <Link className="btn hero-cta" to="/review">
                Review flashcards <ArrowRight size={17} aria-hidden />
              </Link>
            </>
          )}
        </div>
        <div className="hero-art" aria-hidden>
          <div className="hero-orbit" />
          <div className="hero-sheet hero-sheet-back" />
          <div className="hero-sheet hero-sheet-front">
            <span className="hero-sheet-heading" />
            <span className="hero-sheet-row"><Check /><i /></span>
            <span className="hero-sheet-row"><Check /><i /></span>
            <span className="hero-sheet-row"><span /><i /></span>
          </div>
          <span className="hero-stamp"><Check size={35} strokeWidth={2.3} /></span>
        </div>
      </section>

      <section aria-labelledby="dashboard-practice-title">
        <h2 className="dashboard-section-title" id="dashboard-practice-title">Quick practice</h2>
        <div className="practice-grid">
          <PracticeLink to="/review" icon={<Layers size={20} />} title="Flashcards">
            {due ? `${due} due for review` : newCards ? `${newCards} new cards` : "You’re caught up"}
          </PracticeLink>
          {challenge && (
            <PracticeLink to={`/challenges/${challenge.id}`} icon={<CalendarDays size={20} />} title="Daily challenge">
              {challenge.title} · {challenge.minutes} min
            </PracticeLink>
          )}
          <PracticeLink to="/tools?tab=mistakes" icon={<NotebookPen size={20} />} title="Mistake notebook">
            {openMistakes.length ? `${openMistakes.length} to revisit` : "No open mistakes"}
          </PracticeLink>
        </div>
      </section>

      <section className="dashboard-activity" aria-labelledby="dashboard-activity-title">
        <h2 id="dashboard-activity-title">Your progress</h2>
        <div className="dashboard-metrics">
          <div><BookOpen size={19} aria-hidden /><strong>{completed}<span> / {totalLessons}</span></strong><span>Lessons completed</span></div>
          <div><Flame size={19} aria-hidden /><strong>{streak}</strong><span>Day streak</span></div>
        </div>
        <div className="dashboard-week">
          <div className="dashboard-week-title">
            <span>Last 7 days</span>
            <span>{days.filter((day) => activeDays.has(day)).length} active</span>
          </div>
          <ul className="dashboard-days" aria-label="Daily study activity">
            {days.map((day) => {
              const date = new Date(`${day}T12:00:00`);
              const active = activeDays.has(day);
              return (
                <li key={day} aria-current={day === today ? "date" : undefined} title={fullDate.format(date)}>
                  <span className="visually-hidden">{fullDate.format(date)}, {active ? "studied" : "no activity"}</span>
                  <span className="dashboard-day-mark" data-active={active} aria-hidden>{active && <Check size={14} />}</span>
                  <span aria-hidden>{weekday.format(date)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="dashboard-lab-title">
        <h2 className="dashboard-section-title" id="dashboard-lab-title">Boundary playground</h2>
        <p className="dashboard-section-description">Try a value just inside or outside a boundary.</p>
        <RangeLab />
      </section>

      <section aria-label="Study history">
        {/* Quiz results */}
        <div className="card">
          <h2>Recent quiz results</h2>
          {recent.length > 0 ? (
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Mode</th>
                    <th>Score</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => {
                    const mod = modules.find((m) => m.id === s.moduleId);
                    return (
                      <tr key={s.id}>
                        <td>Module {mod?.letter} - {mod?.title}</td>
                        <td><span className="chip">{s.mode}</span></td>
                        <td><strong>{s.score}/{s.total}</strong></td>
                        <td className="small muted">{new Date(s.finishedAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No quizzes taken yet">
              <Link to="/quizzes">Browse practice quizzes</Link> to see how you are doing.
            </EmptyState>
          )}
        </div>

        {/* Strengths / weaknesses with evidence */}
        <div className="card">
          <h2>Topic strengths and weaknesses</h2>
          {(strong.length > 0 || weak.length > 0) ? (
            <>
              {weak.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <h3>Needs attention (below 60% correct)</h3>
                  <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                    {weak.map((t) => (
                      <li key={t.topic}>
                        {t.topic}: {t.correct}/{t.total} correct ({Math.round((t.correct / t.total) * 100)}%) - evidence: your quiz attempts
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {strong.length > 0 && (
                <div>
                  <h3>Solid (80%+ correct)</h3>
                  <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                    {strong.map((t) => (
                      <li key={t.topic}>
                        {t.topic}: {t.correct}/{t.total} correct ({Math.round((t.correct / t.total) * 100)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="small muted" style={{ margin: "10px 0 0" }}>
                Topics appear after you answer at least three questions. The percentages show how often you answered correctly.
              </p>
            </>
          ) : (
            <EmptyState title="No topic data yet">
              Answer at least three quiz questions in a topic to see how you are doing.
            </EmptyState>
          )}
        </div>

        {/* Bookmarks + notes */}
        <div className="card">
          <h2>Bookmarks and notes</h2>
          {bmLessons.length + bmCards.length === 0 && state.notes.length === 0 ? (
            <EmptyState title="Nothing saved yet">
              Bookmark lessons or cards while you study, and add notes on any lesson.
            </EmptyState>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {bmLessons.map(({ lesson }) => (
                <li key={lesson!.id}>
                  <Link to={`/modules/${lesson!.moduleId}/lessons/${lesson!.id}`}>{lesson!.title}</Link> <span className="chip">lesson</span>
                </li>
              ))}
              {bmCards.map(({ card }) => (
                <li key={card!.id}>{card!.front.slice(0, 70)}... <span className="chip">card</span></li>
              ))}
              {state.notes.slice(-3).reverse().map((n) => (
                <li key={n.id} className="muted">Note: {n.text.slice(0, 80)}{n.text.length > 80 ? "..." : ""}</li>
              ))}
            </ul>
          )}
          <p className="small muted" style={{ margin: "8px 0 0" }}>
            <Link to="/tools">All notes, bookmarks and tools</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
