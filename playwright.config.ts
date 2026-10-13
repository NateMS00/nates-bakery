import { defineConfig, devices } from "@playwright/test";

// Renders pages at SKIN's primary widths (390 iPhone, 1440 desktop) in light and dark,
// in Playwright's own Chromium, plus WebKit at iPhone size (mobile-webkit) for
// Safari-style bugs. Browsers: npx playwright install chromium webkit.
// Servers: normal (3100), simulated latency for Loading states (3101), the Library's
// empty cases: no recipes or drafts (3102), only drafts (3103), and Import turned off,
// as production starts (3104, and 3105 with an empty Library).

export default defineConfig({
  testDir: "tests/visual",
  outputDir: "test-results",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100" },
  // Every server runs on the fixtures backend (lib/backend), never Supabase.
  webServer: [
    { command: "npx next start -p 3100", port: 3100, reuseExistingServer: true, env: { BACKERY_BACKEND: "fixtures", BACKERY_FEATURE_IMPORT: "on" } },
    {
      command: "npx next start -p 3101",
      port: 3101,
      reuseExistingServer: true,
      env: { BACKERY_BACKEND: "fixtures", BACKERY_FEATURE_IMPORT: "on", BACKERY_FIXTURE_DELAY_MS: "4000" },
    },
    { command: "npx next start -p 3102", port: 3102, reuseExistingServer: true, env: { BACKERY_BACKEND: "fixtures", BACKERY_FEATURE_IMPORT: "on", BACKERY_FIXTURE_SET: "empty" } },
    { command: "npx next start -p 3103", port: 3103, reuseExistingServer: true, env: { BACKERY_BACKEND: "fixtures", BACKERY_FEATURE_IMPORT: "on", BACKERY_FIXTURE_SET: "only-drafts" } },
    // As production starts: Import off (lib/features.ts), with fixtures and with an empty Library.
    { command: "npx next start -p 3104", port: 3104, reuseExistingServer: true, env: { BACKERY_BACKEND: "fixtures" } },
    { command: "npx next start -p 3105", port: 3105, reuseExistingServer: true, env: { BACKERY_BACKEND: "fixtures", BACKERY_FIXTURE_SET: "empty" } },
  ],
  projects: [
    { name: "mobile-light", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "light" } },
    { name: "mobile-dark", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark" } },
    { name: "desktop-light", use: { viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
    { name: "desktop-dark", use: { viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
    // Safari's engine with an iPhone's user agent, at the same size as the phone projects.
    { name: "mobile-webkit", use: { ...devices["iPhone 13"], browserName: "webkit", viewport: { width: 390, height: 844 }, colorScheme: "light" } },
  ],
});
