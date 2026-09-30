import { expect, test, type Page } from "@playwright/test";

// /recipes/:recipeId: every state and overlay in BONES-recipes-detail.md, plus the
// Definition of Done checks from CLAUDE.md. Screenshots land in screenshots/recipe/.

const NATA = "/recipes/pasteis-de-nata";
const shot = (page: Page, name: string, fullPage = false) =>
  page.screenshot({ path: `screenshots/recipe/${test.info().project.name}--${name}.png`, fullPage });

async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
}

test("default: pastel de nata (Has estimates)", async ({ page }) => {
  await ready(page, NATA);
  await shot(page, "01-first-viewport");
  await shot(page, "02-full", true);

  // One h1 and the landmarks.
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("nav")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);

  // Has estimates notice between Header and Scale.
  await expect(page.getByText("1 amount is an estimate.")).toBeVisible();

  // No horizontal scroll.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  // Touch targets: every visible interactive element is at least 48×48 (hit area included).
  const small = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("a, button, input, [role=radio]")) {
      const r = el.getBoundingClientRect();
      if (!r.width || getComputedStyle(el).visibility === "hidden") continue;
      if (el.classList.contains("sr-only")) continue;
      // Hit areas extended with ::before/::after count.
      const pseudo = ["::before", "::after"].map((p) => getComputedStyle(el, p)).find((s) => s.content !== "none" && s.position === "absolute");
      const extra = pseudo ? Math.max(0, -parseFloat(pseudo.top) || 0) + Math.max(0, -parseFloat(pseudo.bottom) || 0) : 0;
      const h = r.height + extra;
      // Inline text links inside a sentence are exempt (WCAG 2.5.8 inline exception).
      const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
      if (!inline && (h < 47.5 || r.width < 24)) out.push(`${el.tagName} "${el.textContent?.trim() || el.getAttribute("aria-label")}" ${Math.round(r.width)}×${Math.round(h)}`);
    }
    return out;
  });
  expect(small).toEqual([]);
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
  await ready(page, `${NATA}?scale=banana`);
  await expect(page).toHaveURL(new RegExp(`${NATA}$`));
  await expect(page.getByRole("button", { name: "1×" })).toHaveAttribute("aria-pressed", "true");
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

test("share dialog: copy, revoke, create", async ({ page, context, isMobile }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page, NATA);
  const share = page.getByRole("button", { name: "Share" });
  await share.click();
  const dialog = page.getByRole("dialog", { name: "Share recipe" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Share link")).toHaveValue(/\/r\/nata-k7p2qw$/);
  await page.waitForTimeout(350);
  await shot(page, "08-share-dialog");
  await dialog.getByRole("button", { name: "Copy" }).click();
  await expect(dialog.getByText("Link copied")).toBeVisible();
  await shot(page, "09-share-copied");
  await dialog.getByRole("button", { name: "Revoke link" }).click();
  await expect(dialog.getByRole("button", { name: "Keep link" })).toBeFocused();
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
  await expect(page.locator("h3")).toHaveCount(8);
  await shot(page, "15-long-recipe-first-viewport");
  await shot(page, "16-long-recipe-full", true);
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
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "21-loading");
  await expect(page.getByRole("button", { name: "Start baking" })).toBeDisabled();
});
