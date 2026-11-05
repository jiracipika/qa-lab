/** Defect Detective: scene specs + pure evaluation. The UI renders genuinely buggy widgets;
 *  findings are only accepted with a real reproduction write-up (evidence, not random clicks). */

export interface DetectiveRule {
  id: string;
  text: string;
  hasDefect: boolean;
  defectTitle?: string;
  explanation?: string;
}

export interface DetectiveScene {
  id: string;
  name: string;
  intro: string;
  rules: DetectiveRule[];
}

export const detectiveScenes: DetectiveScene[] = [
  {
    id: "dd-shop",
    name: "Scene 1: Shop discount calculator",
    intro: "Interrogate the widget below, then file findings against the written specification.",
    rules: [
      {
        id: "dd-shop-r1",
        text: "Orders of 100.00 EUR or more receive a 10% discount.",
        hasDefect: true,
        defectTitle: "Discount not applied at exactly 100.00",
        explanation: "The app applies the discount only above 100.00 (strict >): an order of exactly 100.00 - which the spec includes - pays full price. Classic inclusive-boundary defect.",
      },
      {
        id: "dd-shop-r2",
        text: "Discounted totals are rounded half-up to two decimals.",
        hasDefect: true,
        defectTitle: "Totals truncated instead of rounded",
        explanation: "Probe with 145.55: 10% off gives 130.995, which should round half-up to 131.00 - but the widget shows 130.99. Another clean probe: 100.01 -> 90.009 -> should be 90.01, widget shows 90.00. The app truncates (floors) the third decimal instead of rounding half-up.",
      },
      {
        id: "dd-shop-r3",
        text: "The order total shows the final payable amount.",
        hasDefect: false,
      },
    ],
  },
  {
    id: "dd-pass",
    name: "Scene 2: Password validator",
    intro: "The spec is written; the widget claims to implement it. Where does behaviour diverge?",
    rules: [
      {
        id: "dd-pass-r1",
        text: "Passwords must be at least 8 characters long.",
        hasDefect: true,
        defectTitle: "Exactly-8-character passwords rejected",
        explanation: "The validator uses > 8 instead of >= 8. An 8-character password like 'Sandbox1' - valid per spec - is rejected.",
      },
      {
        id: "dd-pass-r2",
        text: "Passwords must contain at least one digit.",
        hasDefect: false,
      },
      {
        id: "dd-pass-r3",
        text: "All characters count towards the length, including spaces.",
        hasDefect: true,
        defectTitle: "Leading/trailing spaces dropped before length check",
        explanation: "The widget trims input first: '  Sandbox1  ' (11 chars) is treated as 8 - and worse, a password that is only valid because of its spaces fails. Length rules must count exactly what the spec counts.",
      },
    ],
  },
  {
    id: "dd-tx",
    name: "Scene 3: Transaction filters",
    intro: "A small account history with two quick filters. Check each filter against the spec.",
    rules: [
      {
        id: "dd-tx-r1",
        text: "'Recent' shows the last 7 days of transactions, including today's.",
        hasDefect: true,
        defectTitle: "'Recent' filter excludes today's transactions",
        explanation: "Salary (+300.00, today) and Books (-75.00, today) disappear from 'Recent' even though they are within the 7-day window. An off-by-one on the date comparison - the kind of defect that makes customers call support on payday.",
      },
      {
        id: "dd-tx-r2",
        text: "'Recent' sorts newest first.",
        hasDefect: false,
      },
      {
        id: "dd-tx-r3",
        text: "'Large' shows transactions of 100.00 or more.",
        hasDefect: false,
      },
    ],
  },
];

export type FindingVerdict = "accepted" | "no-defect" | "weak-evidence" | "duplicate";

export function fileFinding(scene: DetectiveScene, ruleId: string, repro: string, alreadyFound: string[]): FindingVerdict {
  const rule = scene.rules.find((r) => r.id === ruleId);
  if (!rule) return "no-defect";
  const evidence = repro.trim();
  if (evidence.length < 40 || !/\d/.test(evidence)) {
    return "weak-evidence";
  }
  if (!rule.hasDefect) return "no-defect";
  if (alreadyFound.includes(rule.id)) return "duplicate";
  return "accepted";
}

/* ---- genuinely buggy scene logic (the defects are real in these functions) ---- */

export function shopDiscount(amount: number): { total: number; discountLine: number | null; discounted: boolean } {
  // DEFECT 1: > instead of >= (spec: 100.00 or more)
  const discounted = amount > 100;
  if (!discounted) return { total: amount, discountLine: null, discounted: false };
  const raw = amount * 0.9;
  // DEFECT 2: truncation instead of half-up rounding
  const total = Math.floor(raw * 100) / 100;
  return { total, discountLine: round2(amount - total), discounted: true };
}

export function passwordCheck(pw: string): { valid: boolean; reason: string; strength: string; countedLength: number } {
  // DEFECT: trims input first (spec: spaces count)
  const trimmed = pw.trim();
  const hasDigit = /\d/.test(trimmed);
  // DEFECT: > 8 instead of >= 8
  const longEnough = trimmed.length > 8;
  const valid = longEnough && hasDigit;
  return {
    valid,
    reason: !longEnough ? "Too short (minimum 8 characters)" : !hasDigit ? "Must contain a digit" : "Valid password",
    strength: trimmed.length >= 8 ? "strong" : trimmed.length >= 5 ? "medium" : "weak",
    countedLength: trimmed.length,
  };
}

export interface Txn { id: string; label: string; amount: number; daysAgo: number }

export const detectiveTxns: Txn[] = [
  { id: "t1", label: "Salary", amount: 300.0, daysAgo: 0 },
  { id: "t2", label: "Groceries", amount: -25.0, daysAgo: 1 },
  { id: "t3", label: "Electronics", amount: -120.0, daysAgo: 2 },
  { id: "t4", label: "Streaming", amount: -9.99, daysAgo: 5 },
  { id: "t5", label: "Refund", amount: 50.0, daysAgo: 8 },
  { id: "t6", label: "Books", amount: -75.0, daysAgo: 0 },
];

export function filterTxns(mode: "all" | "recent" | "large"): Txn[] {
  if (mode === "all") return [...detectiveTxns].sort((a, b) => a.daysAgo - b.daysAgo);
  if (mode === "large") return detectiveTxns.filter((t) => Math.abs(t.amount) >= 100);
  // DEFECT: daysAgo < 7 excludes today (0 would pass >=0? no: bug is daysAgo < 1... implement as >0 and <7 => excludes today)
  return detectiveTxns.filter((t) => t.daysAgo > 0 && t.daysAgo < 7).sort((a, b) => a.daysAgo - b.daysAgo);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
