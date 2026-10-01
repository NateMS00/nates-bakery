import { expect, test, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, ready } from "./helpers";

// /recipes (Library): every state and overlay in BONES-recipes.md. Fixture sets:
// full on :3100 (34 recipes, 4 drafts), latency on :3101, empty on :3102, only drafts on :3103.

const shot = (page: Page, name: string, fullPage = false) => capture(page, "library", name, fullPage);

// Favorites set on the Recipe page are saved on the server: each test has its own copy
// of the fixtures (namespace cookie).
test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101, 3102, 3103]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});
const count = (page: Page) => page.locator("#recipes-heading ~ p[aria-live]");
const items = (page: Page) => page.locator("#recipes-heading ~ ul > li");

test("default: drafts, 30 recipes, Show more", async ({ page }) => {
  await ready(page, "/recipes");
  await shot(page, "01-first-viewport");
  await shot(page, "02-full", true);
  await expectPageBasics(page);
  await expectPageTop(page);
  await expectTouchTargets(page);
  await expect(page.getByLabel("Search", { exact: true })).toHaveAttribute("placeholder", "Recipe or ingredient");

  // Library is the current nav item (the link shows from tablet up; the wordmark is Library on mobile).
  if (!test.info().project.use.isMobile) await expect(page.getByRole("link", { name: "Library", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(count(page)).toHaveText("34 recipes");
  // Most recently baked or added first: brown butter cookies were added 29 Sep, brownies baked 28 Sep.
  await expect(items(page).first()).toContainText("Fudgy brownies");

  // Drafts: 2 rows on mobile, 3 from tablet up, then Show all drafts (4); Importing isn't a link.
  const drafts = page.locator("#drafts-heading ~ ul > li").filter({ visible: true });
  await expect(drafts).toHaveCount(test.info().project.use.isMobile ? 2 : 3);
  await expect(drafts.first()).toContainText("@kouign.kate's reel");
  await expect(drafts.first().getByRole("link")).toHaveCount(0);
  await expect(drafts.nth(1).getByRole("link")).toHaveAttribute("href", "/import/d-babka");
  await page.getByRole("button", { name: "Show all drafts (4)" }).click();
  await expect(drafts).toHaveCount(4);

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
  await expectFocusRings(page, 16);
});

test("an importing draft becomes Ready to review without a reload", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile-light", "timing test runs once");
  await ready(page, "/recipes");
  const row = page.locator("#drafts-heading ~ ul > li").first();
  await expect(row).toContainText("Importing…");
  await expect(row.getByRole("link", { name: /Kouign-amann/ })).toBeVisible({ timeout: 12_000 });
  await expect(page.locator("#drafts-heading ~ p[role=status]")).toHaveText("Kouign-amann is ready to review.");
});

test("search by title or ingredient writes ?q= and hides Drafts", async ({ page }) => {
  await ready(page, "/recipes");
  const field = page.getByLabel("Search", { exact: true });
  await field.fill("pasteis");
  await expect(page).toHaveURL(/q=pasteis/);
  await expect(count(page)).toHaveText("1 of 34 recipes");
  await expect(items(page).first()).toContainText("Pastéis de nata");
  await expect(page.locator("#drafts-heading")).toHaveCount(0);
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

test("desktop filters row applies immediately", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop and tablet only");
  await ready(page, "/recipes");
  await expect(page.getByRole("button", { name: /^Filters/ })).toBeHidden();
  const category = page.getByLabel("Category");
  await expect(category.locator("option")).toHaveText([
    "All categories", "Bread (4)", "Viennoiserie (4)", "Quick bread (4)", "Cake (6)", "Cookie & bar (5)", "Pie & tart (4)", "Pastry (4)", "Dessert (3)",
  ]); // "Other" has no recipes, so it isn't offered
  await category.selectOption("cake");
  await page.getByRole("group", { name: "Status" }).getByRole("button", { name: "Baked", exact: true }).click();
  await page.getByRole("switch", { name: "Favorites" }).click();
  await page.getByLabel("Rating").selectOption("4");
  await expect(page).toHaveURL(/category=cake/);
  await expect(page).toHaveURL(/status=baked/);
  await expect(page).toHaveURL(/favorite=1/);
  await expect(page).toHaveURL(/rating=4/);
  await expect(count(page)).toHaveText("1 of 34 recipes");
  await expect(items(page).first()).toContainText("Burnt Basque cheesecake");
  await shot(page, "03-filters-row");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(count(page)).toHaveText("34 recipes");
});

test("mobile Filters sheet applies on Show n recipes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await ready(page, "/recipes");
  await expect(page.getByLabel("Category")).toBeHidden();
  const button = page.getByRole("button", { name: /^Filters/ });
  await button.click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Close" })).toHaveCount(1);
  // About three quarters of the viewport, with the footer pinned.
  // Sized to its content, and all four filters fit on 390 × 844 without scrolling.
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
  await shot(page, "04-filters-sheet");

  await sheet.getByRole("radio", { name: /Cake/ }).click();
  await sheet.getByRole("switch", { name: "Favorites" }).click();
  await expect(sheet.getByRole("button", { name: "Show 2 recipes" })).toBeVisible(); // live count: basque cheesecake, lemon drizzle
  await expect(count(page)).toHaveText("34 recipes"); // not applied yet
  await shot(page, "05-filters-sheet-chosen");

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
  await shot(page, "06-active-chips");
  await page.getByRole("button", { name: "Remove filter: Cake" }).click();
  await expect(page).not.toHaveURL(/category/);
});

test("tablet: the filter row wraps to two lines at 768px instead of overflowing", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop-light", "runs once, at 768");
  await page.setViewportSize({ width: 768, height: 1024 });
  await ready(page, "/recipes?category=cake&favorite=1");
  const row = page.getByRole("group", { name: "Filters" });
  const box = await row.evaluate((el) => ({ h: el.getBoundingClientRect().height, overflow: el.scrollWidth - el.clientWidth }));
  expect(box.overflow).toBeLessThanOrEqual(0);
  expect(box.h).toBeGreaterThan(100); // two lines (one line is about 72px)
  await expectPageBasics(page);
  await expectPageTop(page);
  await shot(page, "11-tablet-768-filters");
});

test("no results offers Clear search and Clear filters", async ({ page }) => {
  await ready(page, "/recipes?q=croissant&status=not-baked");
  await expect(count(page)).toHaveText("No matches out of 34 recipes");
  await expect(page.getByText("Nothing matches")).toBeVisible();
  await expect(page.locator("#drafts-heading")).toHaveCount(0);
  await shot(page, "07-no-results");
  await page.getByRole("button", { name: "Clear filters" }).last().click();
  await expect(count(page)).toHaveText("1 of 34 recipes");
  await page.goto("/recipes?q=croissant&status=not-baked");
  await page.getByRole("button", { name: "Clear search" }).last().click();
  await expect(page.getByLabel("Search", { exact: true })).toHaveValue("");
  await expect(count(page)).toHaveText("8 of 34 recipes");
});

test("invalid query values are ignored", async ({ page }) => {
  await ready(page, "/recipes?category=pizza&status=burnt&rating=9&favorite=yes");
  await expect(count(page)).toHaveText("34 recipes");
  await expect(page.locator("#drafts-heading")).toBeVisible();
});

test("a favorite set on the Recipe page shows in the list", async ({ page }) => {
  await ready(page, "/recipes?q=victoria");
  await items(page).first().getByRole("link").click();
  await page.getByRole("button", { name: "Favorite" }).click();
  await page.getByRole("link", { name: "Library" }).first().click();
  await expect(items(page).first()).toContainText("Favorite");
});

test("empty: no recipes and no drafts", async ({ page }) => {
  await ready(page, "http://localhost:3102/recipes");
  await expect(page.getByText("Save your first recipe from a reel")).toBeVisible();
  await expect(page.getByRole("link", { name: "Import from a reel" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Set up Share from Instagram" })).toHaveAttribute("href", "/import#share-from-instagram");
  await expect(page.getByLabel("Search", { exact: true })).toHaveCount(0);
  await expect(page.locator("h2")).toHaveCount(0);
  await expectPageBasics(page);
  await expectTouchTargets(page);
  await shot(page, "08-empty");
});

test("only drafts", async ({ page }) => {
  await ready(page, "http://localhost:3103/recipes");
  await expect(page.getByLabel("Search", { exact: true })).toHaveCount(0);
  await expect(page.locator("#drafts-heading")).toBeVisible();
  await expect(page.getByText("No saved recipes yet")).toBeVisible();
  await shot(page, "09-only-drafts");
});

test("loading", async ({ page }) => {
  await page.goto("http://localhost:3101/recipes", { waitUntil: "commit" });
  await page.getByText("Loading recipes").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "10-loading");
});

test("recipe links are named title first", async ({ page }) => {
  await ready(page, "/recipes");
  await expect(items(page).first().getByRole("link")).toHaveAccessibleName("Fudgy brownies, Cookie & bar, rated 5 out of 5, favorite, Baked Mon 28 Sep");
  await expect(page.getByRole("link", { name: "Lemon bars, Cookie & bar, not rated, Not baked yet" })).toBeVisible();
});
