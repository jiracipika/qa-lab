/** Shared presentational components used by the eager shell and lazy pages alike.
 *  Lesson-rendering pieces (rich text, code, diagrams) live in lessonUi.tsx so the
 *  entry chunk stays free of the glossary and diagram components. */

import React from "react";

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
