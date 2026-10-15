import { expect, test, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, ready } from "./helpers";

// /import (Import), BONES-import.md. The import service is a stub: reel ids starting
// with Cprivate, Cdeleted, or Cnorecipe fail; others import in 4.5 seconds. Each test
// has its own copy of the fixtures (namespace cookie).

const shot = (page: Page, name: string) => capture(page, "import", name);
const NEW_REEL = "https://www.instagram.com/reel/Ckouign99/";
const field = (page: Page) => page.getByRole("textbox", { name: "Reel link" });
const importButton = (page: Page) => page.getByRole("button", { name: "Import", exact: true });

test.beforeEach(async ({ context }, info) => {
  const value = `${info.project.name}-${info.testId}`;
  for (const port of [3100, 3102]) await context.addCookies([{ name: "backery_fixture_ns", value, url: `http://localhost:${port}` }]);
});

test("first viewport, page checks, and Set up the Shortcut collapsed", async ({ page }) => {
  await ready(page, "/import");
  await shot(page, "01-first-viewport");
  await expectPageBasics(page);
  await expectPageTop(page);
  await expectTouchTargets(page);
  await expect(page.getByRole("link", { name: "Import", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(field(page)).toHaveAttribute("placeholder", "instagram.com/reel/…");
  // Recipes have been imported before, so setup is collapsed to its heading.
  const toggle = page.getByRole("button", { name: "Set up the Shortcut" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("heading", { name: "Set up the Shortcut" })).toHaveCount(0); // plain disclosure
  await toggle.click();
  await expect(page.getByRole("heading", { name: "Set up the Shortcut" })).toBeFocused();
  await expect(page.getByRole("link", { name: /Get the Shortcut/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter a recipe by hand" })).toHaveAttribute("href", "/recipes/new");
});

test("focus rings", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard focus checked on desktop");
  await ready(page, "/import");
  await expectFocusRings(page, 7);
});

test("first import: Set up the Shortcut open, and opened by the Library's link", async ({ page }) => {
  await ready(page, "http://localhost:3102/import");
  await expect(page.getByRole("heading", { name: "Set up the Shortcut" })).toBeVisible();
  await expect(page.getByText("In Instagram, tap Share on a reel, then Nate’s Bakery.")).toBeVisible();
  await shot(page, "02-first-import");
  // Library (collapsed state) links to #set-up-the-shortcut, which opens it.
  await ready(page, "/import#set-up-the-shortcut");
  await expect(page.getByRole("heading", { name: "Set up the Shortcut" })).toBeVisible();
});

test("Set up the Shortcut: all 4 steps, Apple Intelligence's reason, and the import key step", async ({ page }) => {
  await ready(page, "http://localhost:3102/import");
  const steps = page.locator("#set-up-the-shortcut ol > li");
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(1)).toContainText("Turn on Apple Intelligence");
  await expect(steps.nth(1)).toContainText("It reads the recipe on your device, free.");
  await expect(steps.nth(2)).toContainText("Add your import key.");
  await expect(page.getByRole("button", { name: "Create import key" })).toBeVisible();
  await expect(steps.nth(3)).toContainText("In Instagram, tap Share on a reel, then Nate’s Bakery.");
  await shot(page, "03-set-up-the-shortcut");
});

test("import key: Create shows it once with Copy; copying hides it, leaving the date", async ({ page }) => {
  await ready(page, "http://localhost:3102/import");
  const create = page.getByRole("button", { name: "Create import key" });
  await create.click();
  const field = page.getByRole("textbox", { name: "Import key" });
  await expect(field).toHaveValue(/^nbk_/);
  const copy = page.getByRole("button", { name: "Copy" });
  await expect(copy).toBeFocused();
  await shot(page, "04-import-key-revealed");

  await copy.click();
  await expect(field).toHaveCount(0); // never shown again once copied
  await expect(page.getByText("Key copied")).toBeVisible();
  await expect(page.getByText(/^Import key created /)).toBeVisible();
  await expect(page.getByRole("button", { name: "Revoke and create a new one" })).toBeFocused();
});

test("import key: Revoke and create a new one, confirmed inline, replaces the key at once", async ({ page }) => {
  await ready(page, "http://localhost:3102/import");
  await page.getByRole("button", { name: "Create import key" }).click();
  const firstKey = await page.getByRole("textbox", { name: "Import key" }).inputValue();
  await page.getByRole("button", { name: "Copy" }).click();

  const revoke = page.getByRole("button", { name: "Revoke and create a new one" });
  await revoke.click();
  await expect(page.getByText("The Shortcut stops working until you paste the new key.")).toBeVisible();
  const keep = page.getByRole("button", { name: "Keep current key" });
  await expect(keep).toBeFocused();
  await shot(page, "05-revoke-import-key-confirmation");

  await page.getByRole("button", { name: "Revoke and create", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Import key" });
  await expect(field).toHaveValue(/^nbk_/);
  expect(await field.inputValue()).not.toBe(firstKey);
  await expect(page.getByRole("button", { name: "Copy" })).toBeFocused();
});

test("Setup needed: ?error=no-key and ?error=bad-key open Set up the Shortcut with the right notice, focused", async ({ page }) => {
  await ready(page, "/import?error=no-key");
  await expect(page.getByRole("heading", { name: "Set up the Shortcut" })).toBeFocused();
  await expect(page.getByText("Add your import key to the Shortcut to start importing.")).toBeVisible();
  await shot(page, "06-setup-needed-no-key");

  await ready(page, "/import?error=bad-key");
  await expect(page.getByRole("heading", { name: "Set up the Shortcut" })).toBeFocused();
  await expect(page.getByText("Your import key no longer works. Create a new one.")).toBeVisible();
});

test("empty field and invalid link show the field error", async ({ page }) => {
  await ready(page, "/import");
  await importButton(page).click();
  await expect(page.getByText("Paste a link to an Instagram reel.")).toBeVisible();
  await expect(field(page)).toBeFocused();
  await field(page).fill("https://www.youtube.com/watch?v=abc");
  await importButton(page).click();
  await expect(page.getByText("That isn’t an Instagram reel or post link.", { exact: false })).toBeVisible();
  await expect(field(page)).toHaveAttribute("aria-invalid", "true");
  await expect(field(page)).toBeFocused();
  await shot(page, "03-invalid-link");
});

test("processing: stages, leave safely, then Review Import on its own", async ({ page }) => {
  await ready(page, "/import");
  await field(page).fill(NEW_REEL);
  await importButton(page).click();
  const progress = page.getByRole("list", { name: "Import progress" });
  await expect(progress).toBeVisible();
  await expect(importButton(page)).toBeDisabled();
  await expect(field(page)).toHaveAttribute("readonly", "");
  await expect(progress.getByRole("listitem").first()).toContainText("in progress");
  await expect(page.getByText("You can leave: it will wait in your Library under Drafts.")).toBeVisible();
  await expect(progress.getByRole("listitem").nth(1)).toContainText("in progress", { timeout: 3000 });
  await shot(page, "04-processing");
  await page.waitForURL(/\/import\/d-/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Review import");
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Kouign-amann");
});

test("?url= prefills the link and starts the import on load", async ({ page }) => {
  await page.goto(`/import?url=${encodeURIComponent(NEW_REEL)}`);
  await expect(page.getByRole("list", { name: "Import progress" })).toBeVisible();
  await expect(field(page)).toHaveValue(NEW_REEL);
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "05-url-autostart");
  // Leaving is safe: the draft waits in the Library.
  await page.getByRole("link", { name: "Go to Library" }).click();
  await page.waitForURL(/\/recipes$/);
  await expect(page.locator("#drafts-heading ~ ul > li").first()).toContainText(/Importing…|Kouign-amann/);
});

test("import failed: Enter it manually or Try another link", async ({ page }) => {
  const link = "https://www.instagram.com/reel/Cprivate42/";
  await ready(page, "/import");
  await field(page).fill(link);
  await importButton(page).click();
  const failed = page.getByRole("alert").filter({ hasText: "private" });
  await expect(failed).toContainText("This reel is private, so Nate’s Bakery can’t read it.");
  await expect(failed.getByRole("link", { name: "Enter it manually" })).toHaveAttribute("href", `/recipes/new?source=${encodeURIComponent(link)}`);
  await expect(importButton(page)).toBeDisabled();
  await expectTouchTargets(page);
  await shot(page, "06-import-failed");
  await failed.getByRole("button", { name: "Try another link" }).click();
  await expect(field(page)).toHaveValue("");
  await expect(field(page)).toBeFocused();
  await expect(importButton(page)).toBeEnabled();
});

test("already imported links to the recipe, with Import again", async ({ page }) => {
  await ready(page, "/import");
  await field(page).fill("instagram.com/reel/C9nataRita01");
  await importButton(page).click();
  await expect(page.getByText("You already saved this reel as")).toBeVisible();
  await expect(page.getByRole("link", { name: "Pastéis de nata" })).toHaveAttribute("href", "/recipes/pasteis-de-nata");
  await shot(page, "07-already-imported");
  await page.getByRole("button", { name: "Import again" }).click();
  await expect(page.getByRole("list", { name: "Import progress" })).toBeVisible();
});

test("Paste reads the clipboard into the field", async ({ page, context, isMobile }) => {
  test.skip(isMobile, "clipboard permissions are granted on desktop Chrome");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page, "/import");
  await page.evaluate((url) => navigator.clipboard.writeText(url), NEW_REEL);
  await page.getByRole("button", { name: "Paste" }).click();
  await expect(field(page)).toHaveValue(NEW_REEL);
});

test("signed out: the link survives sign-in", async ({ page, context }) => {
  await context.addCookies([{ name: "backery_stub_session", value: "guest", url: "http://localhost:3100" }]);
  await page.goto(`/import?url=${encodeURIComponent(NEW_REEL)}`);
  await page.waitForURL(/\/login\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(`/import?url=${encodeURIComponent(NEW_REEL)}`);
});
