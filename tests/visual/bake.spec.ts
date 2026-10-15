import { expect, test, type Page } from "@playwright/test";
import { capture, expectDestructiveConfirmation, expectFocusRings, expectTouchTargets } from "./helpers";

// /recipes/:recipeId/bake (Bake Mode), BONES-recipes-bake.md, Focus shell. The wake lock
// is stubbed as granted (headless Chrome refuses it) except in the test that checks the
// refusal notice. Timers use Playwright's clock to reach zero without waiting.

const NATA = "/recipes/pasteis-de-nata/bake";
const CROISSANTS = "/recipes/cultured-butter-croissants/bake";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "bake", name, fullPage);
const mobile = () => Boolean(test.info().project.use.isMobile);
const next = (page: Page) => page.getByRole("button", { name: "Next step" });
const heading = (page: Page) => page.getByRole("heading", { level: 1 });

test.beforeEach(async ({ page }, info) => {
  if (!info.title.includes("screen may lock")) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "wakeLock", { value: { request: async () => ({ release: async () => {}, addEventListener() {} }) } });
    });
  }
});

async function open(page: Page, path: string) {
  await page.goto(path);
  await heading(page).waitFor();
  await expect(page.getByRole("status").filter({ hasText: /^Loading / })).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

test("step 1: first viewport, notices, and page checks", async ({ page }) => {
  await open(page, `${NATA}?scale=1.5`);
  await expect(page).toHaveURL(/scale=1\.5&step=1$/); // the URL is completed with ?step=1
  await expect(heading(page)).toHaveText(/Step 1$/);
  await expect(page.getByText("Some amounts are estimates.")).toBeVisible();
  // The Timer alerts card waits for the first timer (BONES 1.2.0): step 1 opens with one notice.
  await expect(page.getByText("Get alerts when your phone is locked.")).toHaveCount(0);
  await expect(heading(page)).toHaveText("Pastry · Step 1");
  const counter = page.locator("header p").last();
  await expect(counter).toContainText("1.5×");
  await expect(counter).toContainText(mobile() ? "1/8" : "Step 1 of 8");
  // For this step: scaled grams (flour 250 g × 1.5).
  await expect(page.locator("li", { hasText: "Plain flour" }).first()).toContainText("375");
  // All ingredients is open on step 1, for weighing everything out.
  await expect(page.getByRole("checkbox", { name: /Egg yolks/ })).toBeVisible();
  await shot(page, "01-step-1");
  await shot(page, "02-step-1-full", true);

  // Focus shell: one h1, header and main, no footer, no primary navigation.
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await expectTouchTargets(page);
  // Step nav: 64px targets (SKIN touch-bake); Previous hidden on step 1.
  expect((await next(page).boundingBox())!.height).toBeGreaterThanOrEqual(64);
  await expect(page.getByRole("button", { name: "Previous" })).toHaveCount(0);
  // Nothing is covered by the pinned bar at the end of the page.
  const covered = await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const last = document.querySelector("main")!.getBoundingClientRect().bottom - parseFloat(getComputedStyle(document.querySelector("main")!).paddingBottom);
    const bar = document.querySelector("nav[aria-label=Steps]")!.parentElement!.getBoundingClientRect().top;
    return last - bar;
  });
  expect(covered).toBeLessThanOrEqual(1);
});

test("focus rings", async ({ page }) => {
  test.skip(mobile(), "keyboard focus checked on desktop");
  await open(page, NATA);
  await expectFocusRings(page, 8);
});

