/** Shared presentational components. */

import React from "react";
import type { CodeSample, LessonBlock } from "../types/content";
import { RichText } from "../lib/richText";
import { glossary } from "../content/glossary";

const glossaryLookup = (id: string) => glossary.find((g) => g.id === id);

/** QABrew mark: a flask of brewing quality with a passing check. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="qb-flask">
          <path d="M26 11h12v10.5l9.4 18.8a9.6 9.6 0 0 1-8.7 13.7H25.3a9.6 9.6 0 0 1-8.7-13.7L26 21.5z" />
        </clipPath>
      </defs>
      <path d="M26 11h12v10.5l9.4 18.8a9.6 9.6 0 0 1-8.7 13.7H25.3a9.6 9.6 0 0 1-8.7-13.7L26 21.5z" fill="var(--bg-raised)" />
      <rect x="10" y="39" width="44" height="20" fill="var(--accent)" clipPath="url(#qb-flask)" />
      <circle cx="28.5" cy="43" r="2.4" fill="var(--bg-raised)" />
      <circle cx="36" cy="47" r="1.7" fill="var(--bg-raised)" />
      <path d="M26 11h12v10.5l9.4 18.8a9.6 9.6 0 0 1-8.7 13.7H25.3a9.6 9.6 0 0 1-8.7-13.7L26 21.5z" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M23 11h18" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="49" cy="15" r="9" fill="var(--accent)" />
      <path d="M45.3 15.2l2.7 2.7 5-5.4" fill="none" stroke="var(--accent-contrast)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Four-point spark doodle, the family margin decoration. Decorative only. */
export function Spark({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2 Q13 10 22 12 Q13 14 12 22 Q11 14 2 12 Q11 10 12 2 Z" fill="currentColor" />
    </svg>
  );
}

/** Handwritten margin note. Short annotations only - never body copy. */
export function HandNote({ children }: { children: React.ReactNode }) {
  return <p className="hand-note" style={{ margin: "6px 0 0" }}>{children}</p>;
}

/** Standard page header: eyebrow + serif title (squiggle underline via CSS) + lede. */
export function PageHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      {eyebrow && (
        <div className="eyebrow">
          <Spark /> {eyebrow}
        </div>
      )}
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </div>
  );
}

export function CodeBlock({ code }: { code: CodeSample }) {
  return (
    <div className="codeblock">
      {code.caption && <span className="code-caption">{code.caption}</span>}
      <code>{code.content}</code>
    </div>
  );
}

export function T({ text }: { text: string }) {
  return <RichText text={text} lookup={glossaryLookup} />;
}

const calloutToneClass: Record<string, string> = { tip: "tip", mistake: "mistake", note: "note" };

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="lesson lesson-body">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "prose":
            return (
              <p key={i}>
                <T text={b.text} />
              </p>
            );
          case "list":
            return b.ordered ? (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <T text={it} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <T text={it} />
                  </li>
                ))}
              </ul>
            );
          case "definition":
            return (
              <dl key={i} className="defn">
                <dt>{b.term}</dt>
                <dd>
                  <T text={b.text} />
                </dd>
              </dl>
            );
          case "example":
            return (
              <div key={i} className="card tight pad-sm">
                <h4>Example - {b.title}</h4>
                <p style={{ marginBottom: b.code ? "0" : undefined }}>
                  <T text={b.text} />
                </p>
                {b.code && <CodeBlock code={b.code} />}
              </div>
            );
          case "code":
            return <CodeBlock key={i} code={b.code} />;
          case "diagram":
            return <DiagramHost key={i} diagramId={b.diagramId} note={b.note} />;
          case "callout":
            return (
              <div key={i} className={`callout ${calloutToneClass[b.tone]}`}>
                <h4>{b.title}</h4>
                <p style={{ marginBottom: 0 }}>
                  <T text={b.text} />
                </p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Diagram host: resolves a diagram id to its interactive component (lazily, registry avoids cycles). */
import { getDiagram } from "../diagrams/registry";

export function DiagramHost({ diagramId, note }: { diagramId: string; note?: string }) {
  const entry = getDiagram(diagramId);
  if (!entry) {
    return <p className="muted">Diagram not found: {diagramId}</p>;
  }
  const Diagram = entry.component;
  return (
    <figure style={{ margin: "16px 0" }}>
      <div className="diagram-frame">
        <Diagram />
      </div>
      {note && <figcaption className="muted small" style={{ marginTop: 6 }}>{note}</figcaption>}
      <figcaption className="muted small" style={{ marginTop: 4 }}>{entry.title}</figcaption>
    </figure>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      <div>{children}</div>
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div>
      <div className="progressbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "progress"}>
        <div style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  children,
  className,
  confirmLabel = "Are you sure? This cannot be undone.",
  disabled,
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  className?: string;
  confirmLabel?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = React.useState(false);
  React.useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <>
      <button
        type="button"
        className={className ?? "btn btn-danger"}
        disabled={disabled}
        onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      >
        {armed ? "Click again to confirm" : children}
      </button>
      {armed && <span className="small" style={{ color: "var(--warn)" }}> {confirmLabel}</span>}
    </>
  );
}
