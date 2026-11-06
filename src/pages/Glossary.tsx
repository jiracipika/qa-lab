/** Glossary with search + comparison view for commonly confused concepts. */

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { comparisons, glossary } from "../content/glossary";
import { modules } from "../content";
import { EmptyState } from "../components/ui";

export function GlossaryPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "compare" ? "compare" : "terms";
  const [query, setQuery] = useState("");
  const focusTerm = params.get("term");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return glossary;
    return glossary.filter((g) => g.term.toLowerCase().includes(q) || g.short.toLowerCase().includes(q) || g.text.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">Reference</div>
        <h1>Glossary</h1>
        <p className="lede">Plain-language definitions linked from lessons, plus side-by-side comparisons of the pairs everyone mixes up.</p>
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "terms"} className="tab" onClick={() => setParams({})}>Terms</button>
        <button role="tab" aria-selected={tab === "compare"} className="tab" onClick={() => setParams({ tab: "compare" })}>Easily confused</button>
      </div>

      {tab === "terms" ? (
        <>
          <div className="field" style={{ maxWidth: 420 }}>
            <label htmlFor="glossary-search">Search</label>
            <input id="glossary-search" className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="boundary, severity, regression..." type="search" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No matching terms">Try a shorter search.</EmptyState>
          ) : (
            <div className="stack">
              {filtered.map((g) => {
                const mod = g.moduleId ? modules.find((m) => m.id === g.moduleId) : undefined;
                const isFocus = focusTerm === g.id;
                return (
                  <div key={g.id} id={g.id} className={`card pad-sm ${isFocus ? "" : "tight"}`} style={isFocus ? { borderColor: "var(--accent)" } : undefined}>
                    <div className="row between">
                      <h3 style={{ margin: 0 }}>{g.term}</h3>
                      {mod && <span className="chip">Module {mod.letter}</span>}
                    </div>
                    <p style={{ margin: "6px 0 0" }}>{g.text}</p>
                    {g.seeAlso && g.seeAlso.length > 0 && (
                      <p className="small muted" style={{ margin: "6px 0 0" }}>
                        See also:{" "}
                        {g.seeAlso.map((id) => {
                          const other = glossary.find((x) => x.id === id);
                          return other ? (
                            <a key={id} href={`#/glossary?term=${id}`} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}>
                              {other.term}
                            </a>
                          ) : null;
                        })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="stack">
          {comparisons.map((c) => (
            <div className="card" key={c.id}>
              <h2 style={{ marginBottom: 12 }}>
                {c.a} <span className="muted">vs</span> {c.b}
              </h2>
              <div className="grid2">
                <div className="callout" style={{ margin: 0 }}>
                  <h4>{c.a}</h4>
                  <p style={{ margin: 0 }}>{c.aText}</p>
                </div>
                <div className="callout" style={{ margin: 0, borderLeftColor: "var(--warn)" }}>
                  <h4>{c.b}</h4>
                  <p style={{ margin: 0 }}>{c.bText}</p>
                </div>
              </div>
              <p className="small" style={{ margin: "12px 0 0" }}>
                <strong>Rule of thumb:</strong> {c.ruleOfThumb}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