test("moving between steps writes ?step= and focuses the step heading", async ({ page }) => {
  await open(page, NATA);
  await next(page).click();
  await expect(page).toHaveURL(/step=2$/);
  await expect(heading(page)).toHaveText(/Step 2$/);
  await expect(heading(page)).toBeFocused();
  await expect(page.getByRole("button", { name: "Previous" })).toBeVisible();
  // Step 2 isn't step 1: the notices and the open ingredient list are gone.
  await expect(page.getByText("Some amounts are estimates.")).toHaveCount(0);
  if (mobile()) await expect(page.getByRole("button", { name: "All ingredients (10)" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(heading(page)).toHaveText(/Step 1$/);
  // A refresh keeps your place.
  await open(page, `${NATA}?step=5`);
  await expect(heading(page)).toHaveText(/Step 5$/);
  await expect(heading(page)).toHaveText("Custard · Step 5");
});

test("invalid step opens the nearest valid step", async ({ page }) => {
  await open(page, `${NATA}?step=99&scale=banana`);
  await expect(heading(page)).toHaveText(/Step 8$/);
  await expect(page).toHaveURL(new RegExp(`${NATA}\\?step=8$`));
  await open(page, `${NATA}?step=0`);
  await expect(heading(page)).toHaveText(/Step 1$/);
});

test("?step=tips on a recipe with no Tips group falls back to step 1", async ({ page }) => {
  await open(page, `${NATA}?step=tips`);
  await expect(heading(page)).toHaveText(/Step 1$/);
  await expect(page).toHaveURL(new RegExp(`${NATA}\\?step=1$`));
});

test("Tips screen: last numbered step offers Next: Tips; Tips is unnumbered, no timers, no For this step", async ({ page }) => {
  // croissants: 14 numbered steps, then Tips.
  await open(page, `${CROISSANTS}?step=14`);
  const counter = page.locator("header p").last();
  await expect(counter).toContainText(mobile() ? "14/14" : "Step 14 of 14");
  const toTips = page.getByRole("button", { name: "Next: Tips" });
  await expect(toTips).toBeVisible();
  await expect(page.getByRole("button", { name: "Next step" })).toHaveCount(0);

  await toTips.click();
  await expect(page).toHaveURL(new RegExp(`${CROISSANTS}\\?step=tips$`));
  await expect(heading(page)).toHaveText("Tips");
  await expect(counter).toContainText("Tips");
  await shot(page, "14-tips");

  // Both tips show, plain, with no step number, no "For this step", no timer buttons.
  await expect(page.getByText("Shape ahead and freeze unbaked")).toBeVisible();
  await expect(page.getByText("If the butter block cracks")).toBeVisible();
  await expect(page.getByText("For this step")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Start .* timer/ })).toHaveCount(0);

  // Finish replaces Next step; Previous still returns to the last numbered step.
  await expect(page.getByRole("button", { name: "Finish" })).toBeVisible();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(heading(page)).toHaveText(/Step 14$/);
});

test("Tips screen: a timer started earlier keeps running in the strip", async ({ page }) => {
  await open(page, `${CROISSANTS}?step=4`); // "Chill the butter block for 30 minutes"
  await page.getByRole("button", { name: "Start 30 min timer" }).click();
  await open(page, `${CROISSANTS}?step=tips`);
  await expect(page.getByText(/^(29|30):\d\d$/).filter({ visible: true }).first()).toBeVisible();
});

test("swipe left and right changes steps on touch screens", async ({ page }) => {
  test.skip(!mobile(), "touch only");
  await open(page, NATA);
  const swipe = (dx: number) =>
    page.locator("#step-heading").evaluate((el, d) => {
      const section = el.closest("section")!;
      const at = (type: string, x: number) => section.dispatchEvent(new PointerEvent(type, { pointerType: "touch", clientX: x, clientY: 300, bubbles: true }));
      at("pointerdown", 200);
      at("pointerup", 200 + d);
    }, dx);
  await swipe(-120);
  await expect(heading(page)).toHaveText(/Step 2$/);
  await swipe(120);
  await expect(heading(page)).toHaveText(/Step 1$/);
});

test("timers: start, run across steps, survive a refresh, pause, clear", async ({ page }) => {
  await open(page, NATA);
  const startButton = page.getByRole("button", { name: "Start 15 min timer" });
  await startButton.click();
  // The button becomes a live status (not a disabled button), so it can't start twice.
  await expect(page.getByRole("button", { name: "Start 15 min timer" })).toHaveCount(0);
  await expect(page.getByText(/^Running · 1[45]:\d\d$/)).toBeVisible();
  await expect(page.getByText("Get alerts when your phone is locked.")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "timer started" })).toHaveText("Step 1 · Pastry timer started, 15 minutes.");
  const row = page.getByText("Step 1 · Pastry").filter({ visible: true }).last();
  await expect(row).toBeVisible();
  await next(page).click();
  await expect(page.getByRole("button", { name: "Pause timer, Step 1 · Pastry" }).filter({ visible: true })).toBeVisible(); // still running on step 2
  await shot(page, "03-timer-running");

  await page.reload();
  await heading(page).waitFor();
  await expect(page.getByRole("button", { name: "Pause timer, Step 1 · Pastry" }).filter({ visible: true })).toBeVisible();
  const time = page.locator(".type-timer").filter({ visible: true }).first();
  await expect(time).toHaveText(/^1[45]:\d\d$/);

  await page.getByRole("button", { name: "Pause timer, Step 1 · Pastry" }).filter({ visible: true }).click();
  await expect(page.getByText("Paused", { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume timer, Step 1 · Pastry" }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Clear timer, Step 1 · Pastry" }).filter({ visible: true }).click();
  await expect(page.getByRole("button", { name: /Pause timer/ })).toHaveCount(0);
});

