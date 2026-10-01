import { expect, test, type Page } from "@playwright/test";
import { capture, expectDestructiveConfirmation, expectFitsContent, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, ready } from "./helpers";

// /recipes/:recipeId/log (Bake Log), BONES-recipes-log.md: entries, Show more, empty,
// loading, not found, the entry form (new and edit), Discard changes, Delete
// confirmation, and the Rating prompt after a new entry. Each test has its own copy
// of the fixtures (namespace cookie), since saving and deleting change them.

const NATA = "/recipes/pasteis-de-nata/log";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "log", name, fullPage);
const mobile = () => Boolean(test.info().project.use.isMobile);
const form = (page: Page, name = "Log a bake") => page.getByRole("dialog", { name });
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});

test("entries: first viewport, full list, and page checks", async ({ page }) => {
  await ready(page, NATA);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bake log");
  await expect(page.getByRole("link", { name: "Pastéis de nata" })).toHaveAttribute("href", "/recipes/pasteis-de-nata");
  await expect(page.getByText("3 bakes")).toBeVisible();
  // Newest first; the scale shows only when it isn't 1×.
  const headings = page.getByRole("heading", { level: 2 });
  await expect(headings).toHaveText(["Sat 26 Sep", "Sat 12 Sep", /^Sun 30 Aug · (at )?½×$/]);
  await expect(headings.last()).toHaveAccessibleName("Sun 30 Aug at ½×");
  // An entry with no notes: "No notes · Add notes".
  const last = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /30 Aug/ }) });
  await expect(last).toContainText("No notes");
  await expect(last.getByRole("link", { name: "Add notes, Sun 30 Aug bake" })).toHaveAttribute("href", "/recipes/pasteis-de-nata/log?edit=nata-b1");
  await shot(page, "01-entries");
  await shot(page, "02-entries-full", true);

  await expectPageBasics(page);
  await expectPageTop(page);
  await expectTouchTargets(page);
  await expectFocusRings(page, 5);
  // Desktop: one centered reading column, 8 of 12 columns.
  if (!mobile()) {
    const main = await page.locator("main").boundingBox();
    const col = await page.locator("main > div").first().boundingBox();
    expect(Math.abs(col!.x + col!.width / 2 - (main!.x + main!.width / 2))).toBeLessThan(2);
    expect(col!.width).toBeLessThan(main!.width * 0.7);
  } else {
    // Log a bake pinned at the bottom on mobile.
    const bar = await page.getByRole("link", { name: "Log a bake" }).boundingBox();
    expect(bar!.y + bar!.height).toBeGreaterThan(844 - 48);
  }
});

