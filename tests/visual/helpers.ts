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
    content: "body{position:relative} [data-action-bar]{position:absolute!important;bottom:0!important}",
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
}

/** One h1, the landmarks, and no horizontal scroll. */
export async function expectPageBasics(page: Page) {
  await expect(page.locator("h1")).toHaveCount(1);
  for (const landmark of ["header", "nav", "main", "footer"]) await expect(page.locator(landmark)).toHaveCount(1);
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

/** Tabs through `stops` elements after the skip link; each must show a 3px outline (its own or its field wrapper's). */
export async function expectFocusRings(page: Page, stops: number) {
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
