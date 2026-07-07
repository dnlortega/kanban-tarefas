import { defineConfig, devices } from "@playwright/test";

try {
  process.loadEnvFile(".env");
} catch {}
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  testDir: "./tests",
  // This app has a single shared Kanban board and jukebox queue (no
  // per-test isolation), so tests must run one at a time or they'll
  // collide on the same global state.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  // The DB is a remote Neon Postgres instance, so occasional latency
  // spikes are real network variance, not app bugs — one retry absorbs those.
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60000,
  },
});