test("show more: 20 entries, then the next ones below with focus on the first", async ({ page }) => {
  await ready(page, "/recipes/country-sourdough/log");
  await expect(page.getByText("24 bakes")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(20);
  await page.getByRole("button", { name: "Show more" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(24);
  await expect(page.getByRole("heading", { level: 2 }).nth(20)).toBeFocused();
  await expect(page.getByRole("button", { name: "Show more" })).toHaveCount(0);
  // Last year's bakes show the year.
  await expect(page.getByRole("heading", { level: 2 }).last()).toHaveText(/2025$/);
});

test("empty state", async ({ page }) => {
  await ready(page, "/recipes/brown-butter-cookies/log");
  await expect(page.getByText("No bakes logged yet")).toBeVisible();
  await expect(page.getByText("Note what you change each time, and the next bake gets better.")).toBeVisible();
  await expect(page.getByText(/\d+ bakes?$/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Log a bake" })).toBeVisible();
  await expectPageBasics(page);
  await shot(page, "03-empty");
});

test("loading: header and 3 placeholder entries", async ({ page }) => {
  await page.goto(`http://localhost:3101${NATA}`, { waitUntil: "commit" });
  await page.getByText("Loading bakes").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bake log");
  await expect(page.locator("main li")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Log a bake" })).toBeDisabled();
  await shot(page, "04-loading");
  await expect(page.getByText("3 bakes")).toBeVisible({ timeout: 15_000 });
});

test("not found", async ({ page }) => {
  await page.goto("/recipes/no-such-recipe/log");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/not found/i);
});

test("new entry from Bake Mode: form, save, rating prompt, then the new entry", async ({ page }) => {
  await ready(page, `${NATA}?new=1&scale=1.5`);
  const dialog = form(page);
  await expect(dialog).toBeVisible();
  // Date today, scale from Bake Mode, focus on What changed.
  await expect(dialog.getByLabel("Date")).toHaveValue(today());
  await expect(dialog.getByLabel("Scale")).toHaveValue("1.5");
  // Decimal keypad on phones; the visible "×" is skipped by screen readers.
  await expect(dialog.getByLabel("Scale")).toHaveAttribute("inputmode", "decimal");
  await expect(dialog.getByText("×", { exact: true })).toHaveAttribute("aria-hidden", "true");
  await expect(dialog.getByLabel("What changed")).toBeFocused();
  await page.waitForTimeout(350);
  const box = await dialog.boundingBox();
  if (mobile()) {
    // Full-screen sheet, with Save and Cancel pinned to the bottom.
    expect(box!.height).toBeGreaterThan(844 - 2);
    const save = await dialog.getByRole("button", { name: "Save" }).boundingBox();
    expect(save!.y + save!.height).toBeGreaterThan(844 - 80);
  } else {
    // 6 of 12 columns, measured with the page's own grid variables.
    const six = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.width = "calc(var(--col) * 6 + var(--gutter) * 5)";
      document.body.append(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return w;
    });
    expect(Math.abs(box!.width - six)).toBeLessThan(1);
  }
  await shot(page, "05-form-new");
  await expectTouchTargets(page);

  // Validation: an empty date.
  await dialog.getByLabel("Date").fill("");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByText("Enter the day you baked it")).toBeVisible();
  await expect(dialog.getByLabel("Date")).toBeFocused();
  await dialog.getByLabel("Date").fill(today());
  await expect(dialog.getByLabel("Date")).not.toHaveAttribute("aria-invalid");

  await dialog.getByLabel("What changed").fill("Oven at 290 °C, tins on the top shelf.");
  await dialog.getByLabel("How it turned out").fill("Proper blistered tops. Custard set but still wobbly.");
  await shot(page, "06-form-filled");
  await dialog.getByRole("button", { name: "Save" }).click();

  // Rating prompt after every new entry, showing the current rating (4).
  const prompt = page.getByRole("dialog", { name: "How was this bake?" });
  await expect(prompt).toBeVisible();
  await expect(page).not.toHaveURL(/new=1/);
  const current = prompt.getByRole("radio", { name: "Rate 4 out of 5" });
  await expect(current).toHaveAttribute("aria-checked", "true");
  await expect(current).toBeFocused();
  await page.waitForTimeout(350);
  await expectFitsContent(page, "How was this bake?");
  expect((await current.locator("svg").boundingBox())?.width).toBe(40);
  await shot(page, "07-rating-prompt");
  await prompt.getByRole("radio", { name: "Rate 5 out of 5" }).click();
  await expect(prompt).toBeHidden();

  // The new entry is at the top, highlighted, with focus on its heading.
  const first = page.getByRole("heading", { level: 2 }).first();
  await expect(first).toBeFocused();
  await expect(first).toContainText("1.5×");
  await expect(page.getByText("4 bakes")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Bake saved" })).toBeAttached();
  await page.waitForTimeout(300);
  await shot(page, "08-new-entry");

  // The Recipe page reads the same data: rating 5, latest bake today.
  await page.getByRole("link", { name: "Pastéis de nata" }).click();
  await expect(page.getByRole("radio", { name: "Rate 5 out of 5" }).first()).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("See all bakes (4)")).toBeVisible();
});

test("discard changes: asks inside the form when there's typed text", async ({ page }) => {
  await ready(page, NATA);
  const open = page.getByRole("link", { name: "Log a bake" });

  // Without typed text the form just closes, and focus returns to Log a bake.
  await open.click();
  await expect(form(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(form(page)).toBeHidden();
  await expect(page).not.toHaveURL(/new=1/);
  await expect(open).toBeFocused();

  // With typed text: Esc asks first.
  await open.click();
  await form(page).getByLabel("What changed").fill("Less sugar in the custard");
  await page.keyboard.press("Escape");
  await expect(form(page)).toBeVisible();
  await expect(form(page).getByText("Discard this entry?")).toBeVisible();
  await page.waitForTimeout(350);
  await expectDestructiveConfirmation(page, "Log a bake", "Discard", "Keep editing");
  await shot(page, "09-discard-changes");

  // Keep editing: the text is still there.
  await form(page).getByRole("button", { name: "Keep editing" }).click();
  await expect(form(page).getByLabel("What changed")).toHaveValue("Less sugar in the custard");
  await expect(form(page).getByLabel("What changed")).toBeFocused();

  // Cancel asks too; Discard closes without saving.
  await form(page).getByRole("button", { name: "Cancel" }).click();
  await form(page).getByRole("button", { name: "Discard" }).click();
  await expect(form(page)).toBeHidden();
  await expect(page.getByText("3 bakes")).toBeVisible();
  await expect(open).toBeFocused();
});

test("edit: Add notes opens the entry's form at ?edit=; no rating prompt", async ({ page }) => {
  await ready(page, NATA);
  const before = await page.evaluate(() => history.length);
  await page.getByRole("link", { name: "Add notes, Sun 30 Aug bake" }).click();
  await expect(page).toHaveURL(/\/log\?edit=nata-b1$/);
  const dialog = form(page, "Edit bake");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Date")).toHaveValue("2026-08-30");
  await expect(dialog.getByLabel("Scale")).toHaveValue("0.5");
  await expect(dialog.getByLabel("What changed")).toBeFocused();
  await page.waitForTimeout(350);
  await shot(page, "13-add-notes-form");

  // Closing without changes removes the param, replacing the history entry.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/log$/);
  expect(await page.evaluate(() => history.length)).toBe(before);
  await expect(page.getByRole("link", { name: "Add notes, Sun 30 Aug bake" })).toBeFocused();

  await page.getByRole("link", { name: "Add notes, Sun 30 Aug bake" }).click();
  await dialog.getByLabel("How it turned out").fill("Half batch: six tarts, all gone by lunch.");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const entry = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /30 Aug/ }) });
  await expect(entry).toContainText("Half batch: six tarts");
  // The Add notes link is gone, so focus goes to the entry's heading.
  await expect(entry.getByRole("heading")).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "Bake saved" })).toBeAttached();
});

