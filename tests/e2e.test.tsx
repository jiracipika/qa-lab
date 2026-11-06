/**
 * End-to-end learner journey in jsdom:
 * onboard -> open module -> complete lesson -> answer quiz with explanations ->
 * review a card -> play Boundary Hunter -> file a sandbox defect report ->
 * reload (fresh mount over the same localStorage) -> progress survives -> export round-trips.
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { StoreProvider } from "../src/state/store";
import { STORAGE_KEY } from "../src/lib/storage";
import { exportToString, validateImport } from "../src/lib/io";
import { sanitizeState } from "../src/lib/storage";

function renderApp(entry = "/") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe("learner journey", () => {
  it("completes the full loop and persists progress across a reload", async () => {
    const user = userEvent.setup();
    const view = renderApp();

    // 1. Onboarding: pick a goal
    expect(screen.getByRole("dialog", { name: /Welcome to QABrew/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Learn QA fundamentals/ }));
    await user.click(screen.getByRole("button", { name: /Start: Learn QA fundamentals/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // 2. Open a module and complete a lesson
    await user.click(screen.getByRole("link", { name: /Open lesson/ }));
    // The lesson route is lazy - wait for a control that only exists on the lesson page
    await user.click(await screen.findByRole("button", { name: /Mark lesson complete/ }));
    expect(await screen.findByText(/Lesson completed/)).toBeInTheDocument();

    // 3. Answer a quiz question in practice mode and read the explanation
    await user.click(screen.getByRole("link", { name: "Quizzes" }));
    await user.click((await screen.findAllByRole("link", { name: /^Start$/ }))[0]);
    await user.click(await screen.findByRole("button", { name: /Practice/ }));
    const options = document.querySelectorAll("button.quiz-option");
    expect(options.length).toBeGreaterThanOrEqual(3);
    await user.click(options[1]);
    await user.click(screen.getByRole("button", { name: /^Answer$/ }));
    expect(await screen.findByText(/^(Correct|Incorrect)\./)).toBeInTheDocument();
    // The explanation shows why distractors are wrong or why the answer is right
    expect(document.querySelector(".explain-box")).toBeTruthy();

    // 4. Review a concept card: flip, then rate recall
    await user.click(screen.getAllByRole("link", { name: /Review/ })[0]);
    const flip = await screen.findByRole("button", { name: /Reveal answer/i });
    await user.click(flip);
    const good = screen.getByRole("button", { name: /Good/ });
    await user.click(good);
    expect(await screen.findByText(/1 reviewed this session/)).toBeInTheDocument();

    // 5. Play a minigame round (Boundary Hunter, round 1 = 3-point BVA)
    await user.click(screen.getByRole("link", { name: "Minigames" }));
    await user.click((await screen.findAllByRole("link", { name: "Play" }))[0]);
    // Select the complete 3-point set for 1.00-10,000.00: 1.00, 1.01, 5000.50, 9999.99, 10000.00
    for (const v of ["1.00", "1.01", "5000.50", "9999.99", "10000.00"]) {
      await user.click(screen.getByRole("button", { name: new RegExp(`^${v.replace(".", "\\.")}$`) }));
    }
    await user.click(screen.getByRole("button", { name: /Submit values/ }));
    expect(await screen.findByText(/5\/5 points/)).toBeInTheDocument();
    expect(screen.getByText(/Complete set - nothing missed/)).toBeInTheDocument();

    // 6. Sandbox: log in, make a transfer, observe the planted confirmation defect, file a report
    await user.click(screen.getByRole("link", { name: "Bug sandbox" }));
    await user.type(await screen.findByLabelText("Password"), "Sandbox123!");
    await user.click(screen.getByRole("button", { name: /Sign in/ }));
    await user.click(screen.getByRole("tab", { name: "Transfer" }));
    await user.click(screen.getByRole("button", { name: /Submit transfer/ }));
    expect(await screen.findByText(/250 EUR to account \*+3344/)).toBeInTheDocument(); // defect D5: truncated amount
    await user.click(screen.getByRole("tab", { name: /My defect reports/ }));
    await user.type(screen.getByLabelText("Title"), "[Transfer] Confirmation truncates amount to whole euros");
    await user.selectOptions(screen.getByLabelText(/Spec reference/), "S5");
    await user.type(screen.getByLabelText("Preconditions"), "Signed in as demo");
    await user.type(
      screen.getByLabelText("Reproduction steps"),
      "1) Open Transfer 2) Select payee Landlord 3) Enter 250.75 4) Submit",
    );
    await user.type(screen.getByLabelText(/Expected result/), "Per S5: confirmation shows the exact submitted amount 250.75");
    await user.type(screen.getByLabelText(/Actual result/), "Confirmation shows 250 EUR; history shows the correct 250.75 debit");
    await user.type(screen.getByLabelText(/Severity\/priority rationale/), "Major: customer-visible wrong amount on money confirmation; medium: correct ledger mitigates");
    await user.click(screen.getByRole("button", { name: /Submit report/ }));
    expect(await screen.findByText(/Filed reports \(1\)/)).toBeInTheDocument();

    // 7. Reload: fresh render over the same localStorage
    const persisted = localStorage.getItem(STORAGE_KEY);
    expect(persisted).toBeTruthy();
    const parsed = JSON.parse(persisted!);
    expect(parsed.lessons["a-l1"]).toBeDefined();
    expect(Object.keys(parsed.cards).length).toBe(1);
    expect(parsed.sandboxReports.length).toBe(1);

    // 8. Export/import round trip of the real persisted state
    const envelope = JSON.parse(exportToString(sanitizeState(parsed)));
    expect(envelope.app).toBe("qa-lab");
    const backIn = validateImport(JSON.stringify(envelope));
    expect(backIn.ok).toBe(true);
    expect(backIn.data!.sandboxReports[0].specRef).toBe("S5");

    // Re-render the app fresh: progress is visible without redoing anything
    view.unmount();
    renderApp();
    await user.click(screen.getAllByRole("link", { name: /Review/ })[0]);
    // The reviewed card is scheduled for tomorrow (rated Good): due count reflects remaining cards
    expect(await screen.findByText(/due now/)).toBeInTheDocument();
    // The card reviewed before the reload is in the schedule -> persistence survived the reload
    const scheduleRow = screen.getByText("In schedule (reviewed at least once)").closest("tr");
    expect(scheduleRow?.textContent).toMatch(/1/);
  }, 30000);
});
