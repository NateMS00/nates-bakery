import { expect, test, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, ready } from "./helpers";

// /import (Import), BONES-import.md. Import hands the link to the Shortcut
// (shortcuts://, a no-op in a test browser) and polls for a ready draft; the fixtures
// backend's caption fetch fails for reel ids starting with Cprivate, Cdeleted, or
// Cnorecipe. The real Shortcut's own calls (app/api/import/*) are simulated with
// page.request, the same way a real device would call them. Each test has its own
// copy of the fixtures (namespace cookie).

const shot = (page: Page, name: string) => capture(page, "import", name);
const NEW_REEL = "https://www.instagram.com/reel/Ckouign99/";
const field = (page: Page) => page.getByRole("textbox", { name: "Reel link" });
const importButton = (page: Page) => page.getByRole("button", { name: "Import", exact: true });

/** A minimal, valid Use Model reply (lib/import/extract.ts's expected shape). */
const VALID_REPLY = JSON.stringify({
  language: "English",
  title: "Kouign-amann",
  category: "viennoiserie",
  yield: { quantity: 12, unit: "pastry", unitPlural: "pastries" },
  totalTime: { hours: 4, minutes: 0 },
  ingredientGroups: [{ name: null, items: [{ name: "Flour", amount: "300 g", parts: [{ unit: "g", qty: "300" }], note: null }] }],
  stepGroups: [{ name: null, steps: [{ text: "Laminate the dough.", uses: ["Flour"] }] }],
});

/** Creates an import key via the UI, for simulated Shortcut calls below to authenticate with. */
async function makeImportKey(page: Page) {
  const toggle = page.getByRole("button", { name: "Set up the Shortcut" });
  if (await toggle.count()) await toggle.click(); // collapsed to a plain disclosure: open it first
  await page.getByRole("button", { name: "Create import key" }).click();
  return page.getByRole("textbox", { name: "Import key" }).inputValue();
}

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

test("import key: Create shows it once with Copy; copying keeps it visible until Done", async ({ page }) => {
  await ready(page, "http://localhost:3102/import");
  const create = page.getByRole("button", { name: "Create import key" });
  await create.click();
  const field = page.getByRole("textbox", { name: "Import key" });
  await expect(field).toHaveValue(/^nbk_/);
  const key = await field.inputValue();
  const copy = page.getByRole("button", { name: "Copy" });
  await expect(copy).toBeFocused();
  await shot(page, "04-import-key-revealed");

  await copy.click();
  await expect(page.getByText("Key copied")).toBeVisible();
  // A failed paste shouldn't force a new key: it stays visible until Done.
  await expect(field).toHaveValue(key);
  await expect(page.getByText(/^Import key created /)).toHaveCount(0);

  await page.getByRole("button", { name: "Done" }).click();
  await expect(field).toHaveCount(0); // never shown again once dismissed
  await expect(page.getByText(/^Import key created /)).toBeVisible();
  await expect(page.getByRole("button", { name: "Revoke and create a new one" })).toBeFocused();
});

