import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { capture, expectFocusRings, expectPageBasics, expectPageTop, expectTouchTargets, ready } from "./helpers";

// Auth and system pages (PROMPTS.md step 8), built from SKELETON.md alone: /login,
// /forgot-password, /reset-password, /privacy, not-found, and error. Auth is a STUB
// (lib/auth/stub.ts): owner@backery.local / backery-owner; reset tokens start "reset-".

const shot = (page: Page, name: string, fullPage = false) => capture(page, "system", name, fullPage);
const EMAIL = "owner@backery.local";
const PASSWORD = "backery-owner";

async function signedOut(context: BrowserContext) {
  await context.addCookies([{ name: "backery_stub_session", value: "guest", url: "http://localhost:3100" }]);
}

/** Public shell: header, main, footer, no nav, the wordmark isn't a link; one h1; no horizontal scroll. */
async function expectPublicShell(page: Page) {
  await expect(page.locator("h1")).toHaveCount(1);
  for (const landmark of ["header", "main", "footer"]) await expect(page.locator(landmark)).toHaveCount(1);
  await expect(page.locator("nav")).toHaveCount(0);
  await expect(page.locator("header a")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
}

test.beforeEach(async ({ context }, info) => {
  await context.addCookies([{ name: "backery_fixture_ns", value: `${info.project.name}-${info.testId}`, url: "http://localhost:3100" }]);
});

test.describe("signed out", () => {
  test.beforeEach(async ({ context }) => signedOut(context));

  test("sign in: page checks, missing fields, wrong password, then the next page", async ({ page }) => {
    const next = "/import?url=https%3A%2F%2Fwww.instagram.com%2Freel%2FCkouign99%2F";
    await page.goto(next);
    await page.waitForURL(/\/login\?next=/);
    await ready(page, page.url());
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in");
    await expect(page.getByRole("link", { name: /sign up|create account/i })).toHaveCount(0);
    await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "username");
    await expect(page.getByLabel("Password")).toHaveAttribute("autocomplete", "current-password");
    await shot(page, "01-login");
    await expectPublicShell(page);
    await expectPageTop(page);
    await expectTouchTargets(page);
    await expectFocusRings(page, 4);

    // Missing fields: errors on each, focus on the first.
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter your email")).toBeVisible();
    await expect(page.getByText("Enter your password")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeFocused();

    // Wrong password: one message for either mistake, focused so it's read out; the email is kept.
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill("not-it");
    await page.getByRole("button", { name: "Sign in" }).click();
    const error = page.getByText("Email or password is incorrect.");
    await expect(error).toBeVisible();
    await expect(page.locator(":focus")).toContainText("Email or password is incorrect.");
    await expect(page.getByLabel("Email")).toHaveValue(EMAIL);
    await shot(page, "02-login-error");

    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/import\?url=/);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("sign in: ?next= can't send you to another site", async ({ page }) => {
    await ready(page, "/login?next=//evil.example/steal");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/localhost:3100\/recipes$/);
  });

  test("forgot password: request a link; the answer doesn't reveal accounts", async ({ page }) => {
    await ready(page, "/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reset your password");
    await shot(page, "03-forgot");
    await expectPublicShell(page);
    await expectTouchTargets(page);

    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Enter your email")).toBeVisible();
    await page.getByLabel("Email").fill("someone@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeFocused();
    await expect(page.getByText(/If someone@example\.com belongs to the owner account/)).toBeVisible();
    await shot(page, "04-forgot-sent");
  });

  test("reset password: too short, then saved → sign in with the notice; the link works once", async ({ page }, info) => {
    const token = `reset-${info.project.name}-${info.testId}`;
    await ready(page, `/reset-password?token=${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Set a new password");
    const field = page.getByLabel("New password");
    await expect(field).toHaveAttribute("autocomplete", "new-password");
    await expect(field).toHaveAccessibleDescription("At least 12 characters.");
    await shot(page, "05-reset");
    await expectTouchTargets(page);

    await field.fill("short");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByText("Use at least 12 characters")).toBeVisible();
    await expect(field).toBeFocused();
    await expect(field).toHaveAccessibleDescription("Use at least 12 characters");
    await page.getByRole("checkbox", { name: "Show password" }).check();
    await expect(field).toHaveAttribute("type", "text");
    await shot(page, "06-reset-error");

    await field.fill("a much longer password");
    await page.getByRole("button", { name: "Save new password" }).click();
    await page.waitForURL(/\/login\?reset=done$/);
    await expect(page.getByText("Password updated. Sign in with your new password.")).toBeVisible();
    await shot(page, "07-login-password-updated");

    // Used once: the same link now goes to Forgot Password with a notice.
    await page.goto(`/reset-password?token=${token}`);
    await page.waitForURL(/\/forgot-password\?expired=1$/);
    await expect(page.getByText("That reset link has expired or was already used. Send a new one below.")).toBeVisible();
    await shot(page, "08-forgot-expired");
  });

  test("reset password: an invalid or missing token", async ({ page }) => {
    for (const path of ["/reset-password?token=nope", "/reset-password"]) {
      await page.goto(path);
      await page.waitForURL(/\/forgot-password\?expired=1$/);
    }
  });

  test("privacy and not-found use the public shell", async ({ page }) => {
    await ready(page, "/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(["What Backery stores", "What a share link shows", "Reels"]);
    await expectPublicShell(page);
    await expectPageTop(page);
    await shot(page, "09-privacy-signed-out", true);

    await ready(page, "/no-such-page");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    await expectPublicShell(page);
    await shot(page, "10-not-found-signed-out");
  });
});

test.describe("signed in", () => {
  test("auth pages send the owner to /recipes", async ({ page }) => {
    for (const path of ["/login", "/forgot-password", "/reset-password?token=reset-x"]) {
      await page.goto(path);
      await page.waitForURL(/\/recipes$/);
    }
  });

  test("privacy in the App shell; reached from the footer", async ({ page }) => {
    await ready(page, "/recipes");
    await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
    await expectPageBasics(page);
    await expectPageTop(page);
    await expectTouchTargets(page);
    await shot(page, "11-privacy");
    await shot(page, "12-privacy-full", true);
  });

  test("not found: unknown route and unknown recipe link to the Library", async ({ page }) => {
    for (const path of ["/no-such-page", "/recipes/no-such-recipe"]) {
      await ready(page, path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
      await expect(page.getByRole("link", { name: "Go to your recipes" })).toHaveAttribute("href", "/recipes");
      await expectPageBasics(page);
    }
    await expectPageTop(page);
    await expectTouchTargets(page);
    await shot(page, "13-not-found");
  });

  test("error: Try again reloads the page once the failure clears", async ({ page, context }) => {
    await context.addCookies([{ name: "backery_stub_fail_loads", value: "1", url: "http://localhost:3100" }]);
    await page.goto("/recipes/pasteis-de-nata");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Something went wrong");
    await expect(heading).toBeFocused();
    await expect(page.getByRole("link", { name: "Go to your recipes" })).toHaveAttribute("href", "/recipes");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible(); // still in the App shell
    await expectPageBasics(page);
    await expectTouchTargets(page);
    await page.evaluate(() => document.fonts.ready);
    await shot(page, "14-error");

    await context.clearCookies({ name: "backery_stub_fail_loads" });
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(heading).toHaveText("Pastéis de nata");
  });

  test("error on a shared page: Share shell, retry only", async ({ page, context }) => {
    await context.addCookies([{ name: "backery_stub_fail_loads", value: "1", url: "http://localhost:3100" }]);
    await page.goto("/r/nata-k7p2qw");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Something went wrong");
    await expect(page.locator("nav")).toHaveCount(0);
    await expect(page.locator("main a")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await shot(page, "15-error-shared");
  });
});
