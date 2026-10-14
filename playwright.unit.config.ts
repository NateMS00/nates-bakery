import { defineConfig } from "@playwright/test";

// Unit tests for pure modules (no browser, no server): the import's quantity parser
// and grams table, and later the model-output reader.
// Run: npx playwright test --config playwright.unit.config.ts

export default defineConfig({
  testDir: "tests/unit",
  outputDir: "test-results-unit",
  reporter: [["list"]],
  projects: [{ name: "unit" }],
});