test("import key: Revoke and create a new one, confirmed inline, replaces the key at once", async ({ page }) => {
  await ready(page, "http://localhost:3102/import");
  await page.getByRole("button", { name: "Create import key" }).click();
  const firstKey = await page.getByRole("textbox", { name: "Import key" }).inputValue();
  await page.getByRole("button", { name: "Copy" }).click();
  await page.getByRole("button", { name: "Done" }).click();

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

test("Handed to the Shortcut: leave safely, then Open the draft appears once the Shortcut finishes", async ({ page }) => {
  await ready(page, "/import");
  const importKey = await makeImportKey(page);

  await field(page).fill(NEW_REEL);
  await importButton(page).click();
  await expect(page.getByText("Importing in the Shortcut")).toBeVisible();
  await expect(importButton(page)).toBeDisabled();
  await expect(field(page)).toHaveAttribute("readonly", "");
  for (const stage of ["Getting the caption", "Reading the recipe", "Converting to grams"]) await expect(page.getByText(stage)).toBeVisible();
  await expect(page.getByText("You can leave: it will wait in your Library under Drafts.")).toBeVisible();
  await shot(page, "04-handed-off");

  // What the Shortcut itself does (docs/shortcut-guide.md): start-import, Use Model
  // (stood in for by VALID_REPLY), then finish-import.
  const start = await page.request.post("/api/import/start", { data: { url: NEW_REEL, importKey } });
  const { status: startStatus, draftId, caption } = await start.json();
  expect(startStatus).toBe("started");
  expect(caption).toBeTruthy();
  const finish = await page.request.post("/api/import/finish", { data: { draftId, importKey, reply: VALID_REPLY } });
  expect((await finish.json()).status).toBe("ready");

  const openDraft = page.getByRole("link", { name: "Open the draft" });
  await expect(openDraft).toBeVisible({ timeout: 6000 }); // polling interval
  await shot(page, "04b-handed-off-open-the-draft");
  await openDraft.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Review import");
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Kouign-amann");
});

test("?url= prefills the link; Import still needs to be pressed", async ({ page }) => {
  await page.goto(`/import?url=${encodeURIComponent(NEW_REEL)}`);
  await expect(field(page)).toHaveValue(NEW_REEL);
  await expect(page.getByText("Importing in the Shortcut")).toHaveCount(0);
  await expect(importButton(page)).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await shot(page, "05-url-prefilled");
});

test("start-import: a private, deleted, or no-recipe reel fails with its own reason", async ({ page }) => {
  await ready(page, "/import");
  const importKey = await makeImportKey(page);
  for (const [id, reason] of [
    ["Cprivate42", "private"],
    ["Cdeleted42", "deleted"],
    ["Cnorecipe42", "no-recipe"],
  ] as const) {
    const res = await page.request.post("/api/import/start", { data: { url: `https://www.instagram.com/reel/${id}/`, importKey } });
    expect(await res.json(), id).toEqual({ status: "failed", reason });
  }
});

test("Import failed: Enter it manually or Try another link", async ({ page }) => {
  const link = "https://www.instagram.com/reel/Cprivate42/";
  await ready(page, `/import?error=private&url=${encodeURIComponent(link)}`);
  const failed = page.getByRole("alert").filter({ hasText: "private" });
  await expect(failed).toContainText("This reel is private, so Nate’s Bakery can’t read it.");
  await expect(failed.getByRole("link", { name: "Enter it manually" })).toHaveAttribute("href", `/recipes/new?source=${encodeURIComponent(link)}`);
  await expectTouchTargets(page);
  await shot(page, "06-import-failed");
  await failed.getByRole("button", { name: "Try another link" }).click();
  await expect(field(page)).toHaveValue("");
  await expect(field(page)).toBeFocused();
  await expect(importButton(page)).toBeEnabled();
});

test("No recipe in this caption: Watch the reel, Enter it manually, or Try another link", async ({ page }) => {
  const link = "https://www.instagram.com/reel/Cnorecipe42/";
  await ready(page, `/import?error=no-recipe&url=${encodeURIComponent(link)}`);
  const failed = page.getByRole("alert").filter({ hasText: "couldn’t find a recipe" });
  await expect(failed).toContainText("Nate’s Bakery couldn’t find a recipe in this reel.");
  await expect(failed.getByRole("link", { name: "Watch the reel" })).toHaveAttribute("href", link);
  await expect(failed.getByRole("link", { name: "Enter it manually" })).toBeVisible();
  await expect(failed.getByRole("button", { name: "Try another link" })).toBeVisible();
  await shot(page, "07-no-recipe");
});

test("Daily limit reached: Enter it manually only, no Try another link", async ({ page }) => {
  const link = "https://www.instagram.com/reel/Ckouign99/";
  await ready(page, `/import?error=limit&url=${encodeURIComponent(link)}`);
  const failed = page.getByRole("alert").filter({ hasText: "today’s 30 imports" });
  await expect(failed).toContainText("You’ve used today’s 30 imports. It resets in a few hours.");
  await expect(failed.getByRole("link", { name: "Enter it manually" })).toBeVisible();
  await expect(failed.getByRole("button", { name: "Try another link" })).toHaveCount(0);
  await shot(page, "08-daily-limit-reached");
});

test("start-import: an already-saved reel answers already, title and recipeId included", async ({ page }) => {
  await ready(page, "/import");
  const importKey = await makeImportKey(page);
  const res = await page.request.post("/api/import/start", { data: { url: "https://www.instagram.com/reel/C9nataRita01/", importKey } });
  expect(await res.json()).toEqual({ status: "already", recipeId: "pasteis-de-nata", title: "Pastéis de nata" });
});

test("Already imported: links to the recipe, Import again hands the Shortcut the link once more", async ({ page }) => {
  const link = "https://www.instagram.com/reel/C9nataRita01/";
  await ready(page, `/import?error=already&recipeId=pasteis-de-nata&title=${encodeURIComponent("Pastéis de nata")}&url=${encodeURIComponent(link)}`);
  await expect(page.getByText("You already saved this reel as")).toBeVisible();
  await expect(page.getByRole("link", { name: "Pastéis de nata" })).toHaveAttribute("href", "/recipes/pasteis-de-nata");
  await shot(page, "07-already-imported");
  await page.getByRole("button", { name: "Import again" }).click();
  await expect(page.getByText("Importing in the Shortcut")).toBeVisible();
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
