import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Accessibility and responsive audit (PROMPTS.md step 9): every page and overlay at
// 390, 768, and 1440 in light and dark. Collects findings into audit-results/ rather
// than failing, so the report can be reviewed before anything is fixed.
// Run: npx playwright test --config playwright.audit.config.ts

const phone = { width: 390, height: 844 };
export default defineConfig({
  ...base,
  testDir: "tests/audit",
  outputDir: "test-results-audit",
  projects: [
    { name: "390-light", use: { viewport: phone, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "light" } },
    { name: "390-dark", use: { viewport: phone, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark" } },
    { name: "768-light", use: { viewport: { width: 768, height: 1024 }, hasTouch: true, colorScheme: "light" } },
    { name: "768-dark", use: { viewport: { width: 768, height: 1024 }, hasTouch: true, colorScheme: "dark" } },
    { name: "1440-light", use: { viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
    { name: "1440-dark", use: { viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
  ],
});
