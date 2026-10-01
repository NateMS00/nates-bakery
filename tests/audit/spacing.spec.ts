import { test } from "@playwright/test";
import { writeFileSync } from "node:fs";

// WCAG 1.4.12 Text Spacing: line height 1.5, paragraph spacing 2em, letter 0.12em,
// word 0.16em, with nothing cut off. Lists elements whose text no longer fits.
const CSS = "*{line-height:1.5!important;letter-spacing:0.12em!important;word-spacing:0.16em!important}p{margin-bottom:2em!important}";
const PAGES = ["/recipes", "/recipes/pasteis-de-nata", "/recipes/pasteis-de-nata/bake?scale=1&step=1", "/recipes/pasteis-de-nata/log", "/import/d-canele", "/login"];

test("text spacing", async ({ page, context }, info) => {
  test.skip(!["390-light", "1440-light"].includes(info.project.name));
  await context.addCookies([{ name: "backery_fixture_ns", value: `audit-spacing-${info.project.name}`, url: "http://localhost:3100" }]);
  const out: Record<string, string[]> = {};
  for (const path of PAGES) {
    await page.goto(path);
    await page.locator("h1").first().waitFor();
    await page.addStyleTag({ content: CSS });
    await page.waitForTimeout(200);
    out[path] = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => {
          if (el.closest(".sr-only, [aria-hidden=true]") || !el.textContent?.trim()) return false;
          const s = getComputedStyle(el);
          const clips = ["hidden", "clip"].includes(s.overflowX) || ["hidden", "clip"].includes(s.overflowY) || s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none";
          return clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
        })
        .map((el) => `${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 40)}" ${el.scrollWidth}×${el.scrollHeight} in ${el.clientWidth}×${el.clientHeight}`)
        .slice(0, 12),
    );
    await page.screenshot({ path: `audit-results/${info.project.name}/_spacing${path.replace(/[/?=&]/g, "_")}.png`, fullPage: false });
  }
  writeFileSync(`audit-results/_spacing-${info.project.name}.json`, JSON.stringify(out, null, 2));
});
