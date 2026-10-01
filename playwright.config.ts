import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  // The final evidence spec has its own ordered runner because reconciliation
  // consumes manifests emitted by several other specs. The ordinary regression
  // suite must not race that dependency chain.
  testIgnore: process.env.ISSUE_157_FINAL ? undefined : '**/issue-157-final-evidence.spec.ts',
  outputDir: 'test-results',
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  retries: process.env.CI ? 1 : 0,
  reporter: 'line',
  expect: { timeout: 10_000 },
  timeout: 45_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : undefined,
  },
  webServer: {
    command: `VERCEL_ENV=production npm run build && npm run start -- -H 127.0.0.1 -p ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
