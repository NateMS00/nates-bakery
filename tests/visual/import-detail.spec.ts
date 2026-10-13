import { expect, test, type Page } from "@playwright/test";
import { capture, expectDestructiveConfirmation, expectFitsContent, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, phoneWebKit, ready } from "./helpers";

// /import/:draftId (Review Import), /recipes/new, and /recipes/:recipeId/edit: the
// shared Recipe Editor, BONES-import-detail.md. Each test gets its own copy of the
// fixtures (namespace cookie), so saves and discards can't affect other tests.

const BABKA = "/import/d-babka";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "import-detail", name, fullPage);
const mobile = () => Boolean(test.info().project.use.isMobile);
const check = (page: Page) => page.locator("#check-heading").locator("xpath=..");
const amount = (page: Page, name: string) => page.getByRole("textbox", { name: `${name}, grams` });
// The save-blocked summary (Next's route announcer is also role="alert").
// Desktop has two Save recipe buttons (header and left column); this is the first visible one.
const save = (page: Page) => page.getByRole("button", { name: "Save recipe" }).filter({ visible: true }).first();
const blocked = (page: Page) => page.locator("[role=alert][aria-labelledby=save-blocked-heading]");

test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});

test("first viewport, full page, and page checks", async ({ page }) => {
  await ready(page, BABKA);
  await shot(page, "01-first-viewport");
  await shot(page, "02-full", true);
  await expectPageBasics(page);
  await expectPageTop(page);
  await expectTouchTargets(page);

  // Needs Your Check: summary and order (Missing, Estimated, Converted).
  await expect(check(page)).toContainText("2 missing · 3 estimated · 2 converted");
  const items = check(page).getByRole("link");
  await expect(items.first()).toContainText("Unsalted butter, soft");
  await expect(items.first()).toContainText("— g");
  // At most 5 on mobile, then Show all (7); all on desktop.
  await expect(items.filter({ visible: true })).toHaveCount(mobile() ? 5 : 7);
  if (mobile()) {
    await page.getByRole("button", { name: "Show all (7)" }).click();
    await expect(items.filter({ visible: true })).toHaveCount(7);
  }
  await expect(check(page).getByRole("link", { name: /Whole milk/ })).toContainText("120 g from ½ cup");
  // Draft status, the mobile Save bar's status line, and the Suggested category.
  await expect(page.getByText("Draft saved")).toBeVisible();
  // The Save bar counts everything blocking the save, like the error summary.
  if (mobile()) await expect(page.getByText("2 things to fix", { exact: true })).toBeVisible();
  // Desktop: Save recipe is repeated at the end of the sticky left column.
  if (!mobile()) await expect(page.getByRole("button", { name: "Save recipe" })).toHaveCount(2);
  await expect(page.getByText("Suggested")).toBeVisible();
});

test("focus rings", async ({ page }) => {
  test.skip(mobile(), "keyboard focus checked on desktop");
  await ready(page, BABKA);
  await expectFocusRings(page, 20);
});

