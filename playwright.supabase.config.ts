import { defineConfig } from "@playwright/test";

// Database checks (no browser): the shared-recipe function's fields from the migration
// files, and, with the Supabase env vars set, the live project as an anonymous visitor.
// Run: npx playwright test --config playwright.supabase.config.ts

export default defineConfig({
  testDir: "tests/supabase",
  outputDir: "test-results-supabase",
  reporter: [["list"]],
  projects: [{ name: "supabase" }],
});
