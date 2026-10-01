import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, type Page } from "@playwright/test";

// Per page and state: axe-core (WCAG 2.0/2.1 A and AA, plus best practices), the
// heading outline, landmarks, horizontal overflow, tap targets under 48px, and a Tab
// walk recording each stop and whether it shows a 3px focus ring.

// axe-core comes with eslint-plugin-jsx-a11y; loaded from node_modules by path.
const AXE = resolve("node_modules/axe-core/axe.min.js");

type Target = { name: string; path: string; guest?: boolean; failLoads?: boolean; setup?: (page: Page) => Promise<void> };

const click = (name: string | RegExp, role: "button" | "link" | "menuitem" = "button") => async (page: Page) => {
  await page.getByRole(role, { name }).first().click();
  await page.waitForTimeout(400);
};

const TARGETS: Target[] = [
  { name: "library", path: "/recipes" },
  { name: "library-filters", path: "/recipes", setup: async (page) => {
    const b = page.getByRole("button", { name: /^Filters/ });
    if (await b.isVisible()) await click(/^Filters/)(page);
  } },
  { name: "recipe", path: "/recipes/pasteis-de-nata" },
  { name: "recipe-share", path: "/recipes/pasteis-de-nata", setup: click("Share") },
  { name: "recipe-rating-prompt", path: "/recipes/brown-butter-cookies", setup: click("Mark as baked") },
  { name: "account-menu", path: "/recipes", setup: click("Account") },
  { name: "timer-alerts-sheet", path: "/recipes", setup: async (page) => {
    await click("Account")(page);
    await click("Timer alerts", "menuitem")(page);
  } },
  { name: "recipe-new", path: "/recipes/new" },
  { name: "recipe-edit", path: "/recipes/pasteis-de-nata/edit" },
  { name: "recipe-edit-row-menu", path: "/recipes/pasteis-de-nata/edit", setup: click(/^More actions/) },
  { name: "import", path: "/import" },
  { name: "import-review", path: "/import/d-canele" },
  { name: "bake", path: "/recipes/pasteis-de-nata/bake?scale=1&step=1" },
  { name: "bake-timer", path: "/recipes/pasteis-de-nata/bake?scale=1&step=1", setup: click(/^Start .* timer$/) },
  { name: "log", path: "/recipes/pasteis-de-nata/log" },
  { name: "log-form", path: "/recipes/pasteis-de-nata/log?new=1" },
  { name: "log-delete", path: "/recipes/pasteis-de-nata/log", setup: async (page) => {
    await click(/^More actions, Sat 26 Sep/)(page);
    await click("Delete", "menuitem")(page);
  } },
  { name: "shared", path: "/r/nata-k7p2qw", guest: true },
  { name: "expired", path: "/r/expired", guest: true },
  { name: "login", path: "/login", guest: true },
  { name: "login-error", path: "/login", guest: true, setup: async (page) => {
    await page.getByLabel("Email").fill("owner@backery.local");
    await page.getByLabel("Password").fill("nope");
    await click("Sign in")(page);
  } },
  { name: "forgot", path: "/forgot-password?expired=1", guest: true },
  { name: "reset", path: "/reset-password?token=reset-audit", guest: true },
  { name: "privacy", path: "/privacy" },
  { name: "not-found", path: "/no-such-page" },
  { name: "error", path: "/recipes/pasteis-de-nata", failLoads: true },
];

