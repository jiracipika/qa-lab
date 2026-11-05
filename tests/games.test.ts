/** Game engines: boundary evaluation, sorter evaluation, detective evidence rules, sandbox planted defects. */

import { describe, expect, it } from "vitest";
import {
  boundaryRounds,
  classify,
  evaluateRound,
  targetClasses,
  valueForClass,
} from "../src/games/boundary";
import { bucketLabels, evaluateSort, sortItems } from "../src/games/sorter";
import { detectiveScenes, fileFinding, filterTxns, passwordCheck, shopDiscount } from "../src/games/detective";
import { addPayee, history, initialBank, login, sandboxDefects, transfer } from "../src/sandbox/engine";

describe("Boundary Hunter", () => {
  it("classifies values around both boundaries with the step size respected", () => {
    const spec = { name: "x", unit: "EUR", min: 1, max: 10000, step: 0.01, rule: "" };
    expect(classify(spec, 0.99)).toBe("below");
    expect(classify(spec, 1)).toBe("min");
    expect(classify(spec, 1.01)).toBe("min+");
    expect(classify(spec, 5000)).toBe("mid");
    expect(classify(spec, 9999.99)).toBe("max-");
    expect(classify(spec, 10000)).toBe("max");
    expect(classify(spec, 10000.01)).toBe("above");
  });

  it("perfect 3-point set earns full points; misses and extras are penalised and explained", () => {
    const round = boundaryRounds[0]; // 3-point, 1.00-10000.00
    const perfect = ["below", "min", "min+", "mid", "max-", "max"] // not below - 3-point has 5 targets
      .filter((c) => targetClasses(round.technique).includes(c as never))
      .map((c) => valueForClass(round.spec, c as never));
    const r = evaluateRound(round, perfect);
    expect(r.points).toBe(r.targetCount);
    expect(r.missed).toEqual([]);
    expect(r.extra).toEqual([]);

    const partial = evaluateRound(round, [1, 5000]); // min + mid only
    expect(partial.points).toBe(2);
    expect(partial.missed.map((m) => m.cls).sort()).toEqual(["max", "max-", "min+"].sort());

    const withExtras = evaluateRound(round, [...perfect, 55.55, 20000]);
    expect(withExtras.extra.length).toBe(2);
    expect(withExtras.points).toBe(r.targetCount - 2);
  });

  it("2-point technique accepts exactly the two edges - mid values count as extra", () => {
    const round = boundaryRounds[1]; // 2-point, age 18-65
    const r = evaluateRound(round, [18, 65]);
    expect(r.points).toBe(2);
    expect(r.missed).toEqual([]);
    const over = evaluateRound(round, [18, 65, 30]);
    expect(over.extra).toEqual([{ value: 30, cls: "mid" }]);
  });

  it("robust technique demands invalid neighbours", () => {
    const round = boundaryRounds[2]; // robust, 10-500 whole euros
    expect(targetClasses("robust")).toContain("below");
    expect(targetClasses("robust")).toContain("above");
    const r = evaluateRound(round, [9, 10, 11, 255, 499, 500, 501]);
    expect(r.points).toBe(7);
  });

  it("all five rounds have candidate pools that contain every target value", () => {
    for (const round of boundaryRounds) {
      for (const cls of targetClasses(round.technique)) {
        const target = valueForClass(round.spec, cls);
        expect(round.candidates).toContain(target);
      }
    }
  });
});

describe("Test Design Sorter", () => {
  it("scores correct placements and reports wrong ones with explanations", () => {
    const answers: Record<string, keyof typeof bucketLabels> = {};
    for (const item of sortItems) answers[item.id] = item.bucket;
    answers[sortItems[0].id] = "bva"; // deliberately wrong
    const r = evaluateSort(answers);
    expect(r.correct).toBe(sortItems.length - 1);
    expect(r.wrong).toHaveLength(1);
    expect(r.wrong[0].item.why.length).toBeGreaterThan(20);
  });

  it("has 12 items and 6 distinct buckets", () => {
    expect(sortItems.length).toBe(12);
    expect(new Set(sortItems.map((i) => i.bucket)).size).toBe(6);
  });
});

