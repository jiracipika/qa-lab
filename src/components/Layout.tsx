/** App shell: desktop sidebar, mobile drawer, onboarding overlay, migration notice. */

import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BookMarked,
  BookOpen,
  Bug,
  CircleHelp,
  Gamepad2,
  LayoutDashboard,
  Map,
  Menu,
  PencilRuler,
  Repeat,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { useStore } from "../state/store";
import { dueConceptCards } from "../state/selectors";
import { goalLabels } from "../content";
import type { Goal } from "../types/content";
import { dayKey } from "../lib/dates";
import { BrandMark } from "./ui";

const NEW_HOME = "https://qabrew.vercel.app";
const OLD_HOST = "qa-lab-jiracipika.vercel.app";

const NAV: { section: string; items: { to: string; label: string; ico: React.ReactNode; end?: boolean }[] }[] = [
  {
    section: "Learn",
    items: [
      { to: "/", label: "Dashboard", ico: <LayoutDashboard strokeWidth={2} />, end: true },
      { to: "/modules", label: "Modules", ico: <BookOpen strokeWidth={2} /> },
      { to: "/review", label: "Review", ico: <Repeat strokeWidth={2} /> },
      { to: "/quizzes", label: "Quizzes", ico: <CircleHelp strokeWidth={2} /> },
      { to: "/challenges", label: "Challenges", ico: <PencilRuler strokeWidth={2} /> },
    ],
  },
  {
    section: "Practise",
    items: [
      { to: "/games", label: "Minigames", ico: <Gamepad2 strokeWidth={2} /> },
      { to: "/sandbox", label: "Bug sandbox", ico: <Bug strokeWidth={2} /> },
    ],
  },
  {
    section: "Reference",
    items: [
      { to: "/glossary", label: "Glossary", ico: <BookMarked strokeWidth={2} /> },
      { to: "/tools", label: "Study tools", ico: <Wrench strokeWidth={2} /> },
      { to: "/roadmap", label: "Roadmap", ico: <Map strokeWidth={2} /> },
      { to: "/settings", label: "Settings", ico: <Settings strokeWidth={2} /> },
    ],
  },
];

function BrandBlock() {
  return (
    <Link to="/" className="brand" aria-label="QABrew home">
      <span className="brand-mark">
        <BrandMark />
      </span>
      <span className="brand-text">
        <span className="brand-name">QABrew</span>
        <span className="brand-tag">the QA workbook</span>
      </span>
    </Link>
  );
}

/** On the old origin only: tell learners where the product lives now and how to carry progress over. */
function MigrationBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("qabrew-migration-dismissed") === "1",
  );
  if (dismissed || window.location.hostname !== OLD_HOST) return null;
  return (
    <div className="migration-banner" role="note" aria-label="New address notice">
      <p>
        <strong>QABrew has a new address.</strong> Nothing is lost here, but new work lands at{" "}
        <a href={NEW_HOME}>qabrew.vercel.app</a>. This browser stores progress per address, so take it
        with you: <Link to="/settings">Settings, Export</Link>, then import the file on the new address.
      </p>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => {
          sessionStorage.setItem("qabrew-migration-dismissed", "1");
          setDismissed(true);
        }}
      >
        <X size={14} aria-hidden /> Dismiss
      </button>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const due = dueConceptCards(state).length;
  const unresolved = state.mistakes.filter((m) => !m.resolved).length;

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="btn btn-sm btn-ghost" aria-label={drawerOpen ? "Close menu" : "Open menu"} aria-expanded={drawerOpen} onClick={() => setDrawerOpen((v) => !v)}>
          {drawerOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />} Menu
        </button>
        <Link to="/" className="brand" style={{ padding: 0 }} aria-label="QABrew home">
          <span className="brand-mark" aria-hidden>
            <BrandMark size={28} />
          </span>
          <span className="brand-name" style={{ fontSize: "1.15rem" }}>QABrew</span>
        </Link>
        <span className="chip chip-accent" aria-label={`${due} cards due for review`}>{due} due</span>
      </header>

      <div className={`drawer-backdrop ${drawerOpen ? "show" : ""}`} onClick={() => setDrawerOpen(false)} aria-hidden />

      <nav className={`sidebar ${drawerOpen ? "open" : ""}`} aria-label="Main navigation">
        <BrandBlock />
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
        <MigrationBanner />
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
    <div className="onboard-overlay" role="dialog" aria-modal="true" aria-label="Welcome to QABrew">
      <div className="card onboard-card fade-in">
        <div className="row" style={{ gap: 12, marginBottom: 6 }}>
          <BrandMark size={40} />
          <h2 style={{ margin: 0 }}>Welcome to QABrew</h2>
        </div>
        <p className="muted">
          An illustrated QA workbook you can practise inside: lessons, flashcards, quizzes, challenges,
          minigames, and a bug-hunting sandbox. Everything runs locally in your browser - no account,
          no data leaves this device.
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
            <option value="light">Light (paper)</option>
            <option value="dark">Dark (midnight ink)</option>
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