test("several timers: the mobile strip shows 2, then +n more", async ({ page }) => {
  await open(page, `${CROISSANTS}?step=2`);
  await page.getByRole("button", { name: "Start 6 min timer" }).click();
  await page.getByRole("button", { name: "Start 12 h timer" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Start 30 min timer" }).click();
  // Soonest first: 6 min, then 30 min; the 12 h proof sinks to the end.
  const order = page.getByRole("button", { name: /^Pause timer/ }).filter({ visible: true });
  await expect(order.first()).toHaveAccessibleName("Pause timer, Step\u00a02 · Dough · 6\u00a0min");
  await expect(order.nth(1)).toHaveAccessibleName("Pause timer, Step\u00a04 · Butter block");
  if (mobile()) {
    await expect(order).toHaveCount(2); // the 12 h timer is under "+1 more"
    const more = page.getByRole("button", { name: "+1 more" });
    await expect(more).toBeVisible();
    // Two timers take at most about a sixth of the screen.
    const rows = await page.getByRole("region", { name: "Timers" }).locator("ul").boundingBox();
    expect(rows!.height).toBeLessThanOrEqual(844 / 6 + 5);
    await shot(page, "04-several-timers");
    await more.click();
    await expect(page.getByRole("button", { name: /^Pause timer/ })).toHaveCount(3);
    // Two timers from one step are told apart by their duration.
    await expect(page.getByRole("button", { name: "Pause timer, Step\u00a02 · Dough · 6\u00a0min" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause timer, Step\u00a02 · Dough · 12\u00a0h" })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Timers" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Pause timer/ }).filter({ visible: true })).toHaveCount(3);
    await shot(page, "04-several-timers");
  }
});

test("timer finished: banner above everything until dismissed", async ({ page }) => {
  await page.clock.install();
  await open(page, NATA);
  await page.getByRole("button", { name: "Start 15 min timer" }).click();
  await page.clock.fastForward("15:01");
  const banner = page.getByRole("alert").filter({ hasText: "timer is done" });
  await expect(banner).toContainText("Step 1 · Pastry timer is done");
  await expect(page.locator(".type-timer").filter({ visible: true }).first()).toHaveText("00:00");
  const box = await banner.boundingBox();
  expect(box!.y).toBe(0);
  await shot(page, "05-timer-finished");
  await banner.getByRole("button", { name: "Dismiss" }).click();
  await expect(banner).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start 15 min timer" })).toBeEnabled();
});

test("all ingredients: checks stay through steps; collapsed on mobile after step 1", async ({ page }) => {
  await open(page, NATA);
  await page.getByRole("checkbox", { name: /Plain flour/ }).first().check();
  await next(page).click();
  if (mobile()) {
    const toggle = page.getByRole("button", { name: "All ingredients (10)" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
  }
  await expect(page.getByRole("checkbox", { name: /Plain flour/ }).first()).toBeChecked();
  await page.getByRole("checkbox", { name: /Plain flour/ }).first().scrollIntoViewIfNeeded();
  await shot(page, "06-checklist");
});

test("last step: Finish goes to the bake log with the scale", async ({ page }) => {
  await open(page, `${NATA}?step=8&scale=2`);
  await expect(page.getByRole("button", { name: "Finish" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next step" })).toHaveCount(0);
  await page.getByRole("button", { name: "Finish" }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata\/log\?new=1&scale=2$/);
});

test("finish with a running timer asks first", async ({ page }) => {
  await open(page, `${NATA}?step=8&scale=2`);
  await page.getByRole("button", { name: "Start 12 min timer" }).click();
  await expect(page.getByText(/^Running · 1[12]:\d\d$/)).toBeVisible();
  await shot(page, "07-last-step");
  const finish = page.getByRole("button", { name: "Finish" });
  await finish.click();
  await expect(page.getByRole("dialog", { name: "Stop timers and finish?" })).toContainText("Your running timers will stop.");
  await expectDestructiveConfirmation(page, "Stop timers and finish?", "Stop and finish", "Keep baking");
  await page.waitForTimeout(350);
  await shot(page, "13-finish-confirmation");
  await page.getByRole("button", { name: "Keep baking" }).click();
  if (!mobile()) await expect(finish).toBeFocused();
  await finish.click();
  await page.getByRole("button", { name: "Stop and finish" }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata\/log\?new=1&scale=2$/);
});

test("for this step: 8 rows, then 'and n more' opens All ingredients", async ({ page }) => {
  await open(page, "/recipes/brown-butter-cookies/bake?step=1&scale=2");
  const rows = page.locator("p", { hasText: "For this step" }).locator("xpath=following-sibling::ul[1]/li");
  await expect(rows).toHaveCount(8);
  await page.getByRole("button", { name: "and 2 more" }).click();
  const all = page.locator("#all-heading");
  if (mobile()) await expect(all.getByRole("button")).toBeFocused();
  else await expect(all).toBeFocused();
  await expect(page.getByRole("checkbox", { name: /Flaky sea salt/ })).toBeVisible();
});

test("exit: straight out without timers; confirmation with a timer running", async ({ page }) => {
  await open(page, `${NATA}?scale=1.5`);
  const exit = page.getByRole("link", { name: "Exit bake mode" });
  await expect(exit).toHaveAttribute("href", "/recipes/pasteis-de-nata?scale=1.5");
  await page.getByRole("button", { name: "Start 15 min timer" }).click();
  await exit.click();
  await expect(page.getByRole("dialog", { name: "Stop timers and leave?" })).toBeVisible();
  await expectDestructiveConfirmation(page, "Stop timers and leave?", "Leave", "Keep baking");
  await page.waitForTimeout(350);
  await shot(page, "08-exit-confirmation");
  await page.getByRole("button", { name: "Keep baking" }).click();
  if (!mobile()) await expect(exit).toBeFocused();
  await exit.click();
  await page.getByRole("dialog", { name: "Stop timers and leave?" }).getByRole("button", { name: "Leave" }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata\?scale=1\.5$/);
  // The URL changes before the Recipe page renders; WebKit lets the rest of that
  // client-side navigation interrupt a page.goto started too soon.
  await page.getByRole("link", { name: "Start baking" }).waitFor();
  // Timers stopped: coming back shows none.
  await open(page, NATA);
  await expect(page.getByRole("button", { name: "Start 15 min timer" })).toBeEnabled();
});

test("timer alerts card opens the sheet; Dismiss hides it for good", async ({ page }) => {
  await open(page, NATA);
  await page.getByRole("button", { name: "Start 15 min timer" }).click();
  await page.getByRole("button", { name: "Set up" }).click();
  await expect(page.getByRole("dialog", { name: "Get timer alerts on a locked phone" })).toBeVisible();
  await page.waitForTimeout(350);
  await shot(page, "09-timer-alerts-sheet");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Dismiss" }).last().click();
  await expect(page.getByText("Get alerts when your phone is locked.")).toHaveCount(0);
  await page.getByRole("button", { name: /^Clear timer/ }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Start 15 min timer" }).click();
  await expect(page.getByText("Get alerts when your phone is locked.")).toHaveCount(0);
});

test("screen may lock: notice when the device refuses to stay awake", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "wakeLock", { value: { request: async () => Promise.reject(new Error("NotAllowedError")) } });
  });
  await open(page, `${NATA}?step=3`);
  await expect(page.getByText("Your screen may lock. Timers still run when you come back.")).toBeVisible();
  await shot(page, "10-screen-may-lock");
});

test("a recipe without groups", async ({ page }) => {
  await open(page, "/recipes/brown-butter-cookies/bake?step=2");
  await expect(page.getByRole("button", { name: "Start 6 min timer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start 15 min timer" })).toBeVisible();
  await shot(page, "11-no-groups-two-timers");
});

test("loading", async ({ page }) => {
  await page.goto(`http://localhost:3101${NATA}`, { waitUntil: "commit" });
  await page.getByText("Loading recipe").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "12-loading");
});
