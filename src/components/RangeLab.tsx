/**
 * RangeLab - the boundary-value playground.
 * A numeric field that accepts min..max inclusive (default: applicant age 18-65).
 * The learner probes values just below / at / just above each boundary and sees
 * the verdict with text and markers (never colour alone). Classification reuses
 * the same tested engine as the Boundary Hunter game (games/boundary.ts).
 */

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { classify, type BoundarySpec, type ValueClass } from "../games/boundary";

export const AGE_SPEC: BoundarySpec = {
  name: "Applicant age",
  unit: "years",
  min: 18,
  max: 65,
  step: 1,
  rule: "accepts 18 to 65 inclusive",
};

const CLASS_LABEL: Record<ValueClass, string> = {
  below: "below the minimum",
  min: "at the minimum boundary",
  "min+": "one step inside the minimum",
  mid: "comfortably inside the range",
  "max-": "one step inside the maximum",
  max: "at the maximum boundary",
  above: "above the maximum",
};

const CLASS_VERDICT: Record<ValueClass, string> = {
  below: "Rejected - one step outside the valid range.",
  min: "Accepted - the classic boundary pick.",
  "min+": "Accepted - the first step inside.",
  mid: "Accepted - the boring, safe case (an EP representative, not BVA).",
  "max-": "Accepted - the last step inside.",
  max: "Accepted - the other classic boundary pick.",
  above: "Rejected - one step outside the valid range.",
};

export function isValidClass(cls: ValueClass): boolean {
  return cls !== "below" && cls !== "above";
}

/** SVG number line: valid band + boundary ticks + a pin at the current value.
 *  Neighbour ticks (min-1/min+1/max-1/max+1) sit one step from the boundary ticks,
 *  so their number labels are staggered onto two rows to keep ~18px clearance
 *  between same-row labels (2-digit labels need ~14px at font-size 11). */
