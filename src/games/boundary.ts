/** Boundary Hunter engine: pure functions, unit-tested. Values classify into regions around the boundaries. */

export type ValueClass = "below" | "min" | "min+" | "mid" | "max-" | "max" | "above";

export interface BoundarySpec {
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  rule: string;
}

export interface BoundaryRound {
  id: string;
  spec: BoundarySpec;
  technique: "2-point" | "3-point" | "robust";
  scenario: string;
  candidates: number[];
}

export interface BoundaryEval {
  missed: { value: number; cls: ValueClass }[];
  extra: { value: number; cls: ValueClass }[];
  points: number;
  targetCount: number;
}

export function midValue(spec: BoundarySpec): number {
  const mid = (spec.min + spec.max) / 2;
  return round2(Math.round(mid / spec.step) * spec.step);
}

export function classify(spec: BoundarySpec, v: number): ValueClass {
  const { min, max, step } = spec;
  if (v < min - step / 2) return "below";
  if (Math.abs(v - min) < step / 2) return "min";
  if (Math.abs(v - (min + step)) < step / 2) return "min+";
  if (Math.abs(v - (max - step)) < step / 2) return "max-";
  if (Math.abs(v - max) < step / 2) return "max";
  if (v > max + step / 2) return "above";
  return "mid";
}

export function targetClasses(technique: BoundaryRound["technique"]): ValueClass[] {
  switch (technique) {
    case "2-point":
      return ["min", "max"];
    case "3-point":
      return ["min", "min+", "mid", "max-", "max"];
    case "robust":
      return ["below", "min", "min+", "mid", "max-", "max", "above"];
  }
}

export function evaluateRound(round: BoundaryRound, selected: number[]): BoundaryEval {
  const targets = targetClasses(round.technique);
  const hitClasses = new Set<ValueClass>();
  const extra: { value: number; cls: ValueClass }[] = [];
  for (const v of selected) {
    const cls = classify(round.spec, v);
    // A second pick in an already-covered class (e.g. two mid values) is a wasted pick.
    if (targets.includes(cls) && !hitClasses.has(cls)) {
      hitClasses.add(cls);
    } else {
      extra.push({ value: v, cls });
    }
  }
  const missed = targets
    .filter((t) => !hitClasses.has(t))
    .map((t) => ({ value: valueForClass(round.spec, t), cls: t }));
  const points = Math.max(0, targets.length - missed.length - extra.length);
  return { missed, extra, points, targetCount: targets.length };
}

export function valueForClass(spec: BoundarySpec, cls: ValueClass): number {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  switch (cls) {
    case "below":
      return round2(spec.min - spec.step);
    case "min":
      return spec.min;
    case "min+":
      return round2(spec.min + spec.step);
    case "mid":
      return midValue(spec);
    case "max-":
      return round2(spec.max - spec.step);
    case "max":
      return spec.max;
    case "above":
      return round2(spec.max + spec.step);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const boundaryRounds: BoundaryRound[] = [
  {
    id: "bh-1",
    spec: { name: "Transfer amount", unit: "EUR", min: 1.0, max: 10000.0, step: 0.01, rule: "Transfers accept 1.00 to 10,000.00 inclusive." },
    technique: "3-point",
    scenario: "A payment screen. Pick the values a 3-point BVA set needs.",
    candidates: [0.99, 1.0, 1.01, 55.55, 250.0, 5000.5, 9998.0, 9999.99, 10000.0, 10000.01, 20000.0],
  },
  {
    id: "bh-2",
    spec: { name: "Customer age", unit: "years", min: 18, max: 65, step: 1, rule: "The product is available to customers aged 18 to 65 inclusive." },
    technique: "2-point",
    scenario: "Adult banking product. Pick only what a 2-point BVA set needs.",
    candidates: [0, 17, 18, 19, 30, 41, 64, 65, 66, 99],
  },
  {
    id: "bh-3",
    spec: { name: "Card top-up", unit: "EUR", min: 10, max: 500, step: 1, rule: "Whole-euro top-ups from 10 to 500 inclusive." },
    technique: "robust",
    scenario: "Prepaid top-up with whole euros only. A robustness analysis wants the invalid neighbours too.",
    candidates: [8, 9, 10, 11, 99, 255, 499, 500, 501, 502],
  },
  {
    id: "bh-4",
    spec: { name: "Nickname length", unit: "characters", min: 1, max: 30, step: 1, rule: "Payee nicknames are 1 to 30 characters." },
    technique: "3-point",
    scenario: "A text field's length rule. Which lengths make the 3-point set?",
    candidates: [0, 1, 2, 5, 15, 16, 29, 30, 31, 45],
  },
  {
    id: "bh-5",
    spec: { name: "Scheduled days ahead", unit: "days", min: 1, max: 30, step: 1, rule: "Transfers can be scheduled 1 to 30 days ahead." },
    technique: "robust",
    scenario: "Future-dated transfers. Robust set: include the invalid neighbours.",
    candidates: [-1, 0, 1, 2, 15, 16, 29, 30, 31, 60],
  },
];

export const classLabels: Record<ValueClass, string> = {
  below: "below the valid range",
  min: "the minimum boundary",
  "min+": "just above the minimum",
  mid: "a mid-range value",
  "max-": "just below the maximum",
  max: "the maximum boundary",
  above: "above the valid range",
};

export function formatValue(spec: BoundarySpec, v: number): string {
  return spec.step < 1 ? v.toFixed(2) : String(Math.round(v * 10) / 10);
}

export { round2 };
