import { expect, test, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, ready } from "./helpers";

// /recipes (Library), BONES-recipes.md 1.5.0: Search, Filters, the Recipes ·
// Favorites · Drafts view tabs, and the active view's panel (a photo grid of
// recipe-tiles, or the drafts list). Fixture sets: full on :3100 (34 recipes, 7
// drafts), latency on :3101, empty on :3102, only drafts on :3103.

const shot = (page: Page, name: string, fullPage = false) => capture(page, "library", name, fullPage);

// Favorites set on the Recipe page are saved on the server: each test has its own copy
// of the fixtures (namespace cookie).
test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101, 3102, 3103]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});
const count = (page: Page) => page.locator("#recipes-heading ~ p[aria-live]");
const items = (page: Page) => page.locator("#recipes-heading ~ ul > li");
const drafts = (page: Page) => page.locator("#drafts-heading ~ ul > li");
const viewTab = (page: Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) });

test("default: Recipes view, 30 recipes, Show more", async ({ page }) => {
  await ready(page, "/recipes");
  await shot(page, "01-first-viewport");
  await shot(page, "02-full", true);
  await expectPageBasics(page);
  await expectPageTop(page);
  await expectTouchTargets(page);
  await expect(page.getByLabel("Search", { exact: true })).toHaveAttribute("placeholder", "Recipe or ingredient");
  await expect(viewTab(page, "Recipes")).toHaveAttribute("aria-selected", "true");
  await expect(viewTab(page, "Drafts")).toHaveText("Drafts7");

  // Library is the current nav item (the link shows from tablet up; the wordmark is Library on mobile).
  if (!test.info().project.use.isMobile) await expect(page.getByRole("link", { name: "Library", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(count(page)).toHaveText("34 recipes");
  // Most recently baked or added first: brown butter cookies were added 29 Sep, brownies baked 28 Sep.
  await expect(items(page).first()).toContainText("Fudgy brownies");
  await expect(page.locator("#drafts-heading")).toHaveCount(0); // Drafts is a separate view

  // 30 items, then Show more loads the rest and focuses the first new one.
  await expect(items(page)).toHaveCount(30);
  await page.getByRole("button", { name: "Show more" }).click();
  await expect(items(page)).toHaveCount(34);
  await expect(items(page).nth(30).getByRole("link")).toBeFocused();
  await expect(page.getByRole("button", { name: "Show more" })).toHaveCount(0);
});

test("focus rings", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard focus checked on desktop");
  await ready(page, "/recipes");
  await expectFocusRings(page, 15);
});

test("Drafts view: all 7 drafts show, no cap", async ({ page }) => {
  await ready(page, "/recipes");
  await viewTab(page, "Drafts").click();
  await expect(page).toHaveURL(/view=drafts/);
  await expect(drafts(page)).toHaveCount(7);
  await expect(drafts(page).first()).toContainText("@kouign.kate's reel");
  await expect(drafts(page).first().getByRole("link")).toHaveCount(0); // Importing isn't a link yet
  await expect(drafts(page).nth(1).getByRole("link")).toHaveAttribute("href", "/import/d-babka");
  // Search and Filters hide on Drafts.
  await expect(page.getByLabel("Search", { exact: true })).toHaveCount(0);
  await expectTouchTargets(page);
  await shot(page, "03-drafts-view");

  // Switching back to Recipes keeps whatever search/filters were set before (BONES).
  await page.goto("/recipes?view=drafts&q=pasteis&category=pastry");
  await viewTab(page, "Recipes").click();
  await expect(page.getByLabel("Search", { exact: true })).toHaveValue("pasteis");
  await expect(page).toHaveURL(/category=pastry/);
});

/** A minimal, valid Use Model reply (lib/import/extract.ts's expected shape). */
const VALID_REPLY = JSON.stringify({
  language: "English",
  title: "Kouign-amann",
  category: "viennoiserie",
  yield: { quantity: 12, unit: "pastry", unitPlural: "pastries" },
  totalTime: { hours: 4, minutes: 0 },
  ingredientGroups: [{ name: null, items: [{ name: "Flour", amount: "300 g", parts: [{ unit: "g", qty: "300" }], note: null }] }],
  stepGroups: [{ name: null, steps: [{ text: "Laminate the dough.", uses: ["Flour"] }] }],
});

test("an importing draft becomes Ready to review without a reload", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile-light", "timing test runs once");
  // Creating the import key needs /import; d-importing's reel (Ckouign01) is seeded
  // there already, with its status still "importing" and no caption.
  await ready(page, "/import");
  const toggle = page.getByRole("button", { name: "Set up the Shortcut" });
  if (await toggle.count()) await toggle.click();
  await page.getByRole("button", { name: "Create import key" }).click();
  const importKey = await page.getByRole("textbox", { name: "Import key" }).inputValue();

  await ready(page, "/recipes?view=drafts");
  const row = drafts(page).first();
  await expect(row).toContainText("Importing…");

  // The real calls a Shortcut makes, driving d-importing (not a new draft, same id:
  // import_begin reuses it since it already exists with that reel and no caption yet)
  // through to ready — the same round trip the Library's polling (lib/data/store.ts)
  // is meant to notice without a reload.
  const start = await page.request.post("/api/import/start", { data: { url: "https://www.instagram.com/reel/Ckouign01/", importKey } });
  const { draftId } = await start.json();
  expect(draftId).toBe("d-importing");
  await page.request.post("/api/import/finish", { data: { draftId, importKey, reply: VALID_REPLY } });

  await expect(row.getByRole("link", { name: /Kouign-amann/ })).toBeVisible({ timeout: 8_000 });
  await expect(page.locator("#drafts-heading ~ p[role=status]")).toHaveText("Kouign-amann is ready to review.");
  await expect(viewTab(page, "Drafts")).toHaveText("Drafts7"); // the tab's count updates too
});

test("Discard removes the row at once, with Undo", async ({ page }) => {
  await ready(page, "/recipes?view=drafts");
  const first = drafts(page).first();
  const firstTitle = await first.locator("span").first().textContent();
  await expect(first.getByRole("button", { name: `Discard draft: ${firstTitle}` })).toBeVisible();

  await first.getByRole("button", { name: `Discard draft: ${firstTitle}` }).click();
  await expect(first).not.toContainText(firstTitle!);
  await expect(viewTab(page, "Drafts")).toHaveText("Drafts6");
  const confirmation = page.locator("#drafts-heading ~ div[role=status]");
  await expect(confirmation).toContainText("Draft discarded");
  await page.waitForTimeout(300); // let the fade-in settle before the screenshot
  await shot(page, "04-draft-discarded");

  // Undo puts it back where it was, first in the list.
  await confirmation.getByRole("button", { name: "Undo" }).click();
  await expect(drafts(page).first()).toContainText(firstTitle!);
  await expect(confirmation).toHaveCount(0);
  await expect(viewTab(page, "Drafts")).toHaveText("Drafts7");
});

test("discarding the last draft hides the Drafts tab and moves focus to Recipes", async ({ page }) => {
  await ready(page, "/recipes?view=drafts");
  while ((await drafts(page).count()) > 0) {
    const n = await drafts(page).count();
    const label = await drafts(page).first().locator("span").first().textContent();
    await drafts(page).first().getByRole("button", { name: `Discard draft: ${label}` }).click();
    if (n === 1) break;
    await expect(drafts(page)).toHaveCount(n - 1);
  }
  await expect(viewTab(page, "Recipes")).toBeFocused();
  await expect(viewTab(page, "Recipes")).toHaveAttribute("aria-selected", "true");
  await expect(viewTab(page, "Drafts")).toHaveCount(0);
  await expect(page).not.toHaveURL(/view=drafts/);
});

test("search by title or ingredient writes ?q=", async ({ page }) => {
  await ready(page, "/recipes");
  const field = page.getByLabel("Search", { exact: true });
  await field.fill("pasteis");
  await expect(page).toHaveURL(/q=pasteis/);
  await expect(count(page)).toHaveText("1 of 34 recipes");
  await expect(items(page).first()).toContainText("Pastéis de nata");
  // Ingredient match: only the croissants use cultured butter.
  await field.fill("cultured");
  await expect(count(page)).toHaveText("1 of 34 recipes");
  await expect(items(page).first()).toContainText("Croissants");
  // Clear control, and the value survives a refresh from the URL.
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(count(page)).toHaveText("34 recipes");
  await ready(page, "/recipes?q=lemon");
  await expect(field).toHaveValue("lemon");
  // Lemon drizzle, lemon bars, and pastéis de nata (lemon peel is an ingredient).
  await expect(count(page)).toHaveText("3 of 34 recipes");
});

test("desktop filters row applies immediately (no Favorites toggle — it's a view now)", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop and tablet only");
  await ready(page, "/recipes");
  await expect(page.getByRole("button", { name: /^Filters/ })).toBeHidden();
  await expect(page.getByRole("switch", { name: "Favorites" })).toHaveCount(0);
  const category = page.getByLabel("Category");
  await expect(category.locator("option")).toHaveText([
    "All categories", "Bread (4)", "Viennoiserie (4)", "Quick bread (4)", "Cake (6)", "Cookie & bar (5)", "Pie & tart (4)", "Pastry (4)", "Dessert (3)",
  ]); // "Other" has no recipes, so it isn't offered
  await category.selectOption("cake");
  await page.getByRole("group", { name: "Status" }).getByRole("button", { name: "Baked", exact: true }).click();
  await page.getByLabel("Rating").selectOption("4");
  await expect(page).toHaveURL(/category=cake/);
  await expect(page).toHaveURL(/status=baked/);
  await expect(page).not.toHaveURL(/favorite=1/);
  await expect(page).toHaveURL(/rating=4/);
  await expect(count(page)).toHaveText("3 of 34 recipes"); // victoria sponge, basque cheesecake, carrot cake — all 4★+ cakes, all already baked
  await shot(page, "05-filters-row");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(count(page)).toHaveText("34 recipes");
});

