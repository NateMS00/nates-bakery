import { expect, test, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageTop, expectTouchTargets, ready } from "./helpers";

// /r/:shareToken (Shared Recipe) and /r/expired (Link Unavailable), BONES-r-detail.md
// and BONES-r-expired.md, in the Share shell. Friends have no account: these tests run
// signed out unless they say otherwise. Each test has its own copy of the fixtures.

const NATA = "/r/nata-k7p2qw";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "share", name, fullPage);

test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101]) {
    await context.addCookies([
      { name: "backery_fixture_ns", value, url: `http://localhost:${port}` },
      { name: "backery_stub_session", value: "guest", url: `http://localhost:${port}` },
    ]);
  }
});

/** Share shell: skip link, header, main, footer, no nav; one h1; no horizontal scroll. */
async function expectShareShell(page: Page) {
  await expect(page.locator("h1")).toHaveCount(1);
  for (const landmark of ["header", "main", "footer"]) await expect(page.locator(landmark)).toHaveCount(1);
  await expect(page.locator("nav")).toHaveCount(0);
  // The wordmark is not a link; the only app link is Privacy in the footer.
  await expect(page.locator("header a")).toHaveCount(0);
  await expect(page.locator("header")).toContainText("Backery");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test("shared recipe: first viewport, full page, and page checks (signed out)", async ({ page }) => {
  await ready(page, NATA);
  await expect(page).toHaveURL(NATA); // no sign-in redirect for friends
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pastéis de nata");
  await expect(page.getByText("Shared by Nathan")).toBeVisible();
  await expect(page.getByRole("img", { name: "Rated 4 out of 5" })).toBeVisible();
  await expect(page.getByText("@forno.da.rita")).toBeVisible();
  const reel = page.getByRole("link", { name: /Watch the original reel/ });
  await expect(reel).toHaveAttribute("href", "https://www.instagram.com/reel/C9nataRita01/");
  await expect(reel).toHaveAttribute("target", "_blank");
  await expect(reel).toHaveAccessibleName("Watch the original reel (opens in a new tab)");
  await shot(page, "01-first-viewport");
  await shot(page, "02-full", true);

  await expectShareShell(page);
  await expectPageTop(page);
  await expectTouchTargets(page);
  await expectFocusRings(page, 4);

  // Never shown to friends: back link, favorite, share, edit, rating controls, bake log.
  for (const name of ["Library", "Favorite", "Share", "Edit", "Start baking", "Mark as baked"]) {
    await expect(page.getByRole("button", { name, exact: true }).or(page.getByRole("link", { name, exact: true }))).toHaveCount(0);
  }
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByText("Latest bake")).toHaveCount(0);
  await expect(page.getByText(/See all bakes|Not baked yet/)).toHaveCount(0);
  // Nothing private reaches the browser.
  const html = await page.content();
  expect(html).not.toContain("Rolled the log tighter"); // a bake log note
  expect(html).not.toContain("pasteis-de-nata"); // the owner's recipe URL

  // Only the Estimated marker, read as "Estimated amount"; no Converted marker.
  const yolks = page.getByRole("listitem").filter({ hasText: "Egg yolks" });
  await expect(yolks).toContainText("Estimated");
  await expect(yolks.locator(".sr-only")).toHaveText("amount");
  await expect(page.getByText("Converted")).toHaveCount(0);
  await expect(page.getByText(/^was /)).toHaveCount(0);

  // Desktop: title block 9 cols, the reel link right-aligned in the last 3.
  if (page.viewportSize()!.width >= 1280) {
    const [h1, link, main] = await Promise.all([page.locator("h1").boundingBox(), reel.boundingBox(), page.locator("main").boundingBox()]);
    expect(link!.x).toBeGreaterThan(h1!.x + main!.width * 0.6);
    const padding = await page.locator("main").evaluate((m) => parseFloat(getComputedStyle(m).paddingRight));
    expect(Math.abs(link!.x + link!.width - (main!.x + main!.width - padding))).toBeLessThan(2);
  } else {
    // Mobile: full width at the end of the header, above Scale.
    const [link, scale] = await Promise.all([reel.boundingBox(), page.getByRole("heading", { name: "Scale" }).boundingBox()]);
    expect(link!.width).toBeGreaterThan(390 - 2 * 16 - 1);
    expect(link!.y).toBeLessThan(scale!.y);
  }
});