test("transcript: Read more expands in place, Show less collapses", async ({ page }) => {
  await ready(page, BABKA);
  const toggle = page.getByRole("button", { name: "Read more" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  const less = page.getByRole("button", { name: "Show less" });
  await expect(less).toHaveAttribute("aria-expanded", "true");
  // Expanding doesn't move focus. (In WebKit the click doesn't focus the button to begin with.)
  if (!phoneWebKit()) await expect(less).toBeFocused();
  await expect(page.getByText("Spoken:")).toBeVisible();
  await page.locator("#source-heading").scrollIntoViewIfNeeded();
  await shot(page, "03-transcript-expanded");
  await less.click();
  await expect(page.getByRole("button", { name: "Read more" })).toBeVisible();
});

test("an ingredient group with Missing, Estimated, and Converted rows", async ({ page }) => {
  await ready(page, BABKA);
  const dough = page.getByRole("group", { name: "Dough" }).first();
  await expect(dough.getByText("! Missing")).toHaveCount(2);
  await expect(dough.getByText("~ Estimated")).toHaveCount(1);
  await expect(dough.getByText("= Converted")).toHaveCount(1);
  await expect(dough.getByText("was ½ cup")).toBeVisible();
  await expect(dough.getByRole("switch", { name: /To taste/ })).toHaveCount(2);
  // Placeholders on empty fields; Missing amounts show "0".
  await expect(amount(page, "Fine salt")).toHaveAttribute("placeholder", "—");
  const boxes = await dough.locator("li").evaluateAll((rows) =>
    rows.map((li) => {
      const amountBox = li.querySelector("input[inputmode=decimal]")?.parentElement ?? li.querySelector("span.justify-end");
      const nameBox = li.querySelector("textarea")!;
      return { x: Math.round(amountBox!.getBoundingClientRect().right), rowHeight: Math.round(nameBox.getBoundingClientRect().height), li: Math.round(li.getBoundingClientRect().height) };
    }),
  );
  // The grams line up down the whole group.
  expect(new Set(boxes.map((b) => b.x)).size).toBe(1);
  // Clean rows take one line (name, amount, menu); only rows with something to check get a second.
  // (Yeast and eggs: short names. "Strong white bread flour" wraps inside its field on mobile.)
  const clean = boxes.filter((_, i) => [3, 4].includes(i));
  for (const b of clean) expect(b.li).toBeLessThan(80);
  // Desktop: Confirm and To taste sit at the right edge of the status area, lined up.
  if (!mobile()) {
    const rights = await dough.locator("li").evaluateAll((rows) =>
      rows
        .map((li) => li.querySelector<HTMLElement>("button[role=switch], button.border-primary:not([aria-haspopup])"))
        .filter(Boolean)
        .map((b) => Math.round(b!.getBoundingClientRect().right)),
    );
    expect(rights.length).toBe(4);
    expect(new Set(rights).size).toBe(1);
  }
  // Long names wrap instead of truncating, however many lines they need.
  const flour = page.getByRole("textbox", { name: "Ingredient 1, name" });
  await flour.fill("Strong white bread flour, at least 13% protein, from a local mill");
  const fit = await flour.evaluate((el) => ({ h: el.getBoundingClientRect().height, hidden: el.scrollHeight - el.clientHeight }));
  expect(fit.hidden).toBeLessThanOrEqual(1);
  if (mobile()) expect(fit.h).toBeGreaterThan(60);
  await dough.scrollIntoViewIfNeeded();
  // The fixed Save bar would sit over the group's last rows in an element capture.
  await dough.screenshot({ path: `screenshots/import-detail/${test.info().project.name}--04-ingredient-group.png`, style: "[data-action-bar]{visibility:hidden}" });
});

test("check items jump to their field and leave when resolved", async ({ page }) => {
  await ready(page, BABKA);
  await check(page).getByRole("link", { name: /Unsalted butter/ }).click();
  const butter = amount(page, "Unsalted butter, soft");
  await expect(butter).toBeFocused();
  await butter.fill("90");
  await expect(check(page)).toContainText("1 missing · 3 estimated · 2 converted");
  await expect(check(page).getByRole("status")).toHaveText("Unsalted butter, soft checked. 6 left to check.");
  // Confirm removes the marker without changing the value.
  await page.getByRole("button", { name: "Confirm Caster sugar" }).click();
  await expect(check(page)).toContainText("1 missing · 2 estimated · 2 converted");
  await expect(amount(page, "Caster sugar")).toHaveValue("100");
  // To taste resolves a Missing amount.
  await page.getByRole("switch", { name: "To taste, Fine salt" }).click();
  await expect(check(page)).toContainText("2 estimated · 2 converted");
  if (mobile()) await expect(page.getByText("Ready to save")).toBeVisible();
});

test("Save blocked, then saved as a recipe", async ({ page }) => {
  await ready(page, BABKA);
  await page.getByRole("textbox", { name: "Title" }).fill("");
  await save(page).click();
  const summary = blocked(page);
  await expect(summary).toContainText("3 things to fix before saving");
  await expect(summary).toBeFocused();
  await expect(amount(page, "Unsalted butter, soft")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveAttribute("aria-invalid", "true");
  await shot(page, "05-save-blocked");

  // The summary's links jump to each field; it updates as problems are fixed.
  await summary.getByRole("link", { name: "Enter a title" }).click();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeFocused();
  await page.getByRole("textbox", { name: "Title" }).fill("Chocolate tahini babka");
  await amount(page, "Unsalted butter, soft").fill("90");
  await amount(page, "Fine salt").fill("8");
  await expect(summary).toHaveCount(0);

  // On desktop, save with the button repeated at the end of the left column.
  await (mobile() ? save(page) : page.getByRole("button", { name: "Save recipe" }).last()).click();
  await page.waitForURL(/\/recipes\/chocolate-tahini-babka-/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chocolate tahini babka");
  await expect(page.getByText("Makes 2 loaves")).toBeVisible();
  await expect(page.getByText("@braided.bea")).toBeVisible();
  // It left Drafts and joined the Library.
  await page.goto("/recipes");
  await expect(page.locator("#drafts-heading ~ ul")).not.toContainText("Chocolate tahini babka");
  await expect(page.locator("#recipes-heading ~ ul > li").first()).toContainText("Chocolate tahini babka");
});

test("Save failed keeps the edits and offers Retry", async ({ page, context }) => {
  await context.addCookies([{ name: "backery_stub_fail_saves", value: "1", url: "http://localhost:3100" }]);
  await ready(page, "/import/d-canele");
  await save(page).click();
  const failed = page.getByText("Couldn’t save the recipe. Your edits are kept in the draft.").filter({ visible: true });
  await expect(failed).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" }).filter({ visible: true })).toBeVisible();
  await shot(page, "09-save-failed");
});

test("Everything checked when nothing is flagged", async ({ page }) => {
  await ready(page, "/import/d-canele");
  await expect(check(page)).toContainText("Everything checked");
  await expect(page.getByText("To taste").first()).toBeVisible();
});

test("autosave keeps edits in the draft", async ({ page }) => {
  await ready(page, "/import/d-madeleines");
  await page.getByRole("textbox", { name: "Title" }).fill("Honey madeleines");
  await expect(page.getByText("Saving…")).toBeVisible();
  await expect(page.getByText("Draft saved")).toBeVisible();
  await ready(page, "/import/d-madeleines");
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Honey madeleines");
});

test("Ingredients used picker", async ({ page }) => {
  await ready(page, BABKA);
  const edit = page.getByRole("button", { name: "Edit ingredients for step 3" });
  await edit.scrollIntoViewIfNeeded();
  await edit.click();
  const picker = page.getByRole("dialog", { name: "Ingredients for step 3" });
  await expect(picker).toBeVisible();
  // The step's own group (Filling) is listed first.
  await expect(picker.locator("fieldset").first().locator("legend")).toHaveText("Filling");
  await expect(picker.getByRole("checkbox", { name: "Tahini" })).toBeChecked();
  await picker.getByRole("checkbox", { name: "Granulated sugar" }).check();
  await page.waitForTimeout(350);
  await shot(page, "06-ingredients-used-picker");
  await picker.getByRole("button", { name: "Done" }).click();
  await expect(picker).toBeHidden();
  await expect(edit).toBeFocused();
  await expect(edit.locator("xpath=..")).toContainText("Granulated sugar");
});

test("Discard confirmation", async ({ page }) => {
  await ready(page, BABKA);
  const discard = page.getByRole("button", { name: "Discard" });
  await discard.click();
  const dialog = page.getByRole("dialog", { name: "Discard this import?" });
  await expect(dialog).toBeVisible();
  await expectDestructiveConfirmation(page, "Discard this import?", "Discard", "Keep reviewing");
  await page.waitForTimeout(350);
  await expectFitsContent(page, "Discard this import?");
  await shot(page, "07-discard");
  await dialog.getByRole("button", { name: "Keep reviewing" }).click();
  await expect(discard).toBeFocused();
  await discard.click();
  await dialog.getByRole("button", { name: "Discard", exact: true }).click();
  await page.waitForURL(/\/recipes$/);
  await expect(page.locator("#drafts-heading ~ ul")).not.toContainText("Chocolate tahini");
});

test("row menu: move, move to group, delete with Undo", async ({ page }) => {
  await ready(page, BABKA);
  const names = page.getByRole("group", { name: "Dough" }).first().getByRole("textbox", { name: /name$/ });
  await expect(names.nth(4)).toHaveValue("Eggs");
  await page.getByRole("button", { name: "More actions, Eggs" }).click();
  await page.getByRole("menuitem", { name: "Move up" }).click();
  await expect(names.nth(3)).toHaveValue("Eggs");

  await page.getByRole("button", { name: "More actions, Eggs" }).click();
  await shot(page, "08-row-menu");
  await page.getByRole("menuitem", { name: "Move to group" }).click();
  await page.getByRole("menuitem", { name: "Filling" }).click();
  await expect(page.getByRole("group", { name: "Filling" }).first().getByRole("textbox", { name: /name$/ }).last()).toHaveValue("Eggs");

  await page.getByRole("button", { name: "More actions, Eggs" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByText("Deleted Eggs")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("textbox", { name: /name$/ }).filter({ hasText: "" })).not.toHaveCount(0);
  expect(await page.getByRole("textbox", { name: /name$/ }).evaluateAll((els) => els.filter((e) => (e as HTMLTextAreaElement).value === "Eggs").length)).toBe(1);
});

test("group picker adds a group; steps detect times", async ({ page }) => {
  await ready(page, BABKA);
  await page.getByRole("button", { name: "Add ingredient group" }).click();
  await page.getByRole("button", { name: "Topping", exact: true }).first().click();
  await expect(page.getByRole("group", { name: "Topping" })).toBeVisible();
  await page.getByRole("button", { name: "Add ingredient to Topping" }).click();
  await expect(page.getByRole("group", { name: "Topping" }).getByRole("textbox", { name: /name$/ })).toBeFocused();

  const step = page.getByRole("textbox", { name: "Step 2" });
  await step.fill("Cover and chill for 45 minutes, then rest 1 hour.");
  const row = step.locator("xpath=..");
  await expect(row).toContainText("45 min");
  await expect(row).toContainText("1 h");
});

test("not found: unknown or still-importing draft", async ({ page }) => {
  await page.goto("/import/nope");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.goto("/import/d-importing");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("loading", async ({ page }) => {
  await page.goto(`http://localhost:3101${BABKA}`, { waitUntil: "commit" });
  await page.getByText("Loading draft").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "10-loading");
});

// ── New Recipe and Edit Recipe reuse the editor ──

test("new recipe: blocked, then saved", async ({ page }) => {
  await ready(page, "/recipes/new?source=https://www.instagram.com/reel/Cprivate9/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("New recipe");
  await expect(page.getByRole("textbox", { name: "Source link" })).toHaveValue("https://www.instagram.com/reel/Cprivate9/");
  await expectPageBasics(page);
  await shot(page, "11-new-recipe");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  // Title and category; an untouched blank row isn't a Missing amount.
  await expect(blocked(page)).toContainText("2 things to fix before saving");

  await page.getByRole("textbox", { name: "Title" }).fill("Kouign-amann");
  await page.getByLabel("Category").selectOption("viennoiserie");
  await page.getByRole("textbox", { name: "Ingredient 1, name" }).fill("Strong white bread flour");
  await amount(page, "Strong white bread flour").fill("300");
  await page.getByRole("textbox", { name: "Step 1" }).fill("Laminate with butter and sugar, then bake for 25 minutes.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForURL(/\/recipes\/kouign-amann-/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kouign-amann");
  await expect(page.getByText("@Cprivate9").or(page.getByText("Watch reel"))).toBeVisible();
});

test("edit recipe: confirm an estimate, leave guard, delete", async ({ page }) => {
  await ready(page, "/recipes/pasteis-de-nata/edit");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Edit recipe");
  await expect(page.getByRole("link", { name: "Pastéis de nata" })).toHaveAttribute("href", "/recipes/pasteis-de-nata");
  await expect(page.getByText("Suggested")).toHaveCount(0);

  // Leaving with unsaved changes asks first.
  await page.getByRole("button", { name: "Confirm Egg yolks" }).click();
  await page.getByRole("link", { name: "Pastéis de nata" }).click();
  const leave = page.getByRole("dialog", { name: "Leave without saving?" });
  await expect(leave).toBeVisible();
  await expectDestructiveConfirmation(page, "Leave without saving?", "Leave", "Keep editing");
  await leave.getByRole("button", { name: "Keep editing" }).click();

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata$/);
  await expect(page.getByText("1 amount is an estimate.")).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Rate 4 out of 5" })).toHaveAttribute("aria-checked", "true"); // rating kept

  await ready(page, "/recipes/pasteis-de-nata/edit");
  await page.getByRole("button", { name: "Delete recipe" }).click();
  await expectDestructiveConfirmation(page, "Delete this recipe?", "Delete recipe", "Keep recipe");
  await page.waitForTimeout(350);
  await shot(page, "12-delete-recipe");
  await page.getByRole("dialog", { name: "Delete this recipe?" }).getByRole("button", { name: "Delete recipe" }).click();
  await page.waitForURL(/\/recipes$/);
  await expect(page.locator("#recipes-heading ~ p[aria-live]")).toHaveText("33 recipes");
});
