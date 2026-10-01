import { test, type Page } from "@playwright/test";

// Screenshots for the audit report: each open finding, highlighted.
const mark = (page: Page, selector: string) =>
  page.addStyleTag({ content: `${selector}{outline:3px dashed #D7263D!important;outline-offset:2px!important}` });

test("finding screenshots", async ({ page, context }, info) => {
  await context.addCookies([{ name: "backery_fixture_ns", value: `audit-findings-${info.project.name}`, url: "http://localhost:3100" }]);
  const dir = `audit-results/findings/${info.project.name}`;
  // F2: the Scale control at tablet width.
  if (info.project.name.startsWith("768")) {
    for (const path of ["/recipes/pasteis-de-nata", "/r/nata-k7p2qw"]) {
      await page.goto(path);
      await page.locator("h1").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await mark(page, '[role=group][aria-label="Batch size"]');
      const box = (await page.locator('[role=group][aria-label="Batch size"]').boundingBox())!;
      await page.screenshot({ path: `${dir}/scale${path.startsWith("/r/") ? "-shared" : ""}.png`, clip: { x: 0, y: box.y - 90, width: 768, height: 220 } });
    }
  }
  // F3: Watch reel, a 20px-tall link.
  await page.goto("/recipes/pasteis-de-nata");
  await page.locator("h1").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await mark(page, 'a[href^="https://www.instagram.com"]');
  const reel = (await page.locator('a[href^="https://www.instagram.com"]').first().boundingBox())!;
  const vw = page.viewportSize()!.width;
  await page.screenshot({ path: `${dir}/watch-reel.png`, clip: { x: 0, y: Math.max(0, reel.y - 140), width: Math.min(vw, 760), height: 240 } });
});
