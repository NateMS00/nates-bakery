import { expect, test, type Page } from "@playwright/test";
import { capture, expectDestructiveConfirmation, expectFitsContent, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, phoneWebKit, ready } from "./helpers";

// /import/:draftId (Review Import), /recipes/new, and /recipes/:recipeId/edit: the
// shared Recipe Editor, BONES-import-detail.md. Each test gets its own copy of the
// fixtures (namespace cookie), so saves and discards can't affect other tests.

const BABKA = "/import/d-babka";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "import-detail", name, fullPage);
const mobile = () => Boolean(test.info().project.use.isMobile);
const check = (page: Page) => page.locator('section[aria-labelledby="check-heading"]');
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

  // Needs Your Check: the count, and row order (Missing, then Estimated, then Converted).
  await expect(check(page).getByRole("heading", { name: "Check 7 amounts" })).toBeVisible();
  await expect(check(page).getByText("Tap a row to fix it.")).toBeVisible();
  const items = check(page).getByRole("link");
  await expect(items.first()).toContainText("Unsalted butter, soft");
  await expect(items.first()).toContainText("— g");
  // At most 5 on mobile, then Show 2 more; all 7 on desktop.
  await expect(items.filter({ visible: true })).toHaveCount(mobile() ? 5 : 7);
  if (mobile()) {
    await page.getByRole("button", { name: "Show 2 more" }).click();
    await expect(items.filter({ visible: true })).toHaveCount(7);
  }
  await expect(check(page).getByRole("link", { name: /Whole milk/ })).toContainText("from ½ cup");
  await expect(check(page).getByRole("link", { name: /Whole milk/ })).toContainText("120 g");
  // Converted rows don't carry an "Estimated" tag; Estimated ones do.
  await expect(check(page).getByRole("link", { name: /Whole milk/ }).getByText("Estimated")).toHaveCount(0);
  await expect(check(page).getByRole("link", { name: /Caster sugar/ }).getByText("Estimated")).toBeVisible();
  // Confirming one doesn't jump the list: it stays in place with a filled check.
  const sugarCheck = check(page).getByRole("checkbox", { name: /Confirm Caster sugar/ });
  await sugarCheck.click();
  await expect(sugarCheck).toHaveAttribute("aria-checked", "true");
  await expect(check(page).getByRole("heading", { name: "Check 6 amounts" })).toBeVisible();
  await expect(check(page).getByRole("link", { name: /Caster sugar/ })).toBeVisible();
  // These look right confirms every remaining Estimated/Converted row, not Missing.
  await page.getByRole("button", { name: "These look right" }).click();
  await expect(check(page).getByRole("heading", { name: "Check 2 amounts" })).toBeVisible();
  await expect(check(page).getByRole("checkbox")).toHaveCount(5); // all 5 stay visible, all confirmed
  await expect(check(page).getByRole("checkbox", { name: /^Confirm/ }).first()).toHaveAttribute("aria-checked", "true");
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

test("Source shows the real reel thumbnail once copied; a draft without one keeps the placeholder", async ({ page }) => {
  // d-babka carries a picture (SKELETON 1.4.6's first-open copy); d-canele doesn't —
  // still importing, not yet copied, or a failed copy all look the same either way.
  await ready(page, BABKA);
  await expect(page.getByTestId("reel-thumbnail")).toHaveAttribute("data-status", "loaded");

  await ready(page, "/import/d-canele");
  await expect(page.getByTestId("reel-thumbnail")).toHaveAttribute("data-status", "error");
});

test("Source as record rows: reel row, caption preview, play badge, and the countdown numeral", async ({ page }) => {
  await ready(page, BABKA);
  const card = page.getByTestId("source-card");
  // "Source" itself is a visually hidden H2; the card carries the content.
  await expect(page.getByRole("heading", { name: "Source", level: 2 })).toHaveCSS("position", "absolute"); // sr-only
  // reel row: handle + Watch reel, both opening the same reel.
  await expect(card.getByText("@braided.bea")).toBeVisible();
  await expect(card.getByRole("link", { name: "Watch reel" })).toHaveAttribute("href", /instagram\.com\/reel\/Cbabka22/);
  // The whole thumbnail, including its play badge, is one link naming the creator.
  const watchReel = card.getByRole("link", { name: "Watch @braided.bea's reel" });
  await expect(watchReel).toHaveAttribute("href", /instagram\.com\/reel\/Cbabka22/);
  await expect(watchReel.getByTestId("reel-thumbnail")).toBeVisible();
  // caption row: first 2 lines, clamped (no language row — this draft isn't translated).
  await expect(card.getByText("The babka that broke my feed")).toBeVisible();
  await expect(page.getByText("Spanish, translated")).toHaveCount(0);

  // The countdown numeral: decorative, counts down, and a solid check at zero.
  const numeral = page.getByText("07", { exact: true });
  await expect(numeral).toHaveAttribute("aria-hidden", "true");
  await check(page).getByRole("checkbox", { name: /Confirm Caster sugar/ }).click();
  await expect(page.getByText("06", { exact: true })).toBeVisible();
  await expect(numeral).toHaveCount(0);
});

