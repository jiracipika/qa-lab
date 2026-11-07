import { defineConfig, devices } from "@playwright/test";

/**
 * Real-browser smoke suite. Runs against the production build served by
 * `vite preview` (SPA fallback included). Local and CI-agnostic by design:
 * the deployment's GitHub token cannot push workflow files, so wiring this
 * into repository CI waits for a workflow-scoped token.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4174",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4174 --strictPort",
    port: 4174,
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
});
