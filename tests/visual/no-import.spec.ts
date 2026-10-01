import { expect, test, type Page } from "@playwright/test";
import { capture, ready } from "./helpers";

// Import turned off (BACKERY_FEATURE_IMPORT unset), as production starts: servers 3104
// (fixtures) and 3105 (empty Library). Nothing may link to /import, which is Not found;
// the Library's primary action is New recipe, and nothing mentions reels.

const OFF = "http://localhost:3104";
const EMPTY = "http://localhost:3105";
const shot = (page: Page, name: string) => capture(page, "no-import", name);

test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const url of [OFF, EMPTY]) await context.addCookies([{ name: "backery_fixture_ns", value, url }]);
});

/** Every link on the page, including the header's (mobile and desktop forms alike). */
const hrefs = (page: Page) => page.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));

test("no page links to /import", async ({ page }) => {
  const pages = [
    "/recipes",
    "/recipes/pasteis-de-nata",
    "/recipes/pasteis-de-nata/log",
    "/recipes/pasteis-de-nata/edit",
    "/recipes/new",
    "/recipes/pasteis-de-nata/bake?scale=1&step=1",
    "/privacy",
    "/no-such-page",
  ];
  for (const path of pages) {
    await ready(page, `${OFF}${path}`);
    const links = await hrefs(page);
    expect(links.filter((h) => h.startsWith("/import")), path).toEqual([]);
  }
  // The header has no Import link, on mobile or desktop.
  await ready(page, `${OFF}/recipes`);
  await expect(page.locator("header").getByRole("link", { name: "Import" })).toHaveCount(0);
});

test("/import and Review Import are Not found", async ({ page }) => {
  for (const path of ["/import", "/import?url=https%3A%2F%2Fwww.instagram.com%2Freel%2FCabc%2F", "/import/d-babka"]) {
    await page.goto(`${OFF}${path}`);
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveText("Page not found");
  }
});

test("Library: New recipe is the primary action, and there are no drafts", async ({ page }) => {
  await ready(page, `${OFF}/recipes`);
  const action = page.getByRole("link", { name: "New recipe", exact: true });
  await expect(action).toHaveAttribute("href", "/recipes/new");
  await expect(page.getByRole("link", { name: "Import from a reel" })).toHaveCount(0);
  await expect(page.locator("#drafts-heading")).toHaveCount(0);
  await expect(page.getByText(/Ready to review|Importing/)).toHaveCount(0);
  await shot(page, "01-library");
});

test("empty Library: Add your first recipe, nothing about reels", async ({ page }) => {
  await ready(page, `${EMPTY}/recipes`);
  await expect(page.getByText("Add your first recipe")).toBeVisible();
  await expect(page.getByRole("link", { name: "New recipe", exact: true })).toHaveAttribute("href", "/recipes/new");
  await expect(page.getByText(/reel|Share from Instagram/i)).toHaveCount(0);
  expect((await hrefs(page)).filter((h) => h.startsWith("/import"))).toEqual([]);
  await shot(page, "02-empty");
});