for (const t of TARGETS) {
  test(t.name, async ({ page, context }, info) => {
    const url = "http://localhost:3100";
    await context.addCookies([{ name: "backery_fixture_ns", value: `audit-${info.project.name}-${t.name}`, url }]);
    if (t.guest) await context.addCookies([{ name: "backery_stub_session", value: "guest", url }]);
    if (t.failLoads) await context.addCookies([{ name: "backery_stub_fail_loads", value: "1", url }]);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "wakeLock", { value: { request: async () => ({ release: async () => {}, addEventListener() {} }) } });
    });
    await page.goto(t.path);
    await page.locator("h1").first().waitFor();
    await page.waitForFunction(() => ![...document.querySelectorAll("[role=status]")].some((s) => /^Loading /.test(s.textContent ?? "")));
    await page.evaluate(() => document.fonts.ready);
    if (t.setup) await t.setup(page);

    const dir = `audit-results/${info.project.name}`;
    mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${t.name}.png` });

    await page.addScriptTag({ path: AXE });
    const axe = await page.evaluate(async () => {
      // @ts-expect-error injected
      const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } });
      return {
        violations: r.violations.map((v: { id: string; impact: string; help: string; tags: string[]; nodes: { target: string[]; failureSummary: string }[] }) => ({
          id: v.id, impact: v.impact, help: v.help, wcag: v.tags.filter((x) => /^wcag\d/.test(x)),
          nodes: v.nodes.slice(0, 6).map((n) => ({ target: n.target.join(" "), summary: n.failureSummary?.split("\n").slice(0, 3).join(" | ") })),
          count: v.nodes.length,
        })),
        incomplete: r.incomplete.map((v: { id: string; nodes: unknown[] }) => ({ id: v.id, count: v.nodes.length })),
      };
    });

    const structure = await page.evaluate(() => {
      const visible = (el: Element) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden"; };
      const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => !h.closest("[inert]") && (visible(h) || h.closest(".sr-only") || h.classList.contains("sr-only")))
        .map((h) => `${h.tagName}: ${(h.textContent ?? "").trim().slice(0, 60)}`);
      const landmarks = Object.fromEntries(["header", "nav", "main", "footer", "dialog[open]", "[role=dialog]"].map((s) => [s, document.querySelectorAll(s).length]));
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const small: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [role=radio], [role=menuitem], [role=switch], summary")) {
        if (!visible(el) || el.closest("[inert]")) continue;
        if (el.matches("input[type=checkbox], input[type=radio]") && el.closest("label")) continue;
        // Inline links in running text are exempt (2.5.5 is AAA; SKIN asks 48px for controls).
        const r = el.getBoundingClientRect();
        const box = el.closest("label") ? el.closest("label")!.getBoundingClientRect() : r;
        if (box.height < 47.5 || box.width < 47.5) {
          const name = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 30) || el.id || el.tagName;
          small.push(`${el.tagName.toLowerCase()} "${name}" ${Math.round(box.width)}×${Math.round(box.height)}`);
        }
      }
      return { headings, landmarks, overflow, small, title: document.title, lang: document.documentElement.lang };
    });

    // Tab walk: up to 60 stops.
    const stops: string[] = [];
    await page.locator("body").focus().catch(() => {});
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      const info2 = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const wrap = el.closest("div");
        const own = s.outlineStyle !== "none" ? parseFloat(s.outlineWidth) : 0;
        const wrapped = wrap ? parseFloat(getComputedStyle(wrap).outlineWidth) || 0 : 0;
        const peer = el.nextElementSibling ? parseFloat(getComputedStyle(el.nextElementSibling).outlineWidth) || 0 : 0;
        const ring = Math.max(own, wrapped, peer);
        const r = el.getBoundingClientRect();
        const name = el.getAttribute("aria-label") || el.textContent?.trim().replace(/\s+/g, " ").slice(0, 40) || el.getAttribute("name") || el.id || el.tagName;
        return { key: `${el.tagName.toLowerCase()}|${name}|${Math.round(r.top)}`, text: `${el.tagName.toLowerCase()} "${name}" ring=${ring}px${r.bottom < 0 || r.top > innerHeight ? " OFFSCREEN" : ""}` };
      });
      if (!info2) continue;
      if (stops.length && stops[0].startsWith(info2.key)) break; // wrapped around
      stops.push(`${info2.key}§${info2.text}`);
    }
    const focus = stops.map((s) => s.split("§")[1]);

    writeFileSync(`${dir}/${t.name}.json`, JSON.stringify({ target: t, ...structure, axe, focus }, null, 2));
  });
}

test("reduced motion: nothing slides, scales, spins, or shimmers", async ({ browser }, info) => {
  const context = await browser.newContext({ ...info.project.use, reducedMotion: "reduce" });
  await context.addCookies([{ name: "backery_fixture_ns", value: `audit-rm-${info.project.name}`, url: "http://localhost:3100" }]);
  const page = await context.newPage();
  const report: Record<string, string[]> = {};
  const long = async (label: string) => {
    report[label] = await page.evaluate(() =>
      document.getAnimations().map((a) => {
        const t = a.effect?.getTiming();
        const name = (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? "?";
        return `${name}: ${t?.duration}ms × ${t?.iterations}`;
      }).filter((s) => !/: 0\.01ms|: 0ms|: auto/.test(s)),
    );
  };
  await page.goto("http://localhost:3101/recipes/pasteis-de-nata", { waitUntil: "commit" });
  await page.getByText("Loading recipe").waitFor({ state: "attached" });
  await long("recipe loading skeleton");
  await page.getByRole("heading", { level: 1, name: "Pastéis de nata" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Share" }).click();
  await page.waitForTimeout(100);
  await long("share dialog opening");
  await page.keyboard.press("Escape");
  await page.goto("http://localhost:3100/recipes/pasteis-de-nata/log?new=1");
  await page.waitForTimeout(100);
  await long("log form opening");
  await page.goto("http://localhost:3100/import?url=https%3A%2F%2Fwww.instagram.com%2Freel%2FCaudit1%2F");
  await page.waitForTimeout(800);
  await long("import progress");
  const dir = `audit-results/${info.project.name}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/_reduced-motion.json`, JSON.stringify(report, null, 2));
  await context.close();
});
