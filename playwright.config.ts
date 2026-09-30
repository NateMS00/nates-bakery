import { defineConfig } from "@playwright/test";

// Renders pages at SKIN's primary widths (390 iPhone, 1440 desktop) in light and dark.
// Uses the installed Google Chrome: Playwright no longer ships Chromium for macOS 12.
// Two servers: one normal, one with simulated fixture latency for the Loading state.

export default defineConfig({
  testDir: "tests/visual",
  outputDir: "test-results",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { channel: "chrome", baseURL: "http://localhost:3100" },
  webServer: [
    { command: "npx next start -p 3100", port: 3100, reuseExistingServer: true },
    {
      command: "npx next start -p 3101",
      port: 3101,
      reuseExistingServer: true,
      env: { BACKERY_FIXTURE_DELAY_MS: "4000" },
    },
  ],
  projects: [
    { name: "mobile-light", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "light" } },
    { name: "mobile-dark", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark" } },
    { name: "desktop-light", use: { viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
    { name: "desktop-dark", use: { viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
  ],
});
