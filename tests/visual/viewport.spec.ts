import { expect, test, type Page } from "@playwright/test";
import { capture } from "./helpers";

// Bottom-pinned UI follows the visible area (components/system/ViewportVars.tsx), not the
// layout viewport. Chrome can't show Safari's toolbar or a real keyboard, so these tests
// shrink a stand-in visualViewport the way iOS does and check that sheets, bars, and the
// full-screen log form stay inside what's visible. Mobile projects only.

const shot = (page: Page, name: string) => capture(page, "viewport", name);

/** Replaces window.visualViewport with one the test controls: `__setVisible(height, top)`. */
async function fakeVisualViewport(page: Page) {
  await page.addInitScript(() => {
    const target = new EventTarget() as EventTarget & { height: number; offsetTop: number; width: number };
    target.height = window.innerHeight;
    target.offsetTop = 0;
    target.width = window.innerWidth;
    Object.defineProperty(window, "visualViewport", { value: target, configurable: true });
    (window as unknown as { __setVisible: (h: number, top?: number) => void }).__setVisible = (h, top = 0) => {
      target.height = h;
      target.offsetTop = top;
      target.dispatchEvent(new Event("resize"));
    };
  });
}
const setVisible = (page: Page, height: number, top = 0) =>
  page.evaluate(([h, t]) => (window as unknown as { __setVisible: (h: number, t: number) => void }).__setVisible(h, t), [height, top]);

/** Bottom edge of the visible area: the layout viewport minus what Safari's toolbar covers. */
const TOOLBAR = 84;
const KEYBOARD = 340;

test.beforeEach(async ({ context, page }, info) => {
  test.skip(!info.project.use.isMobile, "phones only");
  await context.addCookies([{ name: "backery_fixture_ns", value: `${info.project.name}-${info.testId}`, url: "http://localhost:3100" }]);
  await fakeVisualViewport(page);
});

test("rating sheet: Skip stays visible above Safari's toolbar", async ({ page }) => {
  await page.goto("/recipes/brown-butter-cookies");
  await page.getByRole("heading", { level: 1 }).waitFor();
  const visible = 844 - TOOLBAR;
  await setVisible(page, visible);
  await page.getByRole("button", { name: "Mark as baked" }).click();
  const sheet = page.getByRole("dialog", { name: "How was it?" });
  await expect(sheet).toBeVisible();
  await page.waitForTimeout(400);
  const [box, skip] = await Promise.all([sheet.boundingBox(), sheet.getByRole("button", { name: "Skip" }).boundingBox()]);
  expect(Math.abs(box!.y + box!.height - visible)).toBeLessThan(1.5); // the sheet ends where the visible area ends
  expect(skip!.y + skip!.height).toBeLessThanOrEqual(visible);
  await shot(page, "01-rating-above-toolbar");
});

test("action bars and Bake Mode's step nav sit above the toolbar", async ({ page }) => {
  const visible = 844 - TOOLBAR;
  for (const [path, name] of [
    ["/recipes/pasteis-de-nata", "Start baking"],
    ["/recipes", "Import from a reel"],
    ["/recipes/pasteis-de-nata/log", "Log a bake"],
    ["/recipes/pasteis-de-nata/bake?scale=1&step=1", "Next step"],
  ] as const) {
    await page.goto(path);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await setVisible(page, visible);
    await page.waitForTimeout(100);
    const action = page.getByRole(name === "Next step" ? "button" : "link", { name, exact: true }).last();
    const box = (await action.boundingBox())!;
    expect(box.y + box.height, path).toBeLessThanOrEqual(visible);
    expect(box.y + box.height, path).toBeGreaterThan(visible - 80); // still pinned to the bottom
  }
});

test("log form: Save sits just above the keyboard and the focused field scrolls into view", async ({ page }) => {
  await page.goto("/recipes/pasteis-de-nata/log?new=1");
  const form = page.getByRole("dialog", { name: "Log a bake" });
  await expect(form).toBeVisible();
  const result = form.getByLabel("How it turned out");
  await result.focus();
  // iOS: the keyboard shrinks the visual viewport and pans it down a little.
  const visible = 844 - KEYBOARD;
  await setVisible(page, visible, 0);
  await page.waitForTimeout(300);
  const [sheet, save, field] = await Promise.all([form.boundingBox(), form.getByRole("button", { name: "Save" }).boundingBox(), result.boundingBox()]);
  expect(sheet!.y).toBeGreaterThanOrEqual(-0.5);
  expect(Math.abs(sheet!.y + sheet!.height - visible)).toBeLessThan(1.5); // the form fits the visible area
  expect(save!.y + save!.height).toBeLessThanOrEqual(visible); // Save just above the keyboard
  expect(save!.y + save!.height).toBeGreaterThan(visible - 80);
  expect(field!.y + field!.height).toBeLessThanOrEqual(save!.y); // the field is above the footer
  expect(field!.y).toBeGreaterThanOrEqual(sheet!.y);
  await shot(page, "02-log-form-keyboard");

  // The keyboard closes: the form fills the screen again.
  await setVisible(page, 844);
  await page.waitForTimeout(150);
  expect(Math.round((await form.boundingBox())!.height)).toBe(844);
});

test("while the keyboard is open, a page's action bar steps aside", async ({ page }) => {
  await page.goto("/recipes");
  await page.getByRole("heading", { level: 1 }).waitFor();
  const bar = page.getByRole("link", { name: "Import from a reel", exact: true }).last();
  await expect(bar).toBeVisible();
  await page.getByLabel("Search", { exact: true }).focus();
  await setVisible(page, 844 - KEYBOARD);
  await expect(bar).toBeHidden();
  await setVisible(page, 844);
  await expect(bar).toBeVisible();
});
