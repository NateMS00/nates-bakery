import { expect, test, type Page } from "@playwright/test";
import { capture, ready } from "./helpers";

// BONES-shell 1.7.0: the installed app's tab bar, and the account icon's current
// state on /account. The tab bar only exists in installed mode, which a desktop
// browser (headless or not) never reports — these simulate it the same way as
// no-import.spec.ts and recipe.spec.ts, by mutating a real MediaQueryList so
// useInstalled's useSyncExternalStore (which subscribes via addEventListener) gets
// a usable object, not a spread-copied fake.
async function simulateInstalled(page: Page) {
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (q: string) => {
      const mql = real(q);
      if (q === "(display-mode: standalone)") Object.defineProperty(mql, "matches", { value: true, configurable: true });
      return mql;
    };
  });
}

test.describe(() => {
  test.skip(({ isMobile }) => !isMobile, "the tab bar is mobile-only");

  test("tab bar: the 56px row and the safe-area padding don't collapse into each other", async ({ page }) => {
    await simulateInstalled(page);
    await ready(page, "/recipes");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    // No real inset in a test browser — fake one via the shared CSS variable
    // (globals.css), the same indirection env() itself can't be overridden with.
    await page.addStyleTag({ content: ":root { --safe-area-bottom: 34px; }" });
    const row = nav.locator("> div").first();
    const [rowBox, navBox] = await Promise.all([row.boundingBox(), nav.boundingBox()]);
    expect(rowBox!.height).toBe(56); // the items' own row, unaffected by the inset
    expect(navBox!.height).toBe(1 + 56 + 34); // its 1px top border, the row, then the simulated safe area
    const icon = nav.getByRole("link", { name: "Library" }).locator("svg");
    expect((await icon.boundingBox())!.height).toBeGreaterThan(20); // not squeezed to ~22px total
  });

  test("tab bar: sits flush at the bottom of the viewport", async ({ page }) => {
    await simulateInstalled(page);
    await ready(page, "/recipes");
    const nav = page.getByRole("navigation", { name: "Main" });
    const box = await nav.boundingBox();
    expect(Math.round(box!.y + box!.height)).toBe(page.viewportSize()!.height);
    // A normal viewport screenshot, not full-page: a fixed element only paints once
    // at its viewport position in a stitched full-page capture, which would leave a
    // misleading blank gap where the page's reserved padding is.
    await capture(page, "shell", "installed-tab-bar");
  });
});

test("account icon shows current on /account, like other nav items", async ({ page, isMobile }) => {
  test.skip(isMobile, "the account icon-button only shows in the header on tablet and up");
  await ready(page, "/account");
  const account = page.getByRole("button", { name: "Account" });
  await expect(account).toHaveAttribute("aria-current", "page");
  await expect(account).toHaveClass(/bg-primary-wash/);
  await capture(page, "shell", "account-current-nav");
});
