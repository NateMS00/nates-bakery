import { expect, test, type Page } from "@playwright/test";

// Shared by every page's visual spec: captures, readiness, and the Definition of
// Done checks from CLAUDE.md.

/** Screenshots land in screenshots/<page>/<project>--<name>.png. */
export async function capture(page: Page, dir: string, name: string, fullPage = false) {
  const path = `screenshots/${dir}/${test.info().project.name}--${name}.png`;
  if (!fullPage) return page.screenshot({ path });
  // Full-page captures draw the sticky action-bar once at the end of the page (in the
  // space the page reserves for it), not pinned mid-capture.
  const style = await page.addStyleTag({
    content: "body{position:relative} [data-action-bar]{position:absolute!important;top:auto!important;bottom:0!important;translate:none!important}",
  });
  await page.screenshot({ path, fullPage: true });
  await style.evaluate((el) => (el as Element).remove());
}

export async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole("heading", { level: 1 }).waitFor();
  // Loading states have an H1 too; wait until the page has replaced them.
  await expect(page.getByRole("status").filter({ hasText: /^Loading / })).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  // A recipe-picture's own loaded/error state races the screenshot otherwise. Capped
  // so one stuck image (never possible to spot from here) can't hang a whole test.
  await page.evaluate(() => {
    const allImages = Promise.all(
      Array.from(document.images).map((img) => {
        if (img.complete) return;
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }),
    );
    const cap = new Promise((resolve) => setTimeout(resolve, 3000));
    return Promise.race([allImages, cap]);
  });
}

/** One h1, the landmarks, and no horizontal scroll. */
export async function expectPageBasics(page: Page) {
  // :visible, not a bare count: a page can render a breakpoint's content twice with
  // CSS (not JS) choosing which one is on screen — same pattern as visiblePictures
  // in recipe.spec.ts. The display:none copy is correctly invisible to assistive
  // tech too, so this still reflects what "one h1" actually means for a reader.
  await expect(page.locator("h1:visible")).toHaveCount(1);
  for (const landmark of ["header", "main", "footer"]) await expect(page.locator(landmark)).toHaveCount(1);
  // At least one: a page can add its own in-page nav (the Recipe page's section tabs)
  // alongside the shell's Primary nav — each with its own accessible name, not a
  // violation, just more than the shell alone has.
  await expect(page.locator("nav")).not.toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

/** Every visible interactive element is at least 48px tall (hit areas extended with ::before/::after count). */
export async function expectTouchTargets(page: Page) {
  const small = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("a, button, input, select, [role=radio]")) {
      const r = el.getBoundingClientRect();
      if (!r.width || getComputedStyle(el).visibility === "hidden" || el.classList.contains("sr-only")) continue;
      // A native radio's target is its whole label row.
      const label = el.closest("label");
      const box =
        label && el.matches("input[type=radio], input[type=checkbox]")
          ? label.getBoundingClientRect()
          : el.tagName === "INPUT" && el.parentElement?.tagName === "DIV"
            ? el.parentElement.getBoundingClientRect() // the field box around a text input
            : r;
      const pseudo = ["::before", "::after"].map((p) => getComputedStyle(el, p)).find((s) => s.content !== "none" && s.position === "absolute");
      const extra = pseudo ? Math.max(0, -parseFloat(pseudo.top) || 0) + Math.max(0, -parseFloat(pseudo.bottom) || 0) : 0;
      const h = box.height + extra;
      // Inline text links inside a sentence are exempt (WCAG 2.5.8 inline exception).
      const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
      if (!inline && (h < 47.5 || box.width < 24)) out.push(`${el.tagName} "${el.textContent?.trim() || el.getAttribute("aria-label")}" ${Math.round(box.width)}×${Math.round(h)}`);
    }
    return out;
  });
  expect(small).toEqual([]);
}

