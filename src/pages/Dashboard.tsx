/** Dashboard: next useful action first, real activity data only, empty states for new learners. */

import { Link } from "react-router-dom";
import { useStore } from "../state/store";
import {
  activityThisWeek,
  bookmarkedCards,
  bookmarkedLessons,
  currentStreakCount,
  dailyChallenge,
  dueConceptCards,
  mistakeCards,
  moduleLessonProgress,
  nextLesson,
  recentSessions,
  strongTopics,
  weakTopics,
} from "../state/selectors";
import { modules } from "../content";
import { EmptyState, HandNote, PageHead, ProgressBar } from "../components/ui";
import { RangeLab } from "../components/RangeLab";
import { goalLabels } from "../content";
import type { Goal } from "../types/content";

export function Dashboard() {
  const { state } = useStore();
  const next = nextLesson(state);
  const due = dueConceptCards(state);
  const challenge = dailyChallenge(state);
  const recent = recentSessions(state, 3);
  const weak = weakTopics(state);
  const strong = strongTopics(state);
  const streak = currentStreakCount(state);
  const weekActive = activityThisWeek(state);
  const bmLessons = bookmarkedLessons(state);
  const bmCards = bookmarkedCards(state);
  const openMistakes = mistakeCards(state);
  const isNew = state.activity.length === 0;

  return (
    <div className="fade-in">
      <PageHead
        eyebrow="Your workbook"
        title={isNew ? "Welcome to QABrew" : "Your learning workspace"}
        lede={
          state.preferences.goal
            ? `Goal: ${goalLabels[state.preferences.goal as Goal]} - suggestions below follow it, everything stays open.`
            : "Pick a goal in Settings to personalise suggestions."
        }
      />

      {/* Primary action - the one dominant card */}
      <div className="hero-card">
        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="eyebrow" style={{ marginBottom: 0 }}>{isNew ? "Start here" : "Continue learning"}</span>
          {next && <span className="chip">Module {next.module.letter} - {next.module.title}</span>}
        </div>
        {next ? (
          <>
            <div className="hero-title">{next.lesson.title}</div>
            <p className="muted" style={{ margin: "0 0 12px" }}>
              Lesson {next.module.lessons.findIndex((l) => l.id === next.lesson.id) + 1} of{" "}
              {next.module.lessons.length} - {next.lesson.minutes} min read
            </p>
            <div className="row between">
              <div style={{ minWidth: 160, flex: 1, marginRight: 12 }}>
                <ProgressBar pct={moduleLessonProgress(state, next.module.id).pct} label={`Module ${next.module.letter} progress`} />
                <span className="small muted">
                  {moduleLessonProgress(state, next.module.id).done}/{moduleLessonProgress(state, next.module.id).total} lessons in this module
                </span>
              </div>
              <Link className="btn btn-primary" to={`/modules/${next.module.id}/lessons/${next.lesson.id}`}>
                Open lesson
              </Link>
            </div>
          </>
        ) : (
          <p style={{ margin: 0 }}>
            All lessons complete. Refresh knowledge with <Link to="/review">review cards</Link> or push further in <Link to="/challenges">challenges</Link>.
          </p>
        )}
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        {/* Review */}
        <div className="card">
          <h2>Cards due for review</h2>
          {due.length > 0 ? (
            <>
              <p className="muted" style={{ margin: "0 0 10px" }}>
                {due.length} concept card{due.length === 1 ? "" : "s"} scheduled by spaced repetition.
              </p>
              <Link to="/review" className="btn btn-primary">Review now</Link>
            </>
          ) : (
            <EmptyState title="Nothing due right now">
              Cards enter the schedule after you review them once. <Link to="/review">Start the first review session</Link>.
            </EmptyState>
          )}
        </div>

        {/* Daily challenge */}
        <div className="card">
          <h2>Daily challenge</h2>
          {challenge && (
            <>
              <p style={{ margin: "0 0 6px" }}>
                <strong>{challenge.title}</strong>
              </p>
              <p className="muted small" style={{ margin: "0 0 10px" }}>
                {challenge.kind.replace("-", " ")} - {challenge.minutes} min. Rotates every day.
              </p>
              <Link to={`/challenges/${challenge.id}`} className="btn">Attempt it</Link>
            </>
          )}
        </div>

        {/* Mistakes */}
        <div className="card">
          <h2>Mistake notebook</h2>
          {openMistakes.length > 0 ? (
            <>
              <p className="muted" style={{ margin: "0 0 10px" }}>{openMistakes.length} unanswered question{openMistakes.length === 1 ? "" : "s"} from quizzes you got wrong.</p>
              <Link to="/tools?tab=mistakes" className="btn">Revisit mistakes</Link>
            </>
          ) : (
            <EmptyState title="No open mistakes">
              Wrong quiz answers land here automatically, with explanations.
            </EmptyState>
          )}
        </div>
      </div>

      {/* The distinctive teaching interaction: boundary playground */}
      <div className="card">
        <div className="row between">
          <h2 style={{ marginBottom: 2 }}>Boundary playground</h2>
          <span className="chip">teaching example</span>
        </div>
        <p className="muted small" style={{ margin: "2px 0 8px" }}>
          A numeric field that accepts 18 to 65 inclusive. Probe the values around each boundary and see
          exactly where the field flips from valid to invalid.
        </p>
        <RangeLab />
        <HandNote>
          the interesting bugs live at the edges - test 17, 18, 19 and 64, 65, 66, not just the middle
        </HandNote>
      </div>

      {/* Activity */}
      <div className="card">
        <h2>Activity</h2>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-num">{streak}</div>
            <div className="stat-label">day streak</div>
          </div>
          <div className="stat">
            <div className="stat-num">{weekActive}/7</div>
            <div className="stat-label">active days this week</div>
          </div>
          <div className="stat">
            <div className="stat-num">{state.lessons ? Object.keys(state.lessons).length : 0}</div>
            <div className="stat-label">lessons completed</div>
          </div>
        </div>
        <p className="small muted" style={{ margin: "10px 0 0" }}>
          Streaks are a nudge, not a grade. Learning beats streak-protecting.
        </p>
      </div>

      {/* Quiz results */}
      <div className="card">
        <h2>Recent quiz results</h2>
        {recent.length > 0 ? (
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
        ) : (
          <EmptyState title="No quizzes taken yet">
            Each module has a 20-question practice quiz with explanations. <Link to="/quizzes">Browse quizzes</Link>.
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
              Percentages show what your attempts demonstrated - not a mastery score. Low sample sizes stay hidden until you have answered at least 3 questions in a topic.
            </p>
          </>
        ) : (
          <EmptyState title="No topic data yet">
            After you answer quiz questions, this section shows which topics your attempts support - with counts, not invented percentages.
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
    </div>
  );
}
