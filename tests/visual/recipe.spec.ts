import { expect, test, type Page } from "@playwright/test";
import { capture, expectFitsContent, expectPageBasics, expectPageTop, expectTouchTargets, fontsLoaded, phoneWebKit, ready } from "./helpers";

// /recipes/:recipeId: every state and overlay in BONES-recipes-detail.md, plus the
// Definition of Done checks from CLAUDE.md. Screenshots land in screenshots/recipe/.

const NATA = "/recipes/pasteis-de-nata";
const shot = (page: Page, name: string, fullPage = false) => capture(page, "recipe", name, fullPage);

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
  await expectPageTop(page);

  // Has estimates notice between Header and Scale.
  await expect(page.getByText("1 amount is an estimate.")).toBeVisible();

  await expectTouchTargets(page);
});

test("focus ring is a visible 3px outline", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard focus checked on desktop");
  await ready(page, NATA);
  await page.keyboard.press("Tab"); // skip link
  await shot(page, "03-focus-skip-link");
  const outlines: string[] = [];
  for (let i = 0; i < 14; i++) {
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
  await page.getByRole("radio", { name: "Rate 4 out of 5" }).focus();
  await shot(page, "04-focus-star");
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
  // Esc closes and focus returns to Share.
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  if (!isMobile) await expect(share).toBeFocused();
  // The close X also dismisses it.
  await share.click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});

test("never baked + unrated: mark as baked, rating prompt, undo", async ({ page }) => {
  await ready(page, "/recipes/brown-butter-cookies");
  await expect(page.getByText("Not baked yet")).toBeVisible();
  await expect(page.getByText(/See all bakes/)).toHaveCount(0);
  await expect(page.getByText("Not rated")).toBeVisible();
  await expect(page.getByText("Watch reel")).toHaveCount(0); // manual recipe, no source
  await page.getByText("Not baked yet").scrollIntoViewIfNeeded();
  await shot(page, "12-never-baked");

  const mark = page.getByRole("button", { name: "Mark as baked" });
  await mark.click();
  const prompt = page.getByRole("dialog", { name: "How was it?" });
  await expect(prompt).toBeVisible();
  await expect(prompt.getByRole("radio", { name: "Rate 1 out of 5" })).toBeFocused();
  await page.waitForTimeout(350);
  await expectFitsContent(page, "How was it?");
  // Stars at starSizePrompt (40px), centered, Skip directly below.
  const star = prompt.getByRole("radio", { name: "Rate 3 out of 5" });
  expect((await star.locator("svg").boundingBox())?.width).toBe(40);
  const [dialogBox, starBox, skipBox] = await Promise.all([prompt.boundingBox(), star.boundingBox(), prompt.getByRole("button", { name: "Skip" }).boundingBox()]);
  expect(Math.abs(starBox!.x + starBox!.width / 2 - (dialogBox!.x + dialogBox!.width / 2))).toBeLessThan(2);
  expect(Math.abs(skipBox!.x + skipBox!.width / 2 - (dialogBox!.x + dialogBox!.width / 2))).toBeLessThan(2);
  await shot(page, "13-rating-prompt");
  await prompt.getByRole("button", { name: "Skip" }).click();
  await expect(prompt).toBeHidden();
  await expect(mark).toBeFocused();
  await expect(page.getByText("Marked as baked today")).toBeVisible();
  await expect(page.getByText(/See all bakes \(1\)/)).toBeVisible();
  await shot(page, "14-just-marked");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Not baked yet")).toBeVisible();
});

test("rating prompt: choosing a star saves and closes", async ({ page }) => {
  await ready(page, "/recipes/lemon-drizzle-loaf");
  await expect(page.getByText("3 amounts are estimates.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Add notes" })).toBeVisible(); // baked, no notes
  await page.getByRole("button", { name: "Mark as baked" }).click();
  await page.getByRole("dialog", { name: "How was it?" }).getByRole("radio", { name: "Rate 4 out of 5" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("radio", { name: "Rate 4 out of 5" })).toHaveAttribute("aria-checked", "true");
});

test("long recipe with several groups", async ({ page }) => {
  await ready(page, "/recipes/cultured-butter-croissants");
  await expect(page.locator("h3")).toHaveCount(9); // 3 ingredient groups + 6 step groups, Tips included
  await shot(page, "15-long-recipe-first-viewport");
  await shot(page, "16-long-recipe-full", true);
});

test("Tips: last, unnumbered, a plain list, not part of the step count", async ({ page }) => {
  await ready(page, "/recipes/cultured-butter-croissants");
  const tips = page.locator("h3", { hasText: "Tips" }).locator("xpath=following-sibling::ul[1]");
  await expect(tips.locator("li")).toHaveCount(2);
  await expect(tips.getByText(/^\d+$/)).toHaveCount(0); // no visible step number
  // the last numbered step is still 14, even though two Tips rows follow it
  await expect(page.getByText("Cool on the tray")).toBeVisible();
  const numbers = page.locator("ol[role=list] > li > span.type-amount");
  await expect(numbers.last()).toHaveText("14");
});

test("rating: tap sets, tapping again clears; favorite toggles", async ({ page }) => {
  await ready(page, NATA);
  const four = page.getByRole("radio", { name: "Rate 4 out of 5" });
  await four.click();
  await expect(page.getByText("Not rated")).toBeVisible();
  await page.getByRole("radio", { name: "Rate 2 out of 5" }).click();
  await expect(page.getByRole("radio", { name: "Rate 2 out of 5" })).toHaveAttribute("aria-checked", "true");
  const fav = page.getByRole("button", { name: "Favorite" });
  await expect(fav).toHaveAttribute("aria-pressed", "true");
  await fav.click();
  await expect(fav).toHaveAttribute("aria-pressed", "false");
});

test("account menu and timer alerts sheet", async ({ page }) => {
  await ready(page, NATA);
  await page.getByRole("button", { name: "Account" }).click();
  await expect(page.getByRole("menuitem")).toHaveText(["Timer alerts", "Sign out", "Privacy"]);
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
  test(`timer alerts sheet: ${state}`, async ({ page }) => {
    await page.addInitScript((perm) => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q === "(display-mode: standalone)" ? ({ ...real(q), matches: true } as MediaQueryList) : real(q);
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
