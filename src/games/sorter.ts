/** Test Design Sorter: scenarios bucketed into techniques. Pure data + evaluation. */

export type SortBucket = "ep" | "bva" | "decision" | "state" | "exploratory" | "guess";

export interface SortItem {
  id: string;
  text: string;
  bucket: SortBucket;
  why: string;
}

export const bucketLabels: Record<SortBucket, string> = {
  ep: "Equivalence partitioning",
  bva: "Boundary value analysis",
  decision: "Decision table",
  state: "State transition",
  exploratory: "Exploratory testing",
  guess: "Error guessing",
};

export const sortItems: SortItem[] = [
  {
    id: "ts-1",
    text: "Rule: 'Amounts from 1.00 to 10,000.00 are valid.' You test 250.00, 0.99, and 25,000.00.",
    bucket: "ep",
    why: "One representative per partition (valid, below, above) - no edge values attacked, so this is equivalence partitioning.",
  },
  {
    id: "ts-2",
    text: "Rule: 'Amounts from 1.00 to 10,000.00 are valid.' You test 0.99, 1.00, 1.01, 9,999.99, 10,000.00, 10,000.01.",
    bucket: "bva",
    why: "Values at and immediately around both edges: boundary value analysis with invalid neighbours.",
  },
  {
    id: "ts-3",
    text: "Behaviour depends on: card blocked? balance sufficient? overdraft arranged? You enumerate all combinations.",
    bucket: "decision",
    why: "Multiple interacting conditions mapped to actions: a decision table, one column per combination.",
  },
  {
    id: "ts-4",
    text: "You systematically try to cancel a transfer during every lifecycle stage, including while it executes.",
    bucket: "state",
    why: "Sending events in states where they are forbidden: state transition testing of invalid transitions.",
  },
  {
    id: "ts-5",
    text: "With a 60-minute charter, you freely probe the checkout flow around payment failures, following what surprises you.",
    bucket: "exploratory",
    why: "Timeboxed, mission-driven, simultaneous learning and execution: exploratory testing.",
  },
  {
    id: "ts-6",
    text: "Because past defects clustered on decimal inputs, you test 0.005, .99 rounding, and pasted values with trailing spaces.",
    bucket: "guess",
    why: "Selection driven by defect history and intuition about likely mistakes: error guessing.",
  },
  {
    id: "ts-7",
    text: "A field accepts 1-30 characters; you test lengths 0, 1, 2, 29, 30, 31.",
    bucket: "bva",
    why: "Length edges with inside/outside neighbours: BVA applied to a non-numeric dimension.",
  },
  {
    id: "ts-8",
    text: "Valid card types are Visa, Mastercard, Amex; you test one valid card of each type plus one unsupported type.",
    bucket: "ep",
    why: "Each card type is a partition handled differently; one representative each - equivalence partitioning.",
  },
  {
    id: "ts-9",
    text: "You verify that a 'frozen' account unfreezes correctly only via support, and that self-service unfreeze is rejected.",
    bucket: "state",
    why: "Which events are allowed from which state (and which must be rejected): state transition testing.",
  },
  {
    id: "ts-10",
    text: "You spend an afternoon trying double-clicks, browser back buttons, and resubmitting a form after a timeout.",
    bucket: "guess",
    why: "Classic defect-prone behaviours targeted by experience: error guessing (though it shades into exploration, the driver is a hunch list, not a charter).",
  },
  {
    id: "ts-11",
    text: "Fee depends on amount (under/over 1,000) AND currency (EUR/USD). You build a grid of all amount x currency cases.",
    bucket: "decision",
    why: "Two conditions combined determine the action: decision table territory.",
  },
  {
    id: "ts-12",
    text: "You take a fresh session, no scripted steps, and ask 'what happens if I abandon at each step of this wizard?'",
    bucket: "exploratory",
    why: "Unscripted investigation guided by a question, learning while testing: exploratory.",
  },
];

export function evaluateSort(answers: Record<string, SortBucket>): { correct: number; total: number; wrong: { item: SortItem; given: SortBucket }[] } {
  const wrong: { item: SortItem; given: SortBucket }[] = [];
  let correct = 0;
  for (const item of sortItems) {
    const given = answers[item.id];
    if (!given) continue;
    if (given === item.bucket) correct += 1;
    else wrong.push({ item, given });
  }
  return { correct, total: sortItems.length, wrong };
}