function RangeLine({ spec, value, cls }: { spec: BoundarySpec; value: number; cls: ValueClass }) {
  const lo = spec.min - 4;
  const hi = spec.max + 4;
  const W = 760;
  const H = 74;
  const pad = 26;
  const x = (v: number) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
  const pinX = Math.min(W - pad, Math.max(pad, x(value)));
  const ticks = [spec.min - 1, spec.min, spec.min + 1, spec.max - 1, spec.max, spec.max + 1];
  return (
    <svg className="rangelab-line" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Valid band from ${spec.min} to ${spec.max}. Current value ${value} is ${CLASS_LABEL[cls]}.`}>
      <defs>
        {/* hatched fill for the invalid zones - readable even at a glance */}
        <pattern id="rangelab-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="var(--bad-soft)" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--bad-line)" strokeWidth="2.2" />
        </pattern>
      </defs>
      {/* invalid zones */}
      <rect x={pad} y={22} width={Math.max(0, x(spec.min) - pad)} height={14} fill="url(#rangelab-hatch)" />
      <rect x={x(spec.max)} y={22} width={Math.max(0, W - pad - x(spec.max))} height={14} fill="url(#rangelab-hatch)" />
      {/* valid band */}
      <rect x={x(spec.min)} y={22} width={x(spec.max) - x(spec.min)} height={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
      <text x={(x(spec.min) + x(spec.max)) / 2} y={19} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--accent-strong)">
        valid {spec.min}-{spec.max}
      </text>
      {/* boundary + neighbour ticks; numbers staggered on two rows */}
      {ticks.map((t) => {
        const valid = t >= spec.min && t <= spec.max;
        const isBoundary = t === spec.min || t === spec.max;
        // hide the tick mark glyph when the pin label occupies that spot
        const pinNear = Math.abs(x(t) - pinX) < 13;
        return (
          <g key={t}>
            <line x1={x(t)} y1={valid ? 18 : 24} x2={x(t)} y2={valid ? 42 : 36} stroke={valid ? "var(--accent)" : "var(--bad-line)"} strokeWidth={isBoundary ? 2.5 : 1.5} />
            <text x={x(t)} y={isBoundary ? 66 : 54} textAnchor="middle" fontSize="11" fill="var(--ink-soft)" fontWeight={isBoundary ? 700 : 500}>
              {t}
            </text>
            {!pinNear && (
              <text x={x(t)} y={14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={valid ? "var(--accent)" : "var(--bad)"}>
                {valid ? "\u2713" : "\u2717"}
              </text>
            )}
          </g>
        );
      })}
      {/* pin at the current value */}
      <g>
        <path d={`M${pinX} 46 L${pinX - 5} 56 L${pinX + 5} 56 Z`} fill="var(--ink)" />
        <text x={pinX} y={10} textAnchor="middle" fontSize="11" fontWeight="750" fill="var(--ink)">
          {value}
        </text>
      </g>
    </svg>
  );
}

export function RangeLab({ spec = AGE_SPEC }: { spec?: BoundarySpec }) {
  const [raw, setRaw] = useState<string>("17");
  const parsed = Number(raw);
  const has = raw.trim() !== "" && Number.isFinite(parsed);
  const cls = has ? classify(spec, parsed) : null;
  const valid = cls ? isValidClass(cls) : false;
  const clampStep = (d: number) => {
    const base = has ? parsed : spec.min;
    setRaw(String(Math.min(spec.max + 6, Math.max(spec.min - 6, base + d))));
  };
  const fmt = (v: number) => (spec.step < 1 ? v.toFixed(2) : String(v));
  // ISTQB CTFL 4.0 sets for the current spec: boundary + adjacent-partition
  // neighbour (2-value), and boundary + both neighbours (3-value).
  const twoValueSet = [spec.min - spec.step, spec.min, spec.max, spec.max + spec.step].map((v) => Math.round(v * 100) / 100);
  const threeValueSet = [spec.min - spec.step, spec.min, spec.min + spec.step, spec.max - spec.step, spec.max, spec.max + spec.step].map((v) => Math.round(v * 100) / 100);

  return (
    <div className="rangelab">
      <div className="rangelab-controls">
        <span style={{ fontWeight: 650 }}>{spec.name}: enter a value</span>
        <button type="button" className="btn btn-sm rangelab-step" aria-label="Decrease value by one" onClick={() => clampStep(-spec.step)}>
          <Minus size={16} aria-hidden />
        </button>
        <input
          className="input rangelab-input"
          type="number"
          inputMode="numeric"
          aria-label={`${spec.name} value to check, ${spec.rule}`}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <button type="button" className="btn btn-sm rangelab-step" aria-label="Increase value by one" onClick={() => clampStep(spec.step)}>
          <Plus size={16} aria-hidden />
        </button>
        <span className="muted small">field {spec.rule}</span>
      </div>

      <div className="rangelab-verdict" data-valid={cls ? (valid ? "yes" : "no") : "na"} aria-live="polite">
        {cls ? (
          <>
            <span className="verdict-badge">{valid ? "\u2713 Valid" : "\u2717 Invalid"}</span>
            <span>
              {parsed} is {CLASS_LABEL[cls]}. {CLASS_VERDICT[cls]}
            </span>
          </>
        ) : (
          <span className="muted">Type a number to classify it.</span>
        )}
      </div>

      {cls && <RangeLine spec={spec} value={parsed} cls={cls} />}

      <div className="rangelab-jumps" aria-label="Jump to interesting values">
        <span className="muted small">Probe:</span>
        {[spec.min - 1, spec.min, spec.min + 1, Math.round((spec.min + spec.max) / 2), spec.max - 1, spec.max, spec.max + 1].map((v) => (
          <button key={v} type="button" className="chip chip-button mono" aria-pressed={has && parsed === v} onClick={() => setRaw(String(v))}>
            {v}
          </button>
        ))}
      </div>

      <div className="rangelab-sets">
        <span className="rangelab-sets-label">ISTQB sets for {spec.min}-{spec.max}:</span>
        <span className="rangelab-set">
          <strong>2-value</strong> {twoValueSet.map(fmt).join(", ")}
        </span>
        <span className="rangelab-set">
          <strong>3-value</strong> {threeValueSet.map(fmt).join(", ")}
        </span>
      </div>
    </div>
  );
}
