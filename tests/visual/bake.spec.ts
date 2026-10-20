import { expect, test, type Page } from "@playwright/test";
import { capture, expectDestructiveConfirmation, expectFocusRings, expectTouchTargets } from "./helpers";

// /recipes/:recipeId/bake (Bake Mode), BONES-recipes-bake.md 1.5.0, Focus shell on
// SKIN's dark bake-stage. The wake lock is stubbed as granted (headless Chrome refuses
// it) except in the test that checks the refusal notice. Timers use Playwright's clock
// to reach zero without waiting. Every step with a detected time gets the bake-clock
// (its first mark); any further mark in the same step is an inline timer-chip that
// starts its own timer.

const NATA = "/recipes/pasteis-de-nata/bake";
const CROISSANTS = "/recipes/cultured-butter-croissants/bake";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "bake", name, fullPage);
const mobile = () => Boolean(test.info().project.use.isMobile);
const next = (page: Page) => page.getByRole("button", { name: "Next step" });
const start = (page: Page) => page.getByRole("button", { name: "Start", exact: true });
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
  await expect(heading(page)).toHaveText("Pastry · Step 1");
  await expect(page.getByText("Some amounts are estimates.")).toBeVisible();
  // The Timer alerts card waits for the first timer (BONES 1.2.0): step 1 opens with one notice.
  await expect(page.getByText("Get alerts when your phone is locked.")).toHaveCount(0);
  const counter = page.locator("header p").last();
  await expect(counter).toContainText("1.5×");
  await expect(counter).toContainText(mobile() ? "1/8" : "Step 1 of 8");
  // Exit is a round icon button on the stage, not a visible "Exit" label.
  const exit = page.getByRole("link", { name: "Exit bake mode" });
  await expect(exit).toBeVisible();
  await expect(exit).not.toContainText("Exit");
  // The hero clock: the step's first (only) detected time, idle, with the chip
  // in the text as a second way to reach its Start.
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.getByText("15:00")).toBeVisible();
  await expect(page.getByText("ready")).toBeVisible();
  await expect(start(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to timer, 15 min" })).toBeVisible();
  // No finished steps yet: the step stack is empty.
  await expect(page.getByRole("button", { name: /^Back to step/ })).toHaveCount(0);
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
  // Step nav: 64px targets (SKIN touch-bake); Back hidden on step 1.
  expect((await next(page).boundingBox())!.height).toBeGreaterThanOrEqual(64);
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
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
  await expectFocusRings(page, 10);
});

