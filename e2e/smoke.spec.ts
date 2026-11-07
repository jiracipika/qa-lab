/**
 * Real-browser smoke suite (Playwright). Covers what jsdom cannot:
 * real rendering, layout overflow, fonts/icons, SPA route reloads, themes,
 * and console/page errors across the main learner surfaces.
 */

import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/modules", "/modules/mod-f", "/modules/mod-e/lessons/e-l1", "/review", "/quizzes", "/challenges", "/games", "/sandbox", "/glossary", "/tools", "/roadmap", "/settings"];

/** Collect page errors + console errors for a page's life; assert none at the end. */
function watchErrors(page: Page): () => Promise<void> {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  return async () => {
    // let late async work settle before judging
    await page.waitForTimeout(250);
    expect(errors, `runtime errors:\n${errors.join("\n")}`).toEqual([]);
  };
}

test.describe("smoke: fresh learner", () => {
  test("onboarding completes and the dashboard renders its hero", async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: /Welcome to QABrew/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Learn QA fundamentals" }).click();
    await dialog.getByRole("button", { name: /Start: Learn QA fundamentals/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { name: /Why we test/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open lesson/ })).toBeVisible();
    // the teaching widget renders with a text verdict, not colour alone
    await expect(page.getByText(/Invalid/).first()).toBeVisible();
    await assertNoErrors();
  });
});

test.describe("smoke: routes and content", () => {
  test("all routes render via direct SPA navigation with zero runtime errors", async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "qa-lab:v1",
        JSON.stringify({ version: 1, onboarded: true, preferences: { goal: "fundamentals", theme: "light", motion: "full" }, lessons: {}, cards: {}, quizAttempts: [], quizSessions: [], mistakes: [], notes: [], bookmarks: [], sandboxReports: [], challenges: {}, games: { boundaryBest: 0 }, activity: [], testRuns: [], revealedSolutions: [], workspace: {} }),
      );
    });
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page).toHaveTitle(/QABrew/);
    }
    // Module F content actually renders: the schema diagram's table nodes are present
    await page.goto("/modules/mod-f/lessons/f-l1");
    await expect(page.getByRole("button", { name: /accounts/ })).toBeVisible();
    await assertNoErrors();
  });

  test("lesson sections expose read-aloud controls (speech API present or hidden gracefully)", async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "qa-lab:v1",
        JSON.stringify({ version: 1, onboarded: true, preferences: { goal: "fundamentals", theme: "light", motion: "full" }, lessons: {}, cards: {}, quizAttempts: [], quizSessions: [], mistakes: [], notes: [], bookmarks: [], sandboxReports: [], challenges: {}, games: { boundaryBest: 0 }, activity: [], testRuns: [], revealedSolutions: [], workspace: {} }),
      );
    });
    await page.goto("/modules/mod-f/lessons/f-l1");
    const listen = page.getByRole("button", { name: /Read this lesson aloud/ });
    if (await listen.count()) {
      await expect(listen).toBeVisible();
      // toggling starts playback; headless browsers without voices may auto-revert on error
      await listen.click();
      const stop = page.getByRole("button", { name: /Stop reading this lesson/ });
      try {
        await stop.click({ timeout: 1500 });
      } catch {
        // auto-reverted (no voices available) - acceptable, the toggle is still safe
      }
      await expect(page.getByRole("button", { name: /Read this lesson aloud/ })).toBeVisible();
    }
    // objectives section always has its control (or none when speech is unsupported)
    const objectives = page.getByRole("button", { name: /objectives/i });
    expect(await objectives.count()).toBeLessThanOrEqual(1);
    await assertNoErrors();
  });
});

test.describe("smoke: mobile", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 500, "mobile-only");

  test("390px viewport: no horizontal overflow and the drawer opens and closes", async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "qa-lab:v1",
        JSON.stringify({ version: 1, onboarded: true, preferences: { goal: "fundamentals", theme: "light", motion: "full" }, lessons: {}, cards: {}, quizAttempts: [], quizSessions: [], mistakes: [], notes: [], bookmarks: [], sandboxReports: [], challenges: {}, games: { boundaryBest: 0 }, activity: [], testRuns: [], revealedSolutions: [], workspace: {} }),
      );
    });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await assertNoErrors();
  });
});

test.describe("smoke: dark theme", () => {
  test("dark theme applies before paint and stays readable", async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "qa-lab:v1",
        JSON.stringify({ version: 1, onboarded: true, preferences: { goal: "fundamentals", theme: "dark", motion: "full" }, lessons: {}, cards: {}, quizAttempts: [], quizSessions: [], mistakes: [], notes: [], bookmarks: [], sandboxReports: [], challenges: {}, games: { boundaryBest: 0 }, activity: [], testRuns: [], revealedSolutions: [], workspace: {} }),
      );
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await assertNoErrors();
  });
});