test("mobile Filters sheet applies on Show n recipes (no Favorites toggle)", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await ready(page, "/recipes");
  await expect(page.getByLabel("Category")).toBeHidden();
  const button = page.getByRole("button", { name: /^Filters/ });
  await button.click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Close" })).toHaveCount(1);
  await expect(sheet.getByRole("switch", { name: "Favorites" })).toHaveCount(0);
  // Sized to its content, and all three filters fit on 390 × 844 without scrolling.
  const fit = await sheet.evaluate((d) => {
    const body = d.children[2] as HTMLElement; // band+handle, header row, body, footer
    return { scrolls: body.scrollHeight > body.clientHeight + 1, ratio: d.getBoundingClientRect().height / window.innerHeight };
  });
  expect(fit.scrolls).toBe(false);
  expect(fit.ratio).toBeLessThanOrEqual(0.9);
  await expect(sheet.getByRole("radiogroup", { name: "Category" }).getByRole("radio")).toHaveCount(9);
  await expect(sheet.getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
  await expectTouchTargets(page);
  await page.waitForTimeout(350);
  await shot(page, "06-filters-sheet");

  await sheet.getByRole("radio", { name: /Cake/ }).click();
  await sheet.getByRole("radio", { name: "4 stars and up" }).click();
  await expect(sheet.getByRole("button", { name: "Show 3 recipes" })).toBeVisible(); // victoria sponge, basque cheesecake, carrot cake
  await expect(count(page)).toHaveText("34 recipes"); // not applied yet
  await shot(page, "07-filters-sheet-chosen");

  // Close discards.
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toBeHidden();
  await expect(button).toBeFocused();
  await expect(page).not.toHaveURL(/category/);

  await button.click();
  await sheet.getByRole("radio", { name: /Cake/ }).click();
  await sheet.getByRole("radio", { name: "4 stars and up" }).click();
  await sheet.getByRole("button", { name: /^Show \d+ recipes?$/ }).click();
  await expect(page).toHaveURL(/category=cake.*rating=4|rating=4.*category=cake/);
  await expect(button).toContainText("2");
  await expect(page.getByRole("button", { name: "Remove filter: Cake" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove filter: 4 stars and up" })).toBeVisible();
  await expectTouchTargets(page);
  await shot(page, "08-active-chips");
  await page.getByRole("button", { name: "Remove filter: Cake" }).click();
  await expect(page).not.toHaveURL(/category/);
});

test("tablet: the filter row wraps to two lines at 768px instead of overflowing", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop-light", "runs once, at 768");
  await page.setViewportSize({ width: 768, height: 1024 });
  await ready(page, "/recipes?category=cake&rating=4");
  const row = page.getByRole("group", { name: "Filters" });
  const box = await row.evaluate((el) => ({ h: el.getBoundingClientRect().height, overflow: el.scrollWidth - el.clientWidth }));
  expect(box.overflow).toBeLessThanOrEqual(0);
  expect(box.h).toBeGreaterThan(50); // two lines
  await expectPageBasics(page);
  await expectPageTop(page);
  await shot(page, "09-tablet-768-filters");
});

test("no results offers Clear search and Clear filters", async ({ page }) => {
  await ready(page, "/recipes?q=croissant&status=not-baked");
  await expect(count(page)).toHaveText("No matches out of 34 recipes");
  await expect(page.getByText("Nothing matches")).toBeVisible();
  await shot(page, "10-no-results");
  await page.getByRole("button", { name: "Clear filters" }).last().click();
  await expect(count(page)).toHaveText("1 of 34 recipes");
  await page.goto("/recipes?q=croissant&status=not-baked");
  await page.getByRole("button", { name: "Clear search" }).last().click();
  await expect(page.getByLabel("Search", { exact: true })).toHaveValue("");
  await expect(count(page)).toHaveText("8 of 34 recipes");
});

test("invalid query values are ignored", async ({ page }) => {
  await ready(page, "/recipes?category=pizza&status=burnt&rating=9&view=nonsense");
  await expect(count(page)).toHaveText("34 recipes");
  await expect(viewTab(page, "Recipes")).toHaveAttribute("aria-selected", "true");
});

test("?favorite=1 opens Favorites and rewrites the URL", async ({ page }) => {
  await ready(page, "/recipes?favorite=1");
  await expect(viewTab(page, "Favorites")).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/view=favorites/);
  await expect(page).not.toHaveURL(/favorite=1/);
});

test("Favorites view: a favorite set on the Recipe page shows there, with the heart in the grid", async ({ page }) => {
  await ready(page, "/recipes?q=victoria"); // not already a favorite, unlike several other fixtures
  await items(page).first().getByRole("link").click();
  await page.getByRole("button", { name: "Favorite" }).click();
  await page.getByRole("link", { name: "Library" }).first().click();
  await viewTab(page, "Favorites").click();
  // The heart is a decorative aria-hidden icon, not visible text — the tile's
  // accessible name carries "favorite" instead (RecipeTile.tsx).
  await expect(page.getByRole("link", { name: /Victoria sponge/ })).toHaveAccessibleName(/favorite/);
  await shot(page, "11-favorites-view");
});

// Every recipe the fixtures start with favorited — unfavorite them all first.
const SEEDED_FAVORITES = ["country-sourdough", "brioche", "cinnamon-buns", "banana-bread", "basque-cheesecake", "fudgy-brownies", "creme-brulee", "pasteis-de-nata", "lemon-drizzle-loaf"];

test("no favorites: one line, no grid", async ({ page }) => {
  for (const id of SEEDED_FAVORITES) {
    await ready(page, `/recipes/${id}`);
    const fav = page.getByRole("button", { name: "Favorite" });
    if ((await fav.getAttribute("aria-pressed")) === "true") await fav.click();
  }
  await ready(page, "/recipes?view=favorites");
  await expect(page.getByText("Tap the heart on a recipe to keep it here.")).toBeVisible();
  await expect(items(page)).toHaveCount(0);
  await shot(page, "12-no-favorites");
});

test("empty: no recipes and no drafts", async ({ page }) => {
  await ready(page, "http://localhost:3102/recipes");
  await expect(page.getByText("Save your first recipe from a reel")).toBeVisible();
  await expect(page.getByRole("link", { name: "Import from a reel" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Set up the Shortcut" })).toHaveAttribute("href", "/import#set-up-the-shortcut");
  await expect(page.getByLabel("Search", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.locator("h2")).toHaveCount(0);
  await expectPageBasics(page);
  await expectTouchTargets(page);
  await shot(page, "13-empty");
});

test("only drafts: opens on the Drafts view; Recipes tab says no saved recipes yet", async ({ page }) => {
  await ready(page, "http://localhost:3103/recipes");
  await expect(page).not.toHaveURL(/view=/); // the default, not written to the URL
  await expect(viewTab(page, "Drafts")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Search", { exact: true })).toHaveCount(0);
  await expect(drafts(page).first()).toBeVisible();
  await shot(page, "14-only-drafts");

  await viewTab(page, "Recipes").click();
  await expect(page.getByText("No saved recipes yet")).toBeVisible();
  await expect(page.getByLabel("Search", { exact: true })).toBeVisible(); // Search/Filters return outside Drafts
  await shot(page, "15-only-drafts-recipes-tab");
});

test("loading", async ({ page }) => {
  await page.goto("http://localhost:3101/recipes", { waitUntil: "commit" });
  await page.getByText("Loading recipes").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "16-loading");
});

test("recipe tiles are named title first; rating and baked date omitted when absent, same as the visual meta line", async ({ page }) => {
  await ready(page, "/recipes");
  await expect(items(page).first().getByRole("link")).toHaveAccessibleName("Fudgy brownies, Cookie & bar, rated 5 out of 5, favorite, Baked Mon 28 Sep");
  await expect(page.getByRole("link", { name: "Lemon bars, Cookie & bar", exact: true })).toBeVisible();
});

test("recipe picture: a loaded one, a hand-entered recipe with no picture, and a failed load side by side", async ({ page }) => {
  await ready(page, "/recipes?q=brown+butter+chocolate"); // brown butter chocolate chip cookies: no picture
  const noPicture = items(page).first().getByTestId("picture").filter({ visible: true });
  await expect(noPicture).toHaveAttribute("data-status", "error");
  await expect(noPicture.locator("img")).toHaveCount(0);
  await shot(page, "17-no-picture");

  await ready(page, "/recipes?q=cultured+butter+block"); // the croissants: a picture row with a missing file
  const broken = items(page).first().getByTestId("picture").filter({ visible: true });
  await expect(broken).toHaveAttribute("data-status", "error");
  await shot(page, "17b-picture-failed");

  await ready(page, "/recipes?q=lemon+drizzle");
  await expect(items(page).first().getByTestId("picture").filter({ visible: true })).toHaveAttribute("data-status", "loaded");
  await shot(page, "18-picture-pale-cover");
});
