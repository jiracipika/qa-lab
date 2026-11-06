/** RangeLab: the boundary playground classifies values with the same engine as Boundary Hunter. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RangeLab, AGE_SPEC, isValidClass } from "../src/components/RangeLab";
import { classify } from "../src/games/boundary";

describe("range lab classification (18-65 inclusive)", () => {
  it("sorts the seven boundary regions correctly", () => {
    expect(classify(AGE_SPEC, 17)).toBe("below");
    expect(classify(AGE_SPEC, 18)).toBe("min");
    expect(classify(AGE_SPEC, 19)).toBe("min+");
    expect(classify(AGE_SPEC, 41)).toBe("mid");
    expect(classify(AGE_SPEC, 64)).toBe("max-");
    expect(classify(AGE_SPEC, 65)).toBe("max");
    expect(classify(AGE_SPEC, 66)).toBe("above");
  });

  it("accepts exactly the inclusive range", () => {
    const valid = ["min", "min+", "mid", "max-", "max"];
    const invalid = ["below", "above"];
    for (const cls of valid) expect(isValidClass(cls as never)).toBe(true);
    for (const cls of invalid) expect(isValidClass(cls as never)).toBe(false);
  });
});

describe("range lab interaction", () => {
  it("shows a text verdict (not colour alone) and reacts to input", async () => {
    const user = userEvent.setup();
    render(<RangeLab />);
    // starts on 17: below the minimum -> invalid, with a reason in words
    expect(screen.getByText("\u2717 Invalid")).toBeInTheDocument();
    expect(screen.getByText(/17 is below the minimum/)).toBeInTheDocument();

    // step onto the boundary with the + button
    await user.click(screen.getByRole("button", { name: "Increase value by one" }));
    expect(screen.getByText("\u2713 Valid")).toBeInTheDocument();
    expect(screen.getByText(/18 is at the minimum boundary/)).toBeInTheDocument();

    // typing an out-of-range value flips the verdict back
    await user.clear(screen.getByRole("spinbutton", { name: /Applicant age value/ }));
    await user.type(screen.getByRole("spinbutton", { name: /Applicant age value/ }), "66");
    expect(screen.getByText("\u2717 Invalid")).toBeInTheDocument();
    expect(screen.getByText(/above the maximum/)).toBeInTheDocument();
  });
});