test("original caption: Read more expands in place, Show less collapses", async ({ page }) => {
  await ready(page, BABKA);
  await expect(page.getByText("Original caption")).toHaveCount(0);
  const toggle = page.getByRole("button", { name: "Read more" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(page.getByText("Original caption")).toBeVisible();
  const less = page.getByRole("button", { name: "Show less" });
  await expect(less).toHaveAttribute("aria-expanded", "true");
  // Expanding doesn't move focus. (In WebKit the click doesn't focus the button to begin with.)
  if (!phoneWebKit()) await expect(less).toBeFocused();
  await expect(page.locator("#caption-d-babka").getByText("broke my feed")).toBeVisible();
  await page.locator("#source-heading").scrollIntoViewIfNeeded();
  await shot(page, "03-transcript-expanded");
  await less.click();
  await expect(page.getByRole("button", { name: "Read more" })).toBeVisible();
});

test("original caption: Translated from label, and a cut-off notice", async ({ page }) => {
  await ready(page, "/import/d-tiramisu");
  // The source-card's own "language" row, visible without expanding anything.
  await expect(page.getByText("Spanish, translated")).toBeVisible();
  await page.getByRole("button", { name: "Read more" }).click();
  await expect(page.getByText("Original caption · Translated from Spanish")).toBeVisible();
  await expect(page.getByText("Instagram cut this caption off.")).toHaveCount(0);

  await ready(page, "/import/d-triple-chocolate-tart");
  await expect(page.getByText("French, translated")).toBeVisible();
  await expect(page.getByText("Instagram cut this caption off. Check the reel for the rest.")).toBeVisible();
  await page.getByRole("button", { name: "Read more" }).click();
  await expect(page.getByText("Original caption · Translated from French")).toBeVisible();
  await shot(page, "04-cut-off-notice");
});

test("Tips group: last, unnumbered, no time chips or Uses line", async ({ page }) => {
  await ready(page, "/import/d-tiramisu");
  const tipsGroup = page.getByRole("group").filter({ hasText: "Tips" });
  await tipsGroup.scrollIntoViewIfNeeded();
  await shot(page, "06-tips-group");

  // its one row is labeled "Tip 1" for assistive tech, not "Step 8"
  await expect(page.getByRole("textbox", { name: "Tip 1" })).toBeVisible();
  await expect(tipsGroup.getByText(/^\d+$/)).toHaveCount(0); // no visible step number
  await expect(tipsGroup.getByText("Uses:")).toHaveCount(0);
  await expect(tipsGroup.getByText("min", { exact: false })).toHaveCount(0); // no detected-time chip

  // a numbered step keeps its number and Uses line right above the Tips group
  await expect(page.getByRole("textbox", { name: "Step 7" })).toBeVisible();
});

test("Couldn't finish: a notice with Retry, and an otherwise-empty editor", async ({ page }) => {
  // The import key first, so Retry's poll below never needs a navigation away from
  // the draft — the whole point of BONES-import-detail 1.4.4's fix.
  await ready(page, "/import");
  const toggle = page.getByRole("button", { name: "Set up the Shortcut" });
  if (await toggle.count()) await toggle.click();
  await page.getByRole("button", { name: "Create import key" }).click();
  const importKey = await page.getByRole("textbox", { name: "Import key" }).inputValue();

  await ready(page, "/import/d-failed");
  await expect(page.getByText("This import didn’t finish reading the recipe.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("");
  await shot(page, "05-couldnt-finish");

  // Retry stays on this page and polls, instead of navigating to the Library: on the
  // iPhone, immediately navigating away in the same tick as setting location.href to
  // shortcuts:// was the likely cause of the Shortcut never opening there (desktop
  // Safari tolerated it). No navigation until the result is ready.
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page).toHaveURL(/\/import\/d-failed$/);
  await expect(page.getByText("Retrying in the Shortcut")).toBeVisible();
  const tryAgain = page.getByRole("button", { name: "Try again" });
  await expect(tryAgain).toBeVisible();
  await shot(page, "06-retrying");

  // The Shortcut's own calls, driven directly the way a real device would:
  // import_begin finds the draft by reel_url and reuses its stored caption; finish
  // supplies the recipe this time. The page's own poll should pick both up live.
  const start = await page.request.post("/api/import/start", { data: { url: "https://www.instagram.com/reel/Ccouldntfinish01/", importKey, again: true } });
  const { status, draftId } = await start.json();
  expect(status).toBe("started");
  expect(draftId).toBe("d-failed");
  const reply = JSON.stringify({
    language: "English",
    title: "Weekend Scones",
    category: "quick-bread",
    yield: { quantity: 8, unit: "scone", unitPlural: "scones" },
    totalTime: null,
    ingredientGroups: [{ name: null, items: [{ name: "Flour", amount: "300 g", parts: [{ unit: "g", qty: "300" }], note: null }] }],
    stepGroups: [{ name: null, steps: [{ text: "Bake.", uses: ["Flour"] }] }],
  });
  await page.request.post("/api/import/finish", { data: { draftId, importKey, reply } });

  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Weekend Scones", { timeout: 8000 });
  await expect(page.getByText("Retrying in the Shortcut")).toHaveCount(0);
  await expect(page.getByText("This import didn’t finish reading the recipe.")).toHaveCount(0);
});

test("Couldn't finish: Retry that fails again shows the notice once more, without a reload", async ({ page }) => {
  await ready(page, "/import");
  const toggle = page.getByRole("button", { name: "Set up the Shortcut" });
  if (await toggle.count()) await toggle.click();
  await page.getByRole("button", { name: "Create import key" }).click();
  const importKey = await page.getByRole("textbox", { name: "Import key" }).inputValue();

  await ready(page, "/import/d-failed");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Retrying in the Shortcut")).toBeVisible();

  const start = await page.request.post("/api/import/start", { data: { url: "https://www.instagram.com/reel/Ccouldntfinish01/", importKey, again: true } });
  const { draftId } = await start.json();
  // A malformed reply: the automatic retry-once (server-side) uses its one retry here
  // too, then gives up — the page's poll should see "failed" and show the notice again.
  await page.request.post("/api/import/finish", { data: { draftId, importKey, reply: "not json" } });
  await page.request.post("/api/import/finish", { data: { draftId, importKey, reply: "still not json" } });

  await expect(page.getByText("This import didn’t finish reading the recipe.")).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("Retrying in the Shortcut")).toHaveCount(0);
  // Retry is available again, not a dead end.
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("an ingredient group with Missing, Estimated, and Converted rows", async ({ page }) => {
  await ready(page, BABKA);
  const dough = page.getByRole("group", { name: "Dough" }).first();
  await expect(dough.getByText("! Missing")).toHaveCount(2);
  await expect(dough.getByRole("switch", { name: /To taste/ })).toHaveCount(2);
  // BONES-import-detail 1.5.0: no Confirm button or marker chip in the editor row
  // any more (confirming moved to Needs Your Check); a flagged row keeps one muted
  // "from X" line instead, with the marker glyph folded into it.
  await expect(dough.getByText("= Converted", { exact: true })).toHaveCount(0);
  await expect(dough.getByText("~ Estimated", { exact: true })).toHaveCount(0);
  await expect(dough.getByRole("button", { name: /^Confirm/ })).toHaveCount(0);
  await expect(dough.getByText("from ½ cup")).toBeVisible();
  // Placeholders on empty fields; Missing amounts show "0".
  await expect(amount(page, "Fine salt")).toHaveAttribute("placeholder", "—");
  // The amount box (grams), or whatever replaces it (To taste's toggle, on a row
  // with nothing else), shares one right edge down the whole group, whether the row
  // is clean, flagged with a muted "from X" line below it, or Missing.
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
  // Desktop: To taste is the only control left in the status column (Missing rows
  // only, now that Confirm is gone), still lined up at its right edge.
  if (!mobile()) {
    const rights = await dough.locator("li").evaluateAll((rows) =>
      rows
        .map((li) => li.querySelector<HTMLElement>("button[role=switch]"))
        .filter(Boolean)
        .map((b) => Math.round(b!.getBoundingClientRect().right)),
    );
    expect(rights.length).toBe(2);
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
  // A resolved Missing row leaves right away.
  await expect(check(page).getByRole("heading", { name: "Check 6 amounts" })).toBeVisible();
  await expect(check(page).getByRole("link", { name: /Unsalted butter/ })).toHaveCount(0);
  await expect(check(page).getByRole("status")).toHaveText("Unsalted butter, soft checked. 6 left.");

  // Confirming a check-row keeps it in place (filled check) without changing the
  // value, and no longer counts toward the heading.
  const sugarCheck = check(page).getByRole("checkbox", { name: /Confirm Caster sugar/ });
  await sugarCheck.click();
  await expect(check(page).getByRole("heading", { name: "Check 5 amounts" })).toBeVisible();
  await expect(check(page).getByRole("link", { name: /Caster sugar/ })).toBeVisible();
  await expect(sugarCheck).toHaveAttribute("aria-checked", "true");
  await expect(amount(page, "Caster sugar")).toHaveValue("100");
  await expect(check(page).getByRole("status")).toHaveText("Caster sugar confirmed. 5 left.");

  // To taste resolves a Missing amount, and it leaves too.
  await page.getByRole("switch", { name: "To taste, Fine salt" }).click();
  await expect(check(page).getByRole("heading", { name: "Check 4 amounts" })).toBeVisible();
  await expect(check(page).getByRole("link", { name: /Fine salt/ })).toHaveCount(0);
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
  // The record card renders twice (mobile/tablet's stacked Hero, desktop's split hero);
  // scoped to the one actually on screen, same reasoning as recipe.spec.ts's visiblePictures.
  const card = page.locator('[data-testid="record-card"]:visible');
  await expect(card.getByText("2 loaves")).toBeVisible();
  await expect(card.getByText("@braided.bea")).toBeVisible();
  // It left Drafts and joined the Library (Drafts is a view tab now, not shown by default).
  await page.goto("/recipes");
  await expect(page.locator("#recipes-heading ~ ul > li").first()).toContainText("Chocolate tahini babka");
  await page.getByRole("tab", { name: /^Drafts/ }).click();
  await expect(page.locator("#drafts-heading ~ ul")).not.toContainText("Chocolate tahini babka");
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
  await page.getByRole("tab", { name: /^Drafts/ }).click(); // Drafts is a view tab now, not shown by default
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

test("ingredient notes: add, edit, and remove from the row menu", async ({ page }) => {
  await ready(page, "/recipes/pasteis-de-nata/edit");
  const menu = page.getByRole("button", { name: "More actions, Egg yolks" });
  await expect(page.getByText("Creator: the fresher the eggs, the brighter the custard")).toBeVisible();

  // Edit: the field starts with the note and has focus; Esc keeps it; focus returns to the menu.
  await menu.click();
  await page.getByRole("menuitem", { name: "Edit note" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit note" });
  const field = dialog.getByRole("textbox", { name: "Note for Egg yolks" });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Creator: the fresher the eggs, the brighter the custard");
  await expect(field).toHaveAttribute("maxlength", "300");
  await expectFitsContent(page, "Edit note");
  await page.waitForTimeout(350);
  await shot(page, "13-edit-note");
  await field.fill("Changed, then cancelled");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menu).toBeFocused();
  await expect(page.getByText("Creator: the fresher the eggs, the brighter the custard")).toBeVisible();

  // Saved empty: the note is removed, and the menu offers Add note.
  await menu.click();
  await page.getByRole("menuitem", { name: "Edit note" }).click();
  await dialog.getByRole("textbox").fill("  ");
  await dialog.getByRole("button", { name: "Save note" }).click();
  await expect(menu).toBeFocused();
  await expect(page.getByText(/the brighter the custard/)).toHaveCount(0);

  // Add note on another ingredient, then save the recipe: it shows on the Recipe page.
  await page.getByRole("button", { name: "More actions, Whole milk" }).click();
  await page.getByRole("menuitem", { name: "Add note" }).click();
  const add = page.getByRole("dialog", { name: "Add note" });
  await add.getByRole("textbox", { name: "Note for Whole milk" }).fill("Full fat only");
  await add.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("button", { name: "More actions, Whole milk" })).toBeFocused();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata$/);
  await expect(page.getByRole("listitem").filter({ hasText: "Whole milk" }).getByText("Full fat only")).toBeVisible();
  await expect(page.getByText(/the brighter the custard/)).toHaveCount(0);
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
  // Scoped to the visible record card: it renders twice (mobile/tablet's stacked Hero,
  // desktop's split hero), and the hidden copy would otherwise double-match too.
  const kouignCard = page.locator('[data-testid="record-card"]:visible');
  await expect(kouignCard.getByText("@Cprivate9").or(kouignCard.getByText("Watch reel"))).toBeVisible();
});

test("edit recipe: Needs Your Check panel, confirm an estimate, leave guard, delete", async ({ page }) => {
  await ready(page, "/recipes/pasteis-de-nata/edit");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Edit recipe");
  await expect(page.getByRole("link", { name: "Pastéis de nata" })).toHaveAttribute("href", "/recipes/pasteis-de-nata");
  await expect(page.getByText("Suggested")).toHaveCount(0);

  // BONES-import-detail 1.6.1: Edit shows the same Needs Your Check panel as Review
  // Import, without Source, whenever something's unconfirmed; no editor Confirm
  // button any more, so this is the only way to confirm an amount here.
  await expect(check(page).getByRole("heading", { name: "Check 2 amounts" })).toBeVisible();
  await expect(check(page).getByTestId("source-card")).toHaveCount(0);
  const yolksCheck = check(page).getByRole("checkbox", { name: /Confirm Egg yolks/ });

  // Leaving with unsaved changes asks first.
  await yolksCheck.click();
  await expect(check(page).getByRole("heading", { name: "Check 1 amount" })).toBeVisible();
  await page.getByRole("link", { name: "Pastéis de nata" }).click();
  const leave = page.getByRole("dialog", { name: "Leave without saving?" });
  await expect(leave).toBeVisible();
  await expectDestructiveConfirmation(page, "Leave without saving?", "Leave", "Keep editing");
  await leave.getByRole("button", { name: "Keep editing" }).click();

  // Confirming the last one hides the panel (unlike Review Import, which still
  // shows "Everything checked"): nothing's left to check.
  await check(page).getByRole("checkbox", { name: /Confirm Caster sugar/ }).click();
  await expect(page.getByRole("heading", { name: /Check \d+ amount/ })).toHaveCount(0);
  await expect(page.getByText("Everything checked")).toHaveCount(0);

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForURL(/\/recipes\/pasteis-de-nata$/);
  await expect(page.getByText("1 amount is an estimate.")).toHaveCount(0);
  // The record card's rating row: a Bakes-section row can coincidentally carry the same
  // "Rated 4" text too, so the row's own "jump to Bakes" suffix picks it out uniquely.
  // getByRole, not a CSS locator: the record card renders twice (mobile/tablet's stacked
  // Hero, desktop's split hero), and only getByRole is scoped to the one on screen.
  await expect(page.getByRole("link", { name: /Rated 4 out of 5, jump to Bakes/ })).toBeVisible(); // rating kept (read-only on the Recipe page)

  await ready(page, "/recipes/pasteis-de-nata/edit");
  await page.getByRole("button", { name: "Delete recipe" }).click();
  await expectDestructiveConfirmation(page, "Delete this recipe?", "Delete recipe", "Keep recipe");
  await page.waitForTimeout(350);
  await shot(page, "12-delete-recipe");
  await page.getByRole("dialog", { name: "Delete this recipe?" }).getByRole("button", { name: "Delete recipe" }).click();
  await page.waitForURL(/\/recipes$/);
  await expect(page.locator("#recipes-heading ~ p[aria-live]")).toHaveText("33 recipes");
});

test("edit recipe: arriving from Confirm it scrolls to and focuses the panel", async ({ page }) => {
  await page.goto("/recipes/pasteis-de-nata/edit#check-heading");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await expect(check(page).getByRole("heading", { name: "Check 2 amounts" })).toBeFocused();
});

test("new recipe never shows Needs Your Check", async ({ page }) => {
  // Amounts typed by hand are confirmed as typed (BONES-import-detail 1.6.1), so
  // there's nothing for New to ever check — no panel, in any state.
  await ready(page, "/recipes/new");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("New recipe");
  await expect(page.getByRole("heading", { name: /Check \d+ amount/ })).toHaveCount(0);
});