describe("Defect Detective", () => {
  const shop = detectiveScenes[0];

  it("rejects findings without evidence even against a genuinely broken rule", () => {
    expect(fileFinding(shop, "dd-shop-r1", "it feels wrong", [])).toBe("weak-evidence");
    expect(fileFinding(shop, "dd-shop-r1", "entered 100.00, no discount shown, expected 10% off", [])).toBe("accepted");
  });

  it("rejects findings against correctly implemented rules", () => {
    expect(fileFinding(shop, "dd-shop-r3", "entered 100.00 and total displayed 100.00 as expected, hmm no wait", [])).toBe("no-defect");
  });

  it("flags duplicate findings", () => {
    expect(fileFinding(shop, "dd-shop-r1", "entered 100.00, no discount, expected 90.00", ["dd-shop-r1"])).toBe("duplicate");
  });

  it("the planted shop defects are real in the logic (100.00 gets no discount; 145.55 truncates)", () => {
    expect(shopDiscount(100).discounted).toBe(false); // DEFECT: spec says >= 100 gets discount
    expect(shopDiscount(99.99).discounted).toBe(false);
    expect(shopDiscount(100.01).discounted).toBe(true);
    const r = shopDiscount(145.55);
    expect(r.total).toBe(130.99); // truncated; correct half-up rounding would be 131.00
  });

  it("password defects: exactly-8 rejected and spaces trimmed before length check", () => {
    expect(passwordCheck("Sandbox1").valid).toBe(false); // 8 chars: spec-valid, app rejects
    expect(passwordCheck("Sandbox12").valid).toBe(true);
    const withSpaces = passwordCheck("  Sandbox1  ");
    expect(withSpaces.countedLength).toBe(8); // trimmed: 11 chars counted as 8
  });

  it("transaction filter hides today's entries in Recent (the planted defect)", () => {
    const recent = filterTxns("recent");
    expect(recent.some((t) => t.daysAgo === 0)).toBe(false); // today excluded: defect
    const all = filterTxns("all");
    expect(all.some((t) => t.daysAgo === 0)).toBe(true);
    const large = filterTxns("large");
    expect(large.every((t) => Math.abs(t.amount) >= 100)).toBe(true); // correct behaviour
  });
});

describe("Sandbox bank defects are real", () => {
  it("D1: transfer of exactly 10,000.00 rejected although spec includes it", () => {
    const bank = initialBank();
    const r = transfer({ ...bank, balance: 20000 }, "py-1", "10000.00");
    expect(r.error).toMatch(/maximum/i);
    const ok = transfer({ ...bank, balance: 20000 }, "py-1", "9999.99");
    expect(ok.confirmation).toBeDefined();
  });

  it("D2: empty nickname accepted", () => {
    const bank = initialBank();
    const r = addPayee(bank, "   ", "12345678");
    expect(r.error).toBeUndefined();
    expect(r.state.payees.at(-1)?.nickname).toBe("");
  });

  it("D3: duplicate account numbers allowed", () => {
    let bank = initialBank();
    bank = addPayee(bank, "Second landlord", "11223344").state;
    expect(bank.payees.filter((p) => p.accountNumber === "11223344").length).toBe(2);
  });

  it("D4: Last 7 days history excludes today", () => {
    const bank = initialBank();
    expect(history(bank, "week").some((t) => t.daysAgo === 0)).toBe(false);
    expect(history(bank, "all").some((t) => t.daysAgo === 0)).toBe(true);
  });

  it("D5: confirmation truncates the displayed amount but debits exactly", () => {
    const bank = initialBank();
    const r = transfer(bank, "py-1", "250.75");
    expect(r.confirmation?.displayedAmount).toBe("250");
    expect(r.state.balance).toBe(4599.5);
    expect(r.state.transactions.at(-1)?.amount).toBe(-250.75);
  });

  it("D6: account never locks after repeated failures", () => {
    let bank = initialBank();
    for (let i = 0; i < 5; i++) bank = login(bank, "demo", "wrong-password").state;
    expect(bank.failedLogins).toBe(5);
    const ok = login(bank, "demo", "Sandbox123!");
    expect(ok.state.loggedIn).toBe(true); // still logs in: lockout absent (defect)
  });

  it("spec lists 7 lines and 6 documented defects map onto distinct spec lines", () => {
    expect(sandboxDefects.length).toBe(6);
    expect(new Set(sandboxDefects.map((d) => d.specId)).size).toBe(6);
  });
});
