import { expect, test, type Page } from "@playwright/test";
import { capture, phoneWebKit } from "./helpers";

// Bottom-pinned UI follows the visible area (components/system/ViewportVars.tsx), not the
// layout viewport. Chrome can't show Safari's toolbar or a real keyboard, so these tests
// shrink a stand-in visualViewport the way iOS does and check that sheets, bars, and the
// full-screen log form stay inside what's visible. Mobile projects only.

const shot = (page: Page, name: string) => capture(page, "viewport", name);

/** Replaces window.visualViewport with one the test controls: `__setVisible(height, top)`. */
async function fakeVisualViewport(page: Page) {
  await page.addInitScript(() => {
    // Until a test sets a size, it reports the live window (read on each access: at init
    // time the mobile viewport isn't applied yet, and innerHeight is still 2121).
    let set: { height: number; offsetTop: number } | null = null;
    const target = new EventTarget();
    Object.defineProperties(target, {
      height: { get: () => set?.height ?? window.innerHeight },
      offsetTop: { get: () => set?.offsetTop ?? 0 },
      width: { get: () => window.innerWidth },
      pageTop: { get: () => window.scrollY + (set?.offsetTop ?? 0) },
    });
    Object.defineProperty(window, "visualViewport", { value: target, configurable: true });
    (window as unknown as { __setVisible: (h: number, top?: number) => void }).__setVisible = (h, top = 0) => {
      set = { height: h, offsetTop: top };
      target.dispatchEvent(new Event("resize"));
    };
  });
}
const setVisible = (page: Page, height: number, top = 0) =>
  page.evaluate(([h, t]) => (window as unknown as { __setVisible: (h: number, t: number) => void }).__setVisible(h, t), [height, top]);

/**
 * The sheet is as tall as its content (handle, header, body, footer), so nothing is clipped
 * by its own height. Safari once sized it from its insets instead (118px, cutting off Skip).
 */
async function expectContentHeight(page: Page, name: string) {
  const sheet = page.getByRole("dialog", { name });
  const { height, content, lastBottom, bottom } = await sheet.evaluate((d) => {
    const parts = [...d.children] as HTMLElement[];
    const body = parts.find((el) => el.className.includes("overflow-y-auto"))!;
    const content = parts.reduce((sum, el) => sum + (el === body ? body.scrollHeight : el.offsetHeight), 0);
    const last = (body.lastElementChild as HTMLElement).getBoundingClientRect();
    return { height: d.getBoundingClientRect().height, content, lastBottom: last.bottom, bottom: d.getBoundingClientRect().bottom };
  });
  expect(Math.abs(height - content), `${name}: sheet ${height}px, content ${content}px`).toBeLessThan(1.5);
  expect(lastBottom).toBeLessThanOrEqual(bottom);
  // Chrome sizes `height: fit-content` from the content no matter what, so measuring alone
  // can't catch Safari's bug. Check the declared values (CSS Typed OM keeps keywords):
  // height must be auto and bottom auto, so only `top` and the content decide the box.
  const declared = await sheet.evaluate((d) => {
    const map = d.computedStyleMap();
    return { height: String(map.get("height")), bottom: String(map.get("bottom")) };
  });
  expect(declared, `${name}: declared height and bottom`).toEqual({ height: "auto", bottom: "auto" });
}

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
  await expectContentHeight(page, "How was it?");
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
  // iOS: the keyboard slides in over several resizes, after focus has already landed.
  await page.waitForTimeout(150);
  const visible = 844 - KEYBOARD;
  for (const step of [844 - 120, 844 - 260, visible]) {
    await setVisible(page, step, 0);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(700);
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

// Safari with the toolbar collapsed reported innerHeight 754 and visualViewport.height 754,
// but the page area a sheet is positioned against was 714 tall (documentElement.clientHeight).
// Reproduced here with a visible area taller than the layout viewport: sheets must still
// take their content's height, whatever their insets work out to.
test("sheets take their content's height when the visible area is taller than the layout viewport", async ({ page }) => {
  const taller = 844 + 40;
  await page.goto("/recipes/brown-butter-cookies");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await setVisible(page, taller);
  await page.getByRole("button", { name: "Mark as baked" }).click();
  await expect(page.getByRole("dialog", { name: "How was it?" })).toBeVisible();
  await page.waitForTimeout(400);
  await expectContentHeight(page, "How was it?");

  await page.goto("/recipes/pasteis-de-nata/log");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await setVisible(page, taller);
  await page.getByRole("button", { name: "More actions, Sat 26 Sep bake" }).click();
  await expect(page.getByRole("dialog", { name: "Sat 26 Sep bake" })).toBeVisible();
  await page.waitForTimeout(400);
  await expectContentHeight(page, "Sat 26 Sep bake");
});

const ring = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { name: el.getAttribute("aria-label") || el.textContent?.trim() || el.tagName, outline: s.outlineStyle === "none" ? "none" : s.outlineWidth };
  });

test("after a tap, focus moves into and out of sheets without a ring; Tab brings it back", async ({ page }) => {
  await page.goto("/recipes/brown-butter-cookies");
  await page.getByRole("heading", { level: 1 }).waitFor();
  const mark = page.getByRole("button", { name: "Mark as baked" });
  await mark.tap();
  const sheet = page.getByRole("dialog", { name: "How was it?" });
  await expect(sheet.getByRole("radio", { name: "Rate 1 out of 5" })).toBeFocused();
  expect(await ring(page)).toEqual({ name: "Rate 1 out of 5", outline: "none" });
  if (!phoneWebKit()) {
    // Keyboard Tab doesn't reach buttons in iPhone-sized WebKit (helpers.ts).
    await page.keyboard.press("Tab");
    expect((await ring(page)).outline).toBe("3px");
  }
  await sheet.getByRole("button", { name: "Skip" }).tap();
  await expect(mark).toBeFocused();
  expect(await ring(page)).toEqual({ name: "Mark as baked", outline: "none" });
});

test("entry menu sheet: focus starts on the first action, not the close X", async ({ page }) => {
  await page.goto("/recipes/pasteis-de-nata/log");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.getByRole("button", { name: "More actions, Sat 26 Sep bake" }).tap();
  const sheet = page.getByRole("dialog", { name: "Sat 26 Sep bake" });
  await expect(sheet.getByRole("menuitem", { name: "Edit" })).toBeFocused();
  expect((await ring(page)).outline).toBe("none");
});