test("edit: the entry menu's Edit, a direct ?edit= link, and an unknown id", async ({ page }) => {
  await ready(page, NATA);
  const menu = page.getByRole("button", { name: "More actions, Sat 12 Sep bake" });
  await menu.click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\?edit=nata-b2$/);
  await expect(form(page, "Edit bake").getByLabel("How it turned out")).toHaveValue("Pale tops. Oven wasn't hot enough.");
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/log$/);
  await expect(menu).toBeFocused();

  // A link straight to the form survives a refresh; closing returns focus to the entry.
  await ready(page, `${NATA}?edit=nata-b2`);
  await expect(form(page, "Edit bake")).toBeVisible();
  await expect(form(page, "Edit bake").getByLabel("What changed")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Sat 12 Sep" })).toBeFocused();

  // Unknown id: the log, no form, no error, and the URL corrected.
  await ready(page, `${NATA}?edit=no-such-bake`);
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bake log");
  await expect(page.getByText("3 bakes")).toBeVisible();
});

test("edit: Add notes on the Recipe page opens the latest bake's form", async ({ page }) => {
  await ready(page, "/recipes/lemon-drizzle-loaf");
  await page.getByRole("link", { name: "Add notes" }).click();
  await expect(page).toHaveURL(/\/recipes\/lemon-drizzle-loaf\/log\?edit=l-b1$/);
  const dialog = form(page, "Edit bake");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Date")).toHaveValue("2026-09-05");
  await expect(dialog.getByLabel("What changed")).toBeFocused();
});

test("delete: confirmation, then focus on the next entry", async ({ page }) => {
  await ready(page, NATA);
  const menu = page.getByRole("button", { name: "More actions, Sat 26 Sep bake" });
  await menu.click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this bake?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("The Sat 26 Sep bake and its notes will be removed.");
  await expect(dialog).not.toContainText("Not baked yet");
  await page.waitForTimeout(350);
  await expectDestructiveConfirmation(page, "Delete this bake?", "Delete", "Cancel");
  await shot(page, "10-delete");

  // Cancel returns to the menu button.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(menu).toBeFocused();

  await menu.click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("2 bakes")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sat 12 Sep" })).toBeFocused();
});

test("delete the last entry: warning, then the empty state", async ({ page }) => {
  await ready(page, "/recipes/lemon-drizzle-loaf/log");
  await page.getByRole("button", { name: "More actions, Sat 5 Sep bake" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this bake?" });
  await expect(dialog).toContainText("The recipe will show as Not baked yet.");
  await page.waitForTimeout(350);
  await expectFitsContent(page, "Delete this bake?");
  await expectDestructiveConfirmation(page, "Delete this bake?", "Delete", "Cancel");
  await shot(page, "11-delete-last");
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("No bakes logged yet")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();

  await page.getByRole("link", { name: "Lemon drizzle loaf" }).click();
  await expect(page.getByText("Not baked yet")).toBeVisible();
});

test("entry menu: Edit and Delete", async ({ page }) => {
  await ready(page, NATA);
  await page.getByRole("button", { name: "More actions, Sat 26 Sep bake" }).click();
  await expect(page.getByRole("menuitem")).toHaveText(["Edit", "Delete"]);
  await page.waitForTimeout(350);
  await shot(page, "12-entry-menu");
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await expect(form(page, "Edit bake").getByLabel("What changed")).toHaveValue(/./);
});

test.describe("today is the owner's local date", () => {
  // Bogotá is UTC−5: at 8 pm on 30 Sep it is already 1 Oct in UTC.
  test.use({ timezoneId: "America/Bogota" });

  test("an evening bake defaults to today and saves; tomorrow is rejected", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-09-30T20:00:00-05:00"));
    await ready(page, NATA);
    await page.getByRole("link", { name: "Log a bake" }).click();
    const dialog = form(page);
    const date = dialog.getByLabel("Date");
    await expect(date).toHaveValue("2026-09-30");
    await expect(date).toHaveAttribute("max", "2026-09-30");

    await date.fill("2026-10-01");
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(dialog.getByText("The date can't be in the future")).toBeVisible();

    await date.fill("2026-09-30");
    await dialog.getByRole("button", { name: "Save" }).click();
    await page.getByRole("dialog", { name: "How was this bake?" }).getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText("Wed 30 Sep");
    await expect(page.getByText("4 bakes")).toBeVisible();
  });
});
