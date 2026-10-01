import { test } from "@playwright/test";
import { writeFileSync } from "node:fs";

// WCAG 1.4.10 Reflow: content at 320 CSS px wide without horizontal scrolling.
const PAGES = ["/recipes", "/recipes/pasteis-de-nata", "/recipes/cultured-butter-croissants", "/recipes/pasteis-de-nata/edit", "/recipes/new", "/import", "/import/d-canele",
  "/recipes/pasteis-de-nata/bake?scale=1&step=1", "/recipes/cultured-butter-croissants/bake?scale=1&step=3", "/recipes/pasteis-de-nata/log", "/recipes/pasteis-de-nata/log?new=1", "/r/nata-k7p2qw", "/privacy"];

test("reflow at 320px", async ({ browser }, info) => {
  test.skip(info.project.name !== "390-light");
  const context = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await context.addCookies([{ name: "backery_fixture_ns", value: "audit-reflow", url: "http://localhost:3100" }]);
  const page = await context.newPage();
  const out: Record<string, unknown> = {};
  for (const path of PAGES) {
    await page.goto(`http://localhost:3100${path}`);
    await page.locator("h1").first().waitFor();
    await page.waitForTimeout(300);
    out[path] = await page.evaluate(() => {
      const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll<HTMLElement>("main *, dialog *")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && !el.closest(".sr-only");
      }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ").slice(0, 3).join(".")} "${(el.textContent ?? "").trim().slice(0, 30)}" right=${Math.round(el.getBoundingClientRect().right)}`);
      return { over, wide };
    });
    await page.screenshot({ path: `audit-results/320${path.replace(/[/?=&]/g, "_")}.png` });
  }
  writeFileSync("audit-results/_reflow-320.json", JSON.stringify(out, null, 2));
  await context.close();
});
