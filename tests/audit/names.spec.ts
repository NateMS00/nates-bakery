import { test } from "@playwright/test";
import { writeFileSync } from "node:fs";

// Accessible names as the browser computes them (the accessibility tree), for the audit.
test("accessible names", async ({ page }, info) => {
  test.skip(info.project.name !== "390-light");
  const out: Record<string, unknown> = {};
  await page.goto("/recipes");
  await page.getByRole("heading", { level: 1, name: "Library" }).waitFor();
  out.libraryLinks = (await page.locator("main").ariaSnapshot()).split("\n").filter((l) => l.includes("link")).slice(0, 8);
  await page.goto("/recipes/pasteis-de-nata");
  await page.getByRole("heading", { level: 1 }).waitFor();
  out.converted = await page.locator("button", { hasText: "Converted" }).first().evaluate((b) => {
    const r = b.getBoundingClientRect();
    const before = getComputedStyle(b, "::before");
    return { box: [Math.round(r.width), Math.round(r.height)], before: { content: before.content, height: before.height, width: before.width, inset: before.inset } };
  });
  out.recipeHeader = (await page.locator("main").ariaSnapshot()).split("\n").slice(0, 22);
  await page.goto("/recipes/pasteis-de-nata/bake?scale=1&step=1");
  await page.getByRole("heading", { level: 1 }).waitFor();
  out.bake = (await page.locator("body").ariaSnapshot()).split("\n").slice(0, 30);
  writeFileSync("audit-results/_names.json", JSON.stringify(out, null, 2));
});
