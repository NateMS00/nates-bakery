import { expect, test, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageBasics, expectTouchTargets, phoneWebKit, ready } from "./helpers";

// /bakes (Bakes diary), BONES-bakes.md 1.2.0. A reading page: months newest first as
// Fraunces chapter headings; within a month, every bake is one bake-row (a photo or a
// date block as its lead square) — no photo grid, no azulejo squares. 40 at a time.

const shot = (page: Page, name: string, fullPage = false) => capture(page, "bakes", name, fullPage);

test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101, 3102]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});

test("diary: header, month chapters, rows, and page checks", async ({ page }) => {
  await ready(page, "/bakes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your bakes.");
  await expect(page.getByText(/^\d+ bakes? this year · \d+ recipes?$/)).toBeVisible();

  // Months newest first, as H2 chapter titles with a count.
  const months = page.getByRole("heading", { level: 2 });
  await expect(months.first()).toHaveText("September");
  await expect(page.getByText("15 bakes").first()).toBeVisible();

  // A bake with a photo: the lead is the photo, the meta line leads with the date.
  // Its accessible name spells out the weekday, month, star count and bake number.
  const photoRow = page.getByRole("link", { name: "Pastéis de nata, Saturday 26 September, 4 stars, third bake" });
  await expect(photoRow).toHaveAttribute("href", "/recipes/pasteis-de-nata/log?edit=nata-b3");

  // A bake without a photo: the lead is its date block, title and note preview and stars.
  const row = page.getByRole("link", { name: /Croissants with a cultured butter.*September.*5 stars/ });
  await expect(row).toHaveAttribute("href", "/recipes/cultured-butter-croissants/log?edit=cr-b2");
  // A bake with neither a note nor a rating still reads sensibly.
  await expect(page.getByRole("link", { name: /Country sourdough, \w+day 13 September, not rated/ })).toBeVisible();
  // A rated bake with no note: stars still show, not swallowed by the note's slot.
  await expect(page.getByRole("link", { name: /Country sourdough, \w+day 27 September, 5 stars/ })).toBeVisible();

  await expectPageBasics(page);
  await expectTouchTargets(page);
  await shot(page, "01-diary", true);
});

test("diary: a scaled, unrated first bake shows the scale, not a bake number", async ({ page }) => {
  await ready(page, "/bakes");
  // nata-b1 (30 Aug, ½×, unrated): the recipe's first bake, so no "second bake" — the
  // scale fills in instead (BONES: "or the scale when it isn't 1×").
  await expect(page.getByRole("link", { name: "Pastéis de nata, Sunday 30 August, not rated, scaled ½×" })).toBeVisible();
});

test("diary: show more loads older bakes and moves focus to the first new one", async ({ page }) => {
  await ready(page, "/bakes");
  const button = page.getByRole("button", { name: "Show more" });
  await expect(button).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).not.toHaveText(["January"]);
  await button.click();
  if (!phoneWebKit()) await expect(page.locator(":focus")).toHaveAttribute("href", /\/log\?edit=/);
});

test("empty: illustration, copy, and Go to Library", async ({ page }) => {
  await page.goto("http://localhost:3102/bakes");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nothing out of the oven yet.");
  await expect(page.getByText(/Log a bake from any recipe/)).toBeVisible();
  const link = page.getByRole("link", { name: "Go to Library" });
  await expect(link).toHaveAttribute("href", "/recipes");
  await expect(page.getByText(/bakes this year/)).toHaveCount(0);
  await expectPageBasics(page);
  await shot(page, "02-empty", true);
});

test("loading: header and 5 placeholder rows", async ({ page }) => {
  await page.goto("http://localhost:3101/bakes", { waitUntil: "commit" });
  await page.getByText("Loading bakes").waitFor({ state: "attached" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your bakes.");
  await expect(page.locator("main li")).toHaveCount(5);
  if (!phoneWebKit()) await shot(page, "03-loading");
});

test("focus rings on the first rows", async ({ page }) => {
  await ready(page, "/bakes");
  await expectFocusRings(page, 3);
});
