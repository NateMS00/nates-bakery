import { expect, test, type Page } from "@playwright/test";
import { capture, expectFitsContent, expectPageBasics, expectPageTop, expectTouchTargets, fontsLoaded, phoneWebKit, ready } from "./helpers";

// /recipes/:recipeId: every state and overlay in BONES-recipes-detail.md 1.6.0 (visual
// round), plus the Definition of Done checks from CLAUDE.md. Screenshots land in
// screenshots/recipe/. No Mark as baked, Undo, or Rating prompt here any more
// (SKELETON 1.5.0): rating is read-only, from the latest *rated* bake, and Log bake
// just links to the Bake Log's own entry form (the Log sheet overlay is a later stage).

const NATA = "/recipes/pasteis-de-nata"; // has a cover, 3 bakes, 1 estimate
const COOKIES = "/recipes/brown-butter-cookies"; // hand-entered: no cover, never baked
const CROISSANTS = "/recipes/cultured-butter-croissants"; // broken cover; 2 bakes, no photos
const LEMON = "/recipes/lemon-drizzle-loaf"; // a pale cover; 1 bake, unrated
const shot = (page: Page, name: string, fullPage = false) => capture(page, "recipe", name, fullPage);
// The cover (and, from tablet up, every other "desktop-only" header control) is rendered
// twice — once for mobile, once for tablet/desktop — with CSS (not JS) hiding whichever
// doesn't apply, the same way the rest of the app handles responsive layout. Both copies
// are real DOM, so an unscoped query sees both; :visible narrows to the one actually on
// screen for this project.
const visiblePictures = (page: Page) => page.locator('[data-testid="picture"]:visible');

// Favorite, rating, bakes, and share links are saved on the server now: each test has
// its own copy of the fixtures (namespace cookie).
test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3101]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});

test("default: pastel de nata (Has estimates)", async ({ page }) => {
  await ready(page, NATA);
  await shot(page, "01-first-viewport");
  await shot(page, "02-full", true);

  await expectPageBasics(page);
  // Not expectPageTop here: BONES's full-bleed cover is a deliberate exception to the
  // standard page-top gap (no cover → the no-cover test below checks it still holds).
  // The helper also reads main's literal firstElementChild, which on this layout is the
  // mobile cover wrapper regardless of viewport (display:none on tablet+, not absent) —
  // not a layout bug, just incompatible with that check's assumption.

  // Has estimates notice, between the section tabs and Scale.
  await expect(page.getByText("1 amount is an estimate.")).toBeVisible();

  await expectTouchTargets(page);
});

test("focus ring is a visible 3px outline", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard focus checked on desktop");
  await ready(page, NATA);
  await page.keyboard.press("Tab"); // skip link
  await shot(page, "03-focus-skip-link");
  const outlines: string[] = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    outlines.push(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const s = getComputedStyle(el);
        const wrap = el.closest("div");
        const w = s.outlineStyle !== "none" ? s.outlineWidth : wrap && getComputedStyle(wrap).outlineWidth;
        return `${el.tagName}:${el.textContent?.trim().slice(0, 16) || el.getAttribute("aria-label")}:${w}`;
      }),
    );
  }
  for (const o of outlines) expect(o, o).toMatch(/:3px$/);
  // The 10th stop lands on the rating line (Back, Favorite, Share, Edit, Watch reel,
  // Rating, Ingredients, Steps, Bakes, Confirm it) — re-focus the rating line itself to
  // show its ring clearly.
  await page.getByRole("link", { name: /Rated 4 out of 5, Baked 26 Sep/ }).focus();
  await shot(page, "04-focus-rating");
});

test("scale 1.5× updates amounts, yield, and Start baking", async ({ page }) => {
  await ready(page, NATA);
  await page.getByRole("button", { name: "1.5×" }).click();
  await expect(page).toHaveURL(/scale=1\.5/);
  await expect(page.getByText("Makes 18 tarts")).toBeVisible();
  await expect(page.getByRole("link", { name: /Start baking · 1\.5×/ })).toHaveAttribute("href", `${NATA}/bake?scale=1.5`);
  await expect(page.locator("li", { hasText: "Plain flour" }).first()).toContainText("375");
  await expect(page.locator("li", { hasText: "Fine salt" })).toContainText("5.3");
  // Under 10 g, no trailing ".0": salt 3.5 g × 2 = 7 g.
  await page.getByRole("button", { name: "2×" }).click();
  await expect(page.locator("li", { hasText: "Fine salt" })).toHaveText("Fine salt7g");
  await expect(page.locator("li", { hasText: "Fine salt" })).not.toContainText("7.0");
  await page.getByRole("button", { name: "1.5×" }).click();
  await shot(page, "05-scale-1.5");
});