test("scale: the friend's scale lives in their URL", async ({ page }) => {
  await ready(page, NATA);
  await page.getByRole("button", { name: "2×" }).click();
  await expect(page).toHaveURL(/\?scale=2$/);
  await expect(page.getByRole("listitem").filter({ hasText: "Egg yolks" })).toContainText("216");
  await shot(page, "03-scaled");

  // Invalid scale: renders at 1× and corrects the URL.
  await ready(page, `${NATA}?scale=99`);
  await expect(page).toHaveURL(NATA);
  await expect(page.getByRole("listitem").filter({ hasText: "Egg yolks" })).toContainText("108");
});

test("no source and unrated: no reel link, creator, or stars", async ({ page }) => {
  await ready(page, "/r/cookies-h4m8rz");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Brown butter chocolate chip cookies");
  await expect(page.getByText("Shared by Nathan")).toBeVisible();
  await expect(page.getByRole("link", { name: /Watch the original reel/ })).toHaveCount(0);
  await expect(page.getByText(/^@/)).toHaveCount(0);
  await expect(page.getByRole("img", { name: /Rated/ })).toHaveCount(0);
  await expect(page.getByText("Not rated")).toHaveCount(0);
  await expectShareShell(page);
  await shot(page, "04-no-source");
});

test("long recipe with groups", async ({ page }) => {
  await ready(page, "/r/croissant-q2t6vb");
  await expect(page.locator("h3")).toHaveCount(8);
  await shot(page, "05-long-recipe");
});

test("loading", async ({ page }) => {
  await page.goto(`http://localhost:3101${NATA}`, { waitUntil: "commit" });
  await page.getByText("Loading recipe").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "06-loading");
});

test("link unavailable: an unknown token goes to /r/expired", async ({ page }) => {
  await ready(page, "/r/no-such-token");
  await expect(page).toHaveURL(/\/r\/expired$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This link no longer works");
  await expect(page.getByText("Ask the person who shared it to send you a new one.")).toBeVisible();
  await expect(page.locator("main a")).toHaveCount(0);
  await expectShareShell(page);
  // Centered vertically between header and footer.
  const gaps = await page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect();
    const footer = document.querySelector("footer")!.getBoundingClientRect();
    const h1 = document.querySelector("h1")!.getBoundingClientRect();
    const p = document.querySelector("main p")!.getBoundingClientRect();
    return { above: h1.top - header.bottom, below: footer.top - p.bottom };
  });
  expect(Math.abs(gaps.above - gaps.below)).toBeLessThan(50);
  await shot(page, "07-expired");
});

test.describe("owner", () => {
  test.beforeEach(async ({ context }) => {
    for (const port of [3100, 3101]) await context.addCookies([{ name: "backery_stub_session", value: "", url: `http://localhost:${port}` }]);
  });

  test("Share dialog: a created link opens the shared page; revoking it sends friends to /r/expired", async ({ page, browser }, info) => {
    await ready(page, "/recipes/lemon-drizzle-loaf");
    await page.getByRole("button", { name: "Share" }).click();
    const dialog = page.getByRole("dialog", { name: "Share recipe" });
    await dialog.getByRole("button", { name: "Create link" }).click();
    const field = dialog.getByLabel("Share link");
    await expect(field).toHaveValue(/\/r\/[a-z0-9]{12}$/);
    const url = await field.inputValue();

    // A friend, signed out, in another browser.
    const friend = await browser.newContext({ ...info.project.use });
    await friend.addCookies([
      { name: "backery_fixture_ns", value: `${info.project.name}-${info.testId}`, url: "http://localhost:3100" },
      { name: "backery_stub_session", value: "guest", url: "http://localhost:3100" },
    ]);
    const friendPage = await friend.newPage();
    await friendPage.goto(url);
    await expect(friendPage.getByRole("heading", { level: 1 })).toHaveText("Lemon drizzle loaf");
    await expect(friendPage.getByText("Shared by Nathan")).toBeVisible();

    // Revoke: the same link now goes to /r/expired.
    await dialog.getByRole("button", { name: "Revoke link" }).click();
    await dialog.getByRole("button", { name: "Revoke link" }).click();
    await expect(dialog.getByRole("button", { name: "Create link" })).toBeVisible();
    await friendPage.goto(url);
    await expect(friendPage).toHaveURL(/\/r\/expired$/);
    await friend.close();
  });
});

test("tablet: Scale and Ingredients take 4 of 8 columns, and the Scale control fits", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await ready(page, NATA);
  const group = page.getByRole("group", { name: "Batch size" });
  const [track, custom] = await Promise.all([group.boundingBox(), group.getByRole("button", { name: "Custom" }).boundingBox()]);
  expect(custom!.x + custom!.width).toBeLessThanOrEqual(track!.x + track!.width);
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "08-tablet");
});