/** BONES-shell Overlay sizing: close X in the header, no bottom Close, no empty space below the content. */
export async function expectFitsContent(page: Page, name: string) {
  const dialog = page.getByRole("dialog", { name });
  await expect(dialog.getByRole("button", { name: "Close" })).toHaveCount(1);
  const gap = await dialog.evaluate((d) => {
    const body = d.lastElementChild as HTMLElement;
    const last = body.lastElementChild as HTMLElement;
    return d.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
  });
  // Only the body's bottom padding (24px, 32px on desktop) plus the safe area.
  expect(gap).toBeLessThanOrEqual(33);
  const ratio = await dialog.evaluate((d) => d.getBoundingClientRect().height / window.innerHeight);
  expect(ratio).toBeLessThanOrEqual(0.9);
}

/**
 * The iPhone-sized WebKit project (mobile-webkit). Its Tab only visits form fields, as
 * in Safari without "Press Tab to highlight each item", so keyboard Tab checks don't
 * apply there; and a click doesn't focus the button it lands on.
 */
export const phoneWebKit = () => {
  const { browserName, isMobile } = test.info().project.use;
  return browserName === "webkit" && Boolean(isMobile);
};

/**
 * Waits for the fonts in use. WebKit's document.fonts.ready also waits for a streamed
 * page to finish, which would wait past a Loading state.
 */
export const fontsLoaded = (page: Page) =>
  page.evaluate(() => Promise.all([...document.fonts].filter((f) => f.status === "loading").map((f) => f.loaded)));

/** Tabs through `stops` elements after the skip link; each must show a 3px outline (its own or its field wrapper's). */
export async function expectFocusRings(page: Page, stops: number) {
  if (phoneWebKit()) return; // keyboard Tab checks run in the Chromium projects
  await page.keyboard.press("Tab"); // skip link
  for (let i = 0; i < stops; i++) {
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      const wrap = el.closest("div");
      const w = s.outlineStyle !== "none" ? s.outlineWidth : wrap && getComputedStyle(wrap).outlineWidth;
      return `${el.tagName}:${el.textContent?.trim().slice(0, 20) || el.getAttribute("aria-label") || el.id}:${w}`;
    });
    expect(ring, ring).toMatch(/:3px$/);
  }
}

/** SKIN Page Top: content starts 24px below the tile band on mobile, 32px from tablet up. */
export async function expectPageTop(page: Page) {
  const gap = await page.evaluate(() => {
    const band = document.querySelector("header > [aria-hidden=true]:last-child") as HTMLElement;
    const first = document.querySelector("main")!.firstElementChild as HTMLElement;
    return Math.round(first.getBoundingClientRect().top - band.getBoundingClientRect().bottom);
  });
  expect(gap).toBe(page.viewportSize()!.width < 768 ? 24 : 32);
}

/**
 * BONES-shell Destructive confirmations: the destructive action, then the safe action
 * last as a secondary button; focus starts on the safe action; on mobile both are full
 * width, on desktop side by side with the safe action on the right.
 */
export async function expectDestructiveConfirmation(page: Page, title: string, destructive: string, safe: string) {
  const dialog = page.getByRole("dialog", { name: title });
  const safeButton = dialog.getByRole("button", { name: safe, exact: true });
  await expect(safeButton).toBeFocused();
  await expect(safeButton).toHaveClass(/bg-transparent/); // button-secondary, not a text link
  const [d, s, panel] = await Promise.all([
    dialog.getByRole("button", { name: destructive, exact: true }).boundingBox(),
    safeButton.boundingBox(),
    dialog.boundingBox(),
  ]);
  if (page.viewportSize()!.width < 768) {
    expect(s!.y).toBeGreaterThan(d!.y); // safe action last, at the bottom
    expect(s!.width).toBeGreaterThan(panel!.width - 2 * 32 - 2); // full width
  } else {
    expect(s!.x).toBeGreaterThan(d!.x); // safe action on the right
  }
}