test("moving between steps writes ?step= and focuses the step heading", async ({ page }) => {
  await open(page, NATA);
  await next(page).click();
  await expect(page).toHaveURL(/step=2$/);
  await expect(heading(page)).toHaveText("Pastry · Step 2");
  await expect(heading(page)).toBeFocused();
  await expect(page.getByRole("button", { name: "Back", exact: true })).toBeVisible();
  // A finished step joins the stack, named after its first words.
  await expect(page.getByRole("button", { name: /^Back to step 1, Mix the flour/ })).toBeVisible();
  // Step 2 has no timer: the giant outlined number is the hero instead of a clock.
  await expect(page.getByRole("timer")).toHaveCount(0);
  if (mobile()) await expect(page.getByRole("button", { name: "All ingredients (10)" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(heading(page)).toHaveText("Pastry · Step 1");
  // A refresh keeps your place.
  await open(page, `${NATA}?step=5`);
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
  await page.waitForTimeout(400); // let the step-rise entrance settle before the shot
  await shot(page, "14-tips");

  // Both tips show, plain, with no step number, no "For this step", no clock or chips.
  await expect(page.getByText("Shape ahead and freeze unbaked")).toBeVisible();
  await expect(page.getByText("If the butter block cracks")).toBeVisible();
  await expect(page.getByText("For this step")).toHaveCount(0);
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Start .* timer/ })).toHaveCount(0);

  // Finish and log replaces Next step; Back still returns to the last numbered step.
  await expect(page.getByRole("button", { name: "Finish and log" })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(heading(page)).toHaveText(/Step 14$/);
});

test("Tips screen: a timer started earlier keeps running as a pill", async ({ page }) => {
  await open(page, `${CROISSANTS}?step=4`); // "Chill the butter block for 30 minutes"
  await start(page).click();
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

test("the bake-clock: Start, −/+ 1 minute, Pause/Resume, and the matching text chip", async ({ page }) => {
  await open(page, NATA);
  // Before starting, −/+ adjust the planned duration.
  await page.getByRole("button", { name: "Add one minute" }).click();
  await expect(page.getByText("16:00")).toBeVisible();
  await page.getByRole("button", { name: "Remove one minute" }).click();
  await page.getByRole("button", { name: "Remove one minute" }).click();
  await expect(page.getByText("14:00")).toBeVisible();

  await start(page).click();
  await expect(page.getByText("running")).toBeVisible();
  await expect(page.getByText("Keep this screen open")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "timer started" })).toHaveText("Step 1 · Pastry timer started, 14 minutes.");
  // The chip in the text still focuses the clock rather than starting a second timer.
  await page.getByRole("button", { name: "Go to timer, 15 min" }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeFocused();

  // −/+ now adjust the running timer itself.
  await page.getByRole("button", { name: "Add one minute" }).click();
  await expect(page.getByText(/^1[45]:\d\d$/)).toBeVisible();

  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByText("paused", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.getByText("running")).toBeVisible();
});

test("timers: run across steps, survive a refresh, pause and clear from the pill", async ({ page }) => {
  await open(page, NATA);
  await start(page).click();
  const row = page.getByText("Step 1 · Pastry").filter({ visible: true }).last();
  await expect(row).toBeVisible();
  await next(page).click();
  // Left its own step: the hero timer becomes a pill.
  await expect(page.getByRole("button", { name: "Pause timer, Step 1 · Pastry" }).filter({ visible: true })).toBeVisible();
  await page.waitForTimeout(400); // let the step-rise entrance settle before the shot
  await shot(page, "03-timer-running");

  await page.reload();
  await heading(page).waitFor();
  await expect(page.getByRole("button", { name: "Pause timer, Step 1 · Pastry" }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/^1[45]:\d\d$/).filter({ visible: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Pause timer, Step 1 · Pastry" }).filter({ visible: true }).click();
  await expect(page.getByText("Paused", { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume timer, Step 1 · Pastry" }).filter({ visible: true }).click();

  // With just one pill (no "+n" overflow), tapping the pill itself opens the Timers
  // sheet, so Clear is still reachable.
  await page.getByRole("button", { name: "Timer details, Step 1 · Pastry" }).filter({ visible: true }).click();
  const sheet = page.getByRole("dialog", { name: "Timers" });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: /^Clear timer/ }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: /Pause timer|Timer details/ })).toHaveCount(0);
});

test("several timers: 2 pills show, then '+n' opens every one", async ({ page }) => {
  await open(page, `${CROISSANTS}?step=2`);
  // Step 2's hero (6 min) via the clock; its second mark (12 h) via the inline chip.
  await start(page).click();
  await page.getByRole("button", { name: "Start 12 h timer" }).click();
  await next(page).click(); // step 3, no timer
  await next(page).click(); // step 4
  await start(page).click(); // step 4's own 30 min clock
  await next(page).click(); // step 5: now step 4's timer is also a pill, not its clock
  // Soonest first: 6 min, then 30 min; the 12 h proof sinks to the end.
  const order = page.getByRole("button", { name: /^Pause timer/ }).filter({ visible: true });
  await expect(order.first()).toHaveAccessibleName(/^Pause timer, Step.2.*Dough.*6.*min$/);
  await expect(order.nth(1)).toHaveAccessibleName(/^Pause timer, Step.4.*Butter block$/);
  const more = page.getByRole("button", { name: "+1", exact: true });
  await expect(more).toBeVisible();
  await page.waitForTimeout(400); // let the step-rise entrance settle before the shot
  if (mobile()) {
    await shot(page, "04-several-timers");
  } else {
    await expect(page.getByRole("button", { name: /^Timer details, Step.2.*Dough.*6.*min$/ })).toBeVisible();
    await shot(page, "04-several-timers");
  }
  await more.click();
  const sheet = page.getByRole("dialog", { name: "Timers" });
  await expect(sheet.getByRole("button", { name: /^Clear timer/ })).toHaveCount(3);
  // The two timers from step 2 are told apart by their duration.
  await expect(sheet.getByText(/^Step.2.*Dough.*6.*min$/)).toBeVisible();
  await expect(sheet.getByText(/^Step.2.*Dough.*12.*h$/)).toBeVisible();
});

test("timer finished: the banner, Go to step, and dismiss", async ({ page }) => {
  await page.clock.install();
  await open(page, NATA);
  await start(page).click();
  await next(page).click(); // leave step 1 so the finish shows as the banner, not the clock's own done state
  await page.clock.fastForward("15:01");
  const banner = page.getByRole("alert").filter({ hasText: "is done" });
  await expect(banner).toContainText("Step 1 is done");
  await expect(banner).toContainText("Mix the flour, salt…");
  const box = await banner.boundingBox();
  expect(box!.y).toBe(0);
  await shot(page, "05-timer-finished");

  await banner.getByRole("button", { name: "Go to step" }).click();
  await expect(heading(page)).toHaveText("Pastry · Step 1");
  // Going to the step dismissed the banner and cleared the timer; the clock is idle again.
  await expect(banner).toHaveCount(0);
  await expect(page.getByText("ready")).toBeVisible();
  await expect(start(page)).toBeVisible();
});

test("timer finished while its clock is on screen: the clock shows Done, no banner", async ({ page }) => {
  await page.clock.install();
  await open(page, NATA);
  await start(page).click();
  await page.clock.fastForward("15:01");
  await expect(page.getByText("done", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "is done" })).toHaveCount(0);
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
  await page.waitForTimeout(400); // let the step-rise entrance settle before the shot
  await shot(page, "06-checklist");
});

test("last step: Finish and log goes to the bake log with the scale", async ({ page }) => {
  await open(page, `${NATA}?step=8&scale=2`);
  await expect(page.getByRole("button", { name: "Finish and log" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next step" })).toHaveCount(0);
  await page.getByRole("button", { name: "Finish and log" }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata\/log\?new=1&scale=2$/);
});

test("finish with a running timer asks first", async ({ page }) => {
  await open(page, `${NATA}?step=8&scale=2`);
  await start(page).click();
  await expect(page.getByText("running")).toBeVisible();
  await shot(page, "07-last-step");
  const finish = page.getByRole("button", { name: "Finish and log" });
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
  await start(page).click();
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
  // Timers stopped: coming back shows the clock idle again.
  await open(page, NATA);
  await expect(start(page)).toBeEnabled();
});

test("timer alerts card opens the sheet; Dismiss hides it for good", async ({ page }) => {
  await open(page, NATA);
  await start(page).click();
  await page.getByRole("button", { name: "Set up" }).click();
  await expect(page.getByRole("dialog", { name: "Get timer alerts on a locked phone" })).toBeVisible();
  await page.waitForTimeout(350);
  await shot(page, "09-timer-alerts-sheet");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Dismiss" }).last().click();
  await expect(page.getByText("Get alerts when your phone is locked.")).toHaveCount(0);
  // Dismissed for good: starting another timer, on a different step, doesn't bring it back.
  await next(page).click();
  await next(page).click();
  await start(page).click(); // step 3's 2-hour clock
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

test("a recipe without groups: two marks in one step, the first as the clock, the second as a chip", async ({ page }) => {
  await open(page, "/recipes/brown-butter-cookies/bake?step=2");
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.getByText("ready")).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to timer, 6 min" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start 15 min timer" })).toBeVisible();
  await shot(page, "11-no-groups-two-timers");
});

test("the step stack: strips tap back to a step; older ones collapse behind 'n more done'", async ({ page }) => {
  await open(page, `${CROISSANTS}?step=5`);
  // 4 finished steps, shown 3 at a time (not a clock step, and this viewport is tall
  // enough) — the oldest collapses first.
  await expect(page.getByRole("button", { name: "+1 more done" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Back to step 1,/ })).toHaveCount(0);
  await page.getByRole("button", { name: "+1 more done" }).click();
  await expect(page.getByRole("button", { name: /^Back to step 1, Mix the flour/ })).toBeVisible();
  // A step whose timer still runs shows "running" instead of a check.
  await page.getByRole("button", { name: /^Back to step 4,/ }).click();
  await expect(heading(page)).toHaveText(/Step 4$/);
  await start(page).click();
  await next(page).click();
  await expect(page.getByRole("button", { name: /^Back to step 4,.*running$/ })).toBeVisible();
});

test("loading", async ({ page }) => {
  await page.goto(`http://localhost:3101${NATA}`, { waitUntil: "commit" });
  await page.getByText("Loading recipe").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "12-loading");
});