test("custom scale rounds the yield with 'about'", async ({ page }) => {
  await ready(page, NATA);
  await page.getByRole("button", { name: "Custom" }).click();
  await page.getByLabel("Custom scale").fill("1.3");
  await page.getByLabel("Custom scale").press("Enter");
  await expect(page.getByText("Makes about 16 tarts")).toBeVisible();
  await page.getByLabel("Custom scale").fill("12");
  await page.getByLabel("Custom scale").press("Enter");
  await expect(page.getByText("Enter a number from 0.25 to 10")).toBeVisible();
  await shot(page, "06-custom-scale-error");
});

test("invalid scale renders 1× and corrects the URL", async ({ page }) => {
  // The redirect runs in the browser, because the route has already streamed its Loading state.
  await page.goto(`${NATA}?scale=banana`);
  await expect(page).toHaveURL(new RegExp(`${NATA}$`));
  await page.getByRole("heading", { level: 1 }).waitFor();
  await expect(page.getByRole("button", { name: "1×" })).toHaveAttribute("aria-pressed", "true");
});

test("an ingredient note shows as a muted line under the ingredient", async ({ page }) => {
  await ready(page, NATA);
  const row = page.getByRole("listitem").filter({ hasText: "Egg yolks" });
  const note = row.getByText("Creator: the fresher the eggs, the brighter the custard");
  await expect(note).toBeVisible();
  // Read as a note, after the Estimated marker.
  await expect(note).toHaveText(/^Note: Creator: the fresher/);
  const [marker, line] = await Promise.all([row.getByText("Estimated").boundingBox(), note.boundingBox()]);
  expect(line!.y).toBeGreaterThan(marker!.y);
  await note.scrollIntoViewIfNeeded();
  await shot(page, "07b-ingredient-note");
});

test("converted marker reveals the original amount", async ({ page }) => {
  await ready(page, NATA);
  const marker = page.getByRole("button", { name: /Converted/ });
  await expect(page.getByText("was 1¼ cups")).toBeHidden();
  await marker.click();
  await expect(marker).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("was 1¼ cups")).toBeVisible();
  await page.getByText("was 1¼ cups").scrollIntoViewIfNeeded();
  await shot(page, "07-converted-open");
});

test("share dialog: copy, revoke, create", async ({ page, context, isMobile, browserName }) => {
  // WebKit has no clipboard-write permission to grant, and Copy works there without one.
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page, NATA);
  const share = page.getByRole("button", { name: "Share" });
  await share.click();
  const dialog = page.getByRole("dialog", { name: "Share recipe" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Share link")).toHaveValue(/\/r\/nata-k7p2qw$/);
  await page.waitForTimeout(350);
  await expectFitsContent(page, "Share recipe");
  await shot(page, "08-share-dialog");
  await dialog.getByRole("button", { name: "Copy" }).click();
  await expect(dialog.getByText("Link copied")).toBeVisible();
  await shot(page, "09-share-copied");
  await dialog.getByRole("button", { name: "Revoke link" }).click();
  await expect(dialog.getByRole("button", { name: "Keep link" })).toBeFocused();
  // Destructive first, then the safe action as a real (secondary) button, last.
  const actions = dialog.getByRole("button", { name: /^(Revoke link|Keep link)$/ });
  await expect(actions).toHaveText(["Revoke link", "Keep link"]);
  await expect(dialog.getByRole("button", { name: "Keep link" })).toHaveClass(/border-primary/);
  await shot(page, "10-share-revoke-confirm");
  await dialog.getByRole("button", { name: "Revoke link" }).click();
  await expect(dialog.getByRole("button", { name: "Create link" })).toBeFocused();
  await shot(page, "11-share-no-link");
  await dialog.getByRole("button", { name: "Create link" }).click();
  await expect(dialog.getByLabel("Share link")).toHaveValue(/\/r\/[a-z0-9]{12}$/);
  // Esc closes and focus returns to Share — Dialog's own opener tracking now, since the
  // Recipe page has two Share triggers (cover and no-cover headers) and only one is ever
  // visible/focusable at a time.
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  if (!isMobile) await expect(share).toBeFocused();
  // The close X also dismisses it.
  await share.click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});

test("cover: floating controls on mobile, beside the text from tablet up", async ({ page, isMobile }) => {
  await ready(page, NATA);
  const picture = visiblePictures(page).first();
  await expect(picture).toHaveAttribute("data-status", "loaded");
  const fav = page.getByRole("button", { name: "Favorite" });
  await expect(fav).toHaveAttribute("aria-pressed", "true");
  if (isMobile) {
    // Full bleed: no side gutter, flush with the viewport edges.
    const box = (await picture.boundingBox())!;
    expect(box.x).toBe(0);
    expect(box.x + box.width).toBe(page.viewportSize()!.width);
    const back = page.getByRole("link", { name: "Back to Library" });
    await expect(back).toHaveAttribute("href", "/recipes");
  } else {
    // Desktop/tablet: a plain "Library" back-link, not the cover's floating button —
    // scoped to the page itself, since the shell's own Primary nav repeats "Library" too.
    const back = page.locator("#main").getByRole("link", { name: "Library" });
    await expect(back).toHaveAttribute("href", "/recipes");
  }
  await fav.click();
  await expect(fav).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("link", { name: "Edit" })).toHaveAttribute("href", `${NATA}/edit`);
});

