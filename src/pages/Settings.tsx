/** Settings: goal, theme, motion, export/import, reset. */

import { useRef, useState } from "react";
import { useStore } from "../state/store";
import { goalLabels } from "../content";
import type { Goal } from "../types/content";
import { exportToString, validateImport, downloadJSON, type ImportResult } from "../lib/io";
import { ConfirmButton } from "../components/ui";

export function SettingsPage() {
  const { state, dispatch, saveError } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ImportResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const doExport = () => {
    const text = exportToString(state);
    downloadJSON(`qa-lab-progress-${new Date().toISOString().slice(0, 10)}.json`, text);
    setStatus("Export downloaded. Keep it somewhere safe - it contains all your progress.");
  };

  const onFile = (file: File) => {
    file.text().then((text) => {
      setImportPreview(validateImport(text));
      setStatus(null);
    });
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1>Settings</h1>
        <p className="lede">Preferences, goal, and your data: export, import, reset.</p>
      </div>

      {saveError && (
        <div className="callout mistake">
          <h4>Progress is not being saved</h4>
          <p style={{ margin: 0 }}>
            localStorage appears unavailable (private mode or full storage). Export your progress regularly to avoid losing it.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Learning goal</h2>
        <div className="field">
          <label htmlFor="set-goal">Suggestions order follows this; access to everything stays open.</label>
          <select
            id="set-goal"
            className="select"
            value={state.preferences.goal ?? ""}
            onChange={(e) => dispatch({ type: "setGoal", goal: (e.target.value || null) as Goal | null })}
          >
            <option value="">No goal selected</option>
            {(Object.keys(goalLabels) as Goal[]).map((g) => (
              <option key={g} value={g}>{goalLabels[g]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Appearance</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="set-theme">Theme</label>
            <select
              id="set-theme"
              className="select"
              value={state.preferences.theme}
              onChange={(e) => dispatch({ type: "setPrefs", prefs: { theme: e.target.value as "light" | "dark" } })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="set-motion">Animations</label>
            <select
              id="set-motion"
              className="select"
              value={state.preferences.motion}
              onChange={(e) => dispatch({ type: "setPrefs", prefs: { motion: e.target.value as "full" | "reduced" } })}
            >
              <option value="full">Full</option>
              <option value="reduced">Reduced (also respects your OS setting)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Your data</h2>
        <p className="small muted">
          All progress lives in this browser's localStorage - device and browser specific. Export moves it elsewhere;
          imports overwrite what is here now (after confirmation).
        </p>
        <div className="row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn btn-primary" onClick={doExport}>
            Export progress (JSON)
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Import from file...
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="visually-hidden"
            aria-label="Choose a QA Lab export file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {importPreview && (
          <div className="callout note fade-in">
            <h4>Import preview</h4>
            {importPreview.ok ? (
              <>
                <p style={{ margin: "0 0 8px" }}>
                  Valid QA Lab export. Importing <strong>replaces all current progress</strong>
                  {` (${Object.keys(state.lessons).length} lessons, ${Object.keys(state.cards).length} cards in schedule, ${state.sandboxReports.length} reports)`}.
                </p>
                <div className="row">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      dispatch({ type: "importState", state: importPreview.data! });
                      setImportPreview(null);
                      setStatus("Import complete. Your previous state was replaced.");
                    }}
                  >
                    Overwrite with import
                  </button>
                  <button type="button" className="btn" onClick={() => setImportPreview(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="small" style={{ margin: "0 0 6px" }}>This file cannot be imported:</p>
                <ul className="small" style={{ margin: 0, paddingLeft: "1.2em" }}>
                  {importPreview.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {status && <p className="chip chip-ok">{status}</p>}

        <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <h3>Reset</h3>
          <p className="small muted">Deletes all progress, answers, notes, reports, and schedule data in this browser. Preferences are kept.</p>
          <ConfirmButton
            onConfirm={() => {
              dispatch({ type: "reset" });
              setStatus("Progress reset. Fresh start.");
            }}
          >
            Reset all progress
          </ConfirmButton>
        </div>
      </div>

      <div className="card">
        <h2>About QA Lab</h2>
        <p className="small muted" style={{ margin: 0 }}>
          Personal QA learning workspace. Runs fully client-side; no accounts, no tracking, no secrets. Terminology
          aligned with the ISTQB CTFL v4.0 syllabus (v4.0.1, checked against istqb.org 2026-11-05); all questions are
          original practice material. Export format version: 1.
        </p>
      </div>
    </div>
  );
}
