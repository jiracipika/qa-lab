/** App shell: desktop sidebar, mobile drawer, onboarding overlay, migration notice. */

import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BookMarked,
  BookOpen,
  Bug,
  CircleHelp,
  HardDrive,
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
import { goalLabels } from "../content/goals";
import type { Goal } from "../types/content";
import type { AppState } from "../types/state";
import { BrandMark } from "./ui";

/**
 * Due-card count for the sidebar chip, computed without pulling the content layer
 * into the eager entry bundle: the selector (and the module content it reads) is
 * loaded on demand from the shared lazy chunk.
 */
function useDueCount(state: AppState) {
  const [due, setDue] = useState(0);
  useEffect(() => {
    let alive = true;
    import("../state/selectors").then(({ dueConceptCards }) => {
      if (alive) setDue(dueConceptCards(state).filter((card) => state.cards[card.id]).length);
    });
    return () => {
      alive = false;
    };
  }, [state]);
  return due;
}

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
    ],
  },
  {
    section: "Practice",
    items: [
      { to: "/challenges", label: "Challenges", ico: <PencilRuler strokeWidth={2} /> },
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

function Navigation({ due, onNavigate }: { due: number; onNavigate?: () => void }) {
  return (
    <nav className="navigation" aria-label="Main navigation">
      {NAV.map((group) => (
        <div className="nav-group" key={group.section}>
          <div className="nav-section">{group.section}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-ico" aria-hidden>{item.ico}</span>
              <span>{item.label}</span>
              {item.to === "/review" && due > 0 && <span className="nav-count" aria-label={`${due} cards due`}>{due}</span>}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="sidebar-footer">
        <HardDrive size={15} aria-hidden />
        <span>Progress saved on this device</span>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const drawer = useRef<HTMLDialogElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const due = useDueCount(state);
  const wide = location.pathname === "/" || location.pathname === "/modules";

  useEffect(() => {
    drawer.current?.close?.();
  }, [location.pathname]);

  useEffect(() => {
    const desktop = window.matchMedia?.("(min-width: 881px)");
    if (!desktop) return;
    const closeOnDesktop = () => {
      if (desktop.matches) drawer.current?.close?.();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="topbar">
        <button
          type="button"
          className="btn btn-ghost topbar-control"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            drawer.current?.showModal();
            setDrawerOpen(true);
          }}
        >
          <Menu size={21} aria-hidden />
        </button>
        <Link to="/" className="topbar-brand" aria-label="QABrew home">
          <BrandMark size={30} />
          <span className="brand-name">QABrew</span>
        </Link>
        <Link className="btn btn-ghost topbar-control" to="/review" aria-label={due > 0 ? `Review, ${due} cards due` : "Review"}>
          <Repeat size={20} aria-hidden />
          {due > 0 && <span className="topbar-indicator" aria-hidden />}
        </Link>
      </header>

      <aside className="sidebar">
        <BrandBlock />
        <Navigation due={due} />
      </aside>
      <dialog
        className="sidebar-drawer"
        id="mobile-navigation"
        ref={drawer}
        aria-label="Navigation menu"
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) drawer.current?.close?.();
        }}
      >
        <div className="drawer-panel">
          <div className="drawer-heading">
            <BrandBlock />
            <button type="button" className="btn btn-ghost topbar-control" aria-label="Close menu" onClick={() => drawer.current?.close?.()} autoFocus>
              <X size={21} aria-hidden />
            </button>
          </div>
          <Navigation due={due} onNavigate={() => drawer.current?.close?.()} />
        </div>
      </dialog>

      <main className={wide ? "main main-wide" : "main"} id="main" tabIndex={-1}>
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

  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onboarding = dialog.current;
    if (!onboarding || onboarding.open) return;
    if (typeof onboarding.showModal === "function") {
      onboarding.showModal();
    } else {
      onboarding.setAttribute("open", "");
    }
  }, []);

  return (
    <dialog
      className="onboard-card"
      ref={dialog}
      aria-modal="true"
      aria-labelledby="onboard-title"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="onboard-intro">
        <span className="brand-mark"><BrandMark size={42} /></span>
        <h2 id="onboard-title">Welcome to QABrew</h2>
        <p>Study software testing with lessons, flashcards, and hands-on practice.</p>
      </div>
      <form className="onboard-form" onSubmit={(event) => {
        event.preventDefault();
        if (goal === null) return;
        dispatch({ type: "setPrefs", prefs: { goal, theme } });
        dispatch({ type: "onboardDone" });
        requestAnimationFrame(() => document.getElementById("main")?.focus());
      }}>
        <fieldset className="field">
          <legend>What do you want to focus on?</legend>
          <div className="goal-pick">
            {(Object.keys(goalLabels) as Goal[]).map((g) => (
              <label key={g}>
                <input type="radio" name="onboard-goal" value={g} checked={goal === g} onChange={() => setGoal(g)} />
                {goalLabels[g]}
              </label>
            ))}
          </div>
          <span className="hint">Your goal guides lesson suggestions. You can change it in Settings.</span>
        </fieldset>
        <div className="field">
          <label htmlFor="ob-theme">Theme</label>
          <select id="ob-theme" className="select" value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
            <option value="light">Light (paper)</option>
            <option value="dark">Dark (midnight ink)</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary onboard-submit" disabled={goal === null}>
          {goal === null ? "Pick a goal to start" : `Start: ${goalLabels[goal]}`}
        </button>
      </form>
    </dialog>
  );
}