test("no cover: a back row, no cover area, the Scale presets in the first viewport", async ({ page }) => {
  await ready(page, COOKIES);
  await expect(visiblePictures(page)).toHaveCount(0); // no cover, no bake photos (never baked)
  await expect(page.locator("#main").getByRole("link", { name: "Library" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Batch size" })).toBeInViewport();
  await expectPageTop(page); // the standard gap still holds without the cover's bleed exception
  await shot(page, "12-no-cover");
});

test("broken cover falls back to the placeholder; its two bakes have no photo of their own", async ({ page }) => {
  await ready(page, CROISSANTS);
  // Only the cover: neither of this recipe's bakes has its own photo, and a Bakes-section
  // row with no photo renders no square at all (not even the placeholder).
  const cover = visiblePictures(page);
  await expect(cover).toHaveCount(1);
  await expect(cover).toHaveAttribute("data-status", "error");
  await expect(cover.locator("img")).toHaveCount(0);
  const rows = page.locator('section[aria-labelledby="bakes-heading"] ul[role="list"] > li');
  await expect(rows).toHaveCount(2);
  for (const row of await rows.all()) await expect(row.locator('[data-testid="picture"]')).toHaveCount(0);
  await shot(page, "13-broken-cover");
});

test("a pale cover keeps its hairline border", async ({ page }) => {
  await ready(page, LEMON);
  const pale = visiblePictures(page).first();
  await expect(pale).toHaveAttribute("data-status", "loaded");
});

test("long recipe with several groups", async ({ page }) => {
  await ready(page, CROISSANTS);
  await expect(page.locator("h3")).toHaveCount(9); // 3 ingredient groups + 6 step groups, Tips included
  await shot(page, "15-long-recipe-first-viewport");
  await shot(page, "16-long-recipe-full", true);
});

test("Tips: last, unnumbered, a plain list, not part of the step count", async ({ page }) => {
  await ready(page, CROISSANTS);
  const tips = page.locator("h3", { hasText: "Tips" }).locator("xpath=following-sibling::ul[1]");
  await expect(tips.locator("li")).toHaveCount(2);
  await expect(tips.getByText(/^\d+$/)).toHaveCount(0); // no visible step number
  // the last numbered step is still 14, even though two Tips rows follow it
  await expect(page.getByText("Cool on the tray")).toBeVisible();
  const numbers = page.locator("ol[role=list] > li > span.type-amount");
  await expect(numbers.last()).toHaveText("14");
});

test("rating line: read-only, scrolls to Bakes; Not baked yet shows no stars", async ({ page }) => {
  await ready(page, NATA);
  const rating = page.getByRole("link", { name: /Rated 4 out of 5, Baked 26 Sep/ });
  await expect(rating).toBeVisible();
  // Not a control: no radios on the page at all now (rating comes from the Log sheet).
  await expect(page.getByRole("radio")).toHaveCount(0);
  await rating.click();
  await expect(page).toHaveURL(/#bakes-heading$/);
  await expect(page.getByRole("heading", { name: "Bakes" })).toBeInViewport();

  await ready(page, COOKIES);
  await expect(page.getByRole("link", { name: "Not baked yet" })).toBeVisible();
  await expect(page.getByText("Watch reel")).toHaveCount(0); // manual recipe, no source
});

test("Bakes: up to 3 entries with photo, stars, and how it turned out; See all bakes", async ({ page, isMobile }) => {
  await ready(page, NATA);
  await page.locator("#bakes-heading").scrollIntoViewIfNeeded();
  const entries = page.locator('section[aria-labelledby="bakes-heading"] ul[role="list"] > li');
  await expect(entries).toHaveCount(3); // the fixture has exactly 3; the cap isn't exercised here
  await expect(entries.first()).toContainText("Sat 26 Sep");
  await expect(entries.first()).toContainText("Blistered tops and crisp layers");
  // The unscaled bakes show no "· 1×"; the half-batch one does.
  await expect(entries.nth(1)).not.toContainText("×");
  await expect(entries.last()).toContainText("½×");
  const seeAll = page.getByRole("link", { name: "See all bakes (3)" });
  await expect(seeAll).toHaveAttribute("href", "/recipes/pasteis-de-nata/log");
  // scrollIntoViewIfNeeded only scrolls the minimum distance, landing Bakes near the
  // bottom edge — on mobile, Steps (6-8 visible here) is genuinely nearest the top under
  // the sticky bar at this exact position, not Bakes (desktop has no separate Steps tab:
  // Ingredients and Steps are one "Recipe" tab there). Wait for the scroll-spy to actually
  // settle there (a real check, not just a screenshot: a stale tab wouldn't fail without it).
  await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: isMobile ? "Steps" : "Recipe" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await shot(page, "14-bakes-section");
});

test("never baked: Bakes reduces to one line, no See all bakes, no count on the tab", async ({ page }) => {
  await ready(page, COOKIES);
  // Scoped to the section tabs: the shell's own Primary nav has a "Bakes" link too (the
  // Bakes diary, a different page).
  await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Bakes", exact: true })).toBeVisible(); // no "Bakes 3"
  await expect(page.getByRole("region", { name: "Bakes" }).getByText("Not baked yet", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /See all bakes/ })).toHaveCount(0);
});

test("never baked with a cover: every fresh import looks like this", async ({ page }) => {
  await ready(page, "/recipes/pita");
  await expect(visiblePictures(page).first()).toHaveAttribute("data-status", "loaded");
  await expect(page.getByRole("link", { name: "Not baked yet" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Bakes" }).getByText("Not baked yet", { exact: true })).toBeVisible();
  await shot(page, "23-never-baked-with-cover");
});

test("section tabs: sticky, and mark the section nearest the top as you scroll", async ({ page, isMobile }) => {
  await ready(page, NATA);
  const nav = page.getByRole("navigation", { name: "Sections" });
  const ingredients = nav.getByRole("link", { name: isMobile ? "Ingredients" : "Recipe" });
  await expect(ingredients).toHaveAttribute("aria-current", "location");
  // Scroll well past the header (the cover alone is ~290px at 390 wide) so the tabs have
  // actually reached their sticky point, not just moved partway there.
  await page.evaluate(() => window.scrollBy(0, 900));
  expect(Math.round((await nav.boundingBox())!.y)).toBe(0); // flush with the viewport top
  // All the way to the end: NATA's Bakes section has real entries, tall enough that its own
  // heading is still well short of the trigger line even at the document's end — some
  // earlier section is still genuinely nearest the top under the sticky bar, not Bakes
  // (exactly which one depends on the viewport's own reflow, so only that much is checked).
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  await expect(nav.getByRole("link", { name: /^Bakes/ })).not.toHaveAttribute("aria-current", "location");

  // The fallback case this all exists for: on desktop, Never baked (Bakes is one line) ends
  // the page before anything reaches the trigger line at all — the last section is still
  // marked current once there's nowhere left to scroll, not whatever the default first
  // section is. (On mobile this same fixture's own Steps legitimately reaches the trigger
  // on its own at the document's end, which is just as correct a result — not every
  // viewport's content folds short enough to exercise the fallback itself.)
  test.skip(isMobile, "desktop-only: this fixture needs a layout where nothing else reaches the trigger line first");
  await ready(page, COOKIES);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: /^Bakes/ })).toHaveAttribute("aria-current", "location");
});

test("Log bake links to the entry form; Start baking links to Bake Mode", async ({ page }) => {
  await ready(page, NATA);
  // Exactly one of each is ever visible (the desktop/mobile copies are display:none, not
  // just styled away) — Playwright's strict mode would fail these on more than one match.
  const logBake = page.getByRole("link", { name: "Log bake" });
  await expect(logBake).toHaveAttribute("href", `${NATA}/log?new=1`);
  const startBaking = page.getByRole("link", { name: /^Start baking/ });
  await expect(startBaking).toHaveAttribute("href", `${NATA}/bake?scale=1`);
});

test("account menu and timer alerts sheet", async ({ page, isMobile }) => {
  // A no-cover recipe: with one, the cover replaces the header on mobile (BONES-
  // recipes-detail 1.6.1) and there's no Account button to reach from there at all.
  await ready(page, COOKIES);
  await page.getByRole("button", { name: "Account" }).click();
  // Bakes is in the menu on phones only (BONES-shell 1.7.0); tablet and desktop
  // already have it in the header, so the menu doesn't repeat it.
  await expect(page.getByRole("menuitem")).toHaveText(isMobile ? ["Bakes", "Timer alerts", "Sign out", "Privacy"] : ["Timer alerts", "Sign out", "Privacy"]);
  await shot(page, "17-account-menu");
  await page.getByRole("menuitem", { name: "Timer alerts" }).click();
  const sheet = page.getByRole("dialog", { name: "Get timer alerts on a locked phone" });
  await expect(sheet).toBeVisible();
  await page.waitForTimeout(350);
  await shot(page, "18-timer-alerts-not-home-screen");
});

for (const [state, permission, title] of [
  ["alerts-off", "default", "Get timer alerts on a locked phone"],
  ["alerts-on", "granted", "Timer alerts are on"],
  ["denied", "denied", "Alerts are blocked"],
] as const) {
  test(`timer alerts sheet: ${state}`, async ({ page, isMobile }) => {
    // These simulate installed mode to exercise readAlertsState()'s other
    // branches, not recipe-page-specific layout (the mobile "not-home-screen"
    // case is already covered, unstubbed, by the test above). On mobile,
    // simulating installed here now also hides this page's Account button
    // (BONES-shell 1.7.0: installed mode on a detail page has no account menu,
    // same as a real iOS app's push screens) — there's no longer a path to open
    // it from here, so this runs on desktop only, where Account always stays in
    // the header.
    test.skip(isMobile, "installed mode hides the account menu on a detail page; covered on desktop");
    await page.addInitScript((perm) => {
      const real = window.matchMedia.bind(window);
      // A real MediaQueryList (not a spread-copied plain object): useInstalled's
      // useSyncExternalStore subscribes via its actual addEventListener, which a
      // plain object fake wouldn't have.
      window.matchMedia = (q: string) => {
        const mql = real(q);
        if (q === "(display-mode: standalone)") Object.defineProperty(mql, "matches", { value: true, configurable: true });
        return mql;
      };
      Object.defineProperty(window, "Notification", { value: { permission: perm, requestPermission: async () => perm } });
    }, permission);
    await ready(page, NATA);
    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Timer alerts" }).click();
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();
    await page.waitForTimeout(350);
    await expectFitsContent(page, title);
    await shot(page, `19-timer-alerts-${state}`);
  });
}

test("not found for an unknown recipe", async ({ page }) => {
  // Status is 200, not 404: the route streams its Loading state before the page
  // knows the recipe is missing. The not-found content is what matters here.
  await page.goto("/recipes/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await shot(page, "20-not-found");
});

test("loading state", async ({ page }) => {
  await page.goto(`http://localhost:3101${NATA}`, { waitUntil: "commit" });
  await page.getByText("Loading recipe").waitFor({ state: "attached" });
  await fontsLoaded(page);
  await expect(page.getByRole("button", { name: "Start baking" })).toBeDisabled();
  // WebKit's screenshots wait for a streamed page to finish, so they'd show the recipe.
  if (!phoneWebKit()) await shot(page, "21-loading");
});

test("tablet: Scale and Ingredients take 4 of 8 columns, and the Scale control fits", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await ready(page, NATA);
  const group = page.getByRole("group", { name: "Batch size" });
  const [track, custom, steps] = await Promise.all([
    group.boundingBox(),
    group.getByRole("button", { name: "Custom" }).boundingBox(),
    page.getByRole("heading", { name: "Steps" }).boundingBox(),
  ]);
  expect(custom!.x + custom!.width).toBeLessThanOrEqual(track!.x + track!.width);
  // Two equal columns: Steps starts at the middle of the content area.
  expect(Math.abs(steps!.x - (768 / 2 + 12))).toBeLessThan(40);
  for (const name of ["Half", "1×", "1.5×", "2×", "Custom"]) {
    expect((await group.getByRole("button", { name, exact: true }).boundingBox())!.width).toBeGreaterThanOrEqual(48);
  }
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "22-tablet");
});

test("Watch reel has a 48px tap area with no visual change", async ({ page }) => {
  await ready(page, NATA);
  const link = page.getByRole("link", { name: /Watch reel/ });
  const hit = await link.evaluate((a) => parseFloat(getComputedStyle(a, "::before").height));
  expect(hit).toBeGreaterThanOrEqual(48);
  // A tap 12px above the text still lands on the link.
  const box = (await link.boundingBox())!;
  const hitTarget = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.textContent ?? null, [box.x + box.width / 2, box.y - 12 + 0]);
  expect(hitTarget).toContain("Watch reel");
});
