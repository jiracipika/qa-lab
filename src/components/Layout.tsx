/** App shell: desktop sidebar, mobile drawer, onboarding overlay. */

import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "../state/store";
import { dueConceptCards } from "../state/selectors";
import { goalLabels } from "../content";
import type { Goal } from "../types/content";
import { dayKey } from "../lib/dates";

const NAV: { section: string; items: { to: string; label: string; ico: string; end?: boolean }[] }[] = [
  {
    section: "Learn",
    items: [
      { to: "/", label: "Dashboard", ico: "◧", end: true },
      { to: "/modules", label: "Modules", ico: "❏" },
      { to: "/review", label: "Review", ico: "↺" },
      { to: "/quizzes", label: "Quizzes", ico: "?" },
      { to: "/challenges", label: "Challenges", ico: "✎" },
    ],
  },
  {
    section: "Practise",
    items: [
      { to: "/games", label: "Minigames", ico: "◎" },
      { to: "/sandbox", label: "Bug sandbox", ico: "⌗" },
    ],
  },
  {
    section: "Reference",
    items: [
      { to: "/glossary", label: "Glossary", ico: "Aa" },
      { to: "/tools", label: "Study tools", ico: "✦" },
      { to: "/roadmap", label: "Roadmap", ico: "→" },
      { to: "/settings", label: "Settings", ico: "⚙" },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const due = dueConceptCards(state).length;
  const unresolved = state.mistakes.filter((m) => !m.resolved).length;

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="btn btn-sm btn-ghost" aria-label={drawerOpen ? "Close menu" : "Open menu"} aria-expanded={drawerOpen} onClick={() => setDrawerOpen((v) => !v)}>
          ☰ Menu
        </button>
        <Link to="/" className="brand" style={{ padding: 0 }}>
          <span className="brand-mark" aria-hidden>QA</span> QA Lab
        </Link>
        <span className="chip chip-accent" aria-label={`${due} cards due for review`}>{due} due</span>
      </header>

      <div className={`drawer-backdrop ${drawerOpen ? "show" : ""}`} onClick={() => setDrawerOpen(false)} aria-hidden />

      <nav className={`sidebar ${drawerOpen ? "open" : ""}`} aria-label="Main navigation">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>QA</span>
          <span>QA Lab</span>
        </Link>
        {NAV.map((group) => (
          <React.Fragment key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                <span className="nav-ico" aria-hidden>{item.ico}</span>
                <span>{item.label}</span>
                {item.to === "/review" && (due > 0 || unresolved > 0) && (
                  <span className="chip chip-accent" style={{ marginLeft: "auto" }}>{due + unresolved}</span>
                )}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
        <div className="sidebar-footer">
          {state.preferences.goal && <div>Goal: {goalLabels[state.preferences.goal as Goal]}</div>}
          <div>All progress stays in this browser.</div>
        </div>
      </nav>

      <main className="main" id="main">
        {children}
      </main>

      {!state.onboarded && <Onboarding />}
    </div>
  );
}

function Onboarding() {
  const { state, dispatch } = useStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(state.preferences.theme);

  return (
    <div className="onboard-overlay" role="dialog" aria-modal="true" aria-label="Welcome to QA Lab">
      <div className="card onboard-card fade-in">
        <h2>Welcome to QA Lab</h2>
        <p className="muted">
          A personal workspace for software testing: lessons, flashcards, quizzes, challenges, minigames, and a
          bug-hunting sandbox. Everything runs locally in your browser - no account, no data leaves this device.
        </p>
        <div className="field">
          <label htmlFor="ob-goal">What do you want to focus on? (You can change this anytime - it only orders suggestions.)</label>
          <div className="goal-pick" id="ob-goal" role="group" aria-label="Learning goal">
            {(Object.keys(goalLabels) as Goal[]).map((g) => (
              <button key={g} type="button" aria-pressed={goal === g} onClick={() => setGoal(g)}>
                <span aria-hidden>{goal === g ? "◉" : "○"}</span> {goalLabels[g]}
              </button>
            ))}
          </div>
          <span className="hint">Every module and tool stays available regardless of your choice.</span>
        </div>
        <div className="field">
          <label htmlFor="ob-theme">Theme</label>
          <select id="ob-theme" className="select" value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={goal === null}
            onClick={() => {
              dispatch({ type: "setPrefs", prefs: { goal, theme } });
              dispatch({ type: "onboardDone" });
            }}
          >
            {goal === null ? "Pick a goal to start" : `Start: ${goalLabels[goal]}`}
          </button>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          Tip: your streak starts today - {dayKey()}.
        </p>
      </div>
    </div>
  );
}
