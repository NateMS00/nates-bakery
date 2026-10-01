// STUB: owner session. There is no auth backend yet (CLAUDE.md). Everyone is the
// owner unless the `backery_stub_session=guest` cookie is set (by Sign out),
// which lets the signed-out redirects be exercised. Replace with real auth.

export const STUB_SESSION_COOKIE = "backery_stub_session";

export interface Session {
  role: "owner";
  email: string;
}

const OWNER: Session = { role: "owner", email: "owner@backery.local" };

/** STUB: the owner's display name on shared pages ("Shared by Nathan"), until accounts exist. */
export const OWNER_NAME = "Nathan";

export function sessionFromCookie(value: string | undefined): Session | null {
  return value === "guest" ? null : OWNER;
}

// STUB credentials and reset links, until the auth backend is chosen. There is one
// owner account, created outside the app (SKELETON). Reset "emails" aren't sent: the
// link is written to the server log. A reset token is valid when it starts with
// "reset-" and hasn't been used; anything else counts as expired.
export const STUB_OWNER_EMAIL = "owner@backery.local";
export const STUB_OWNER_PASSWORD = "backery-owner";
export const PASSWORD_MIN_LENGTH = 12;

const used = ((globalThis as typeof globalThis & { __backeryUsedResetTokens?: Set<string> }).__backeryUsedResetTokens ??= new Set());

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === STUB_OWNER_EMAIL && password === STUB_OWNER_PASSWORD;
}

export function resetTokenIsValid(token: string | undefined): boolean {
  return Boolean(token?.startsWith("reset-")) && !used.has(token!);
}

export function spendResetToken(token: string) {
  used.add(token);
}

/** Only same-site paths, so `?next=` can't send anyone to another website. */
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/recipes";
}
