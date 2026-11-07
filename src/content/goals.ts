/** Learning goals: the only piece of the content layer the eager app shell needs. Kept free of module content imports. */

import type { Goal } from "../types/content";

export const goalLabels: Record<Goal, string> = {
  fundamentals: "Learn QA fundamentals",
  manual: "Practise manual testing",
  istqb: "Prepare for ISTQB-style questions",
  automation: "Develop automation skills",
  interview: "Prepare for QA interviews",
};
