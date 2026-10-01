import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { Session } from "@/lib/auth/rules";
import type { AuthBackend } from "../types";

// The fixtures backend's auth: a STUB owner session in a cookie, with stub credentials
// and reset links, so the Sign In pages behave as in production while testing.
// - Everyone is the owner unless `backery_stub_session=guest` is set (Sign out does).
// - Sign in as owner@backery.local / backery-owner.
// - Reset "emails" aren't sent; the link is written to the server log. A token is valid
//   when it starts with "reset-" and hasn't been used.

export const STUB_SESSION_COOKIE = "backery_stub_session";
const STUB_OWNER_EMAIL = "owner@backery.local";
const STUB_OWNER_PASSWORD = "backery-owner";
const OWNER: Session = { role: "owner", email: STUB_OWNER_EMAIL };

/** Shared with proxy.ts, which reads the cookie from the request. */
export function sessionFromCookie(value: string | undefined): Session | null {
  return value === "guest" ? null : OWNER;
}

const used = ((globalThis as typeof globalThis & { __backeryUsedResetTokens?: Set<string> }).__backeryUsedResetTokens ??= new Set());
const tokenIsValid = (token: string | undefined) => Boolean(token?.startsWith("reset-")) && !used.has(token!);

export const fixturesAuth: AuthBackend = {
  async getSession() {
    return sessionFromCookie((await cookies()).get(STUB_SESSION_COOKIE)?.value);
  },

  async signIn(email, password) {
    if (email.trim().toLowerCase() !== STUB_OWNER_EMAIL || password !== STUB_OWNER_PASSWORD) return "invalid";
    (await cookies()).delete(STUB_SESSION_COOKIE);
    return "ok";
  },

  async signOut() {
    (await cookies()).set(STUB_SESSION_COOKIE, "guest", { path: "/", sameSite: "lax" });
  },

  async requestPasswordReset(email) {
    console.info(`[stub] Password reset link for ${email}: /reset-password?token=reset-${randomUUID()}`);
  },

  // Fixture reset links carry their token straight to /reset-password.
  async confirmEmailLink() {
    return false;
  },

  async resetLinkIsValid(token) {
    return tokenIsValid(token);
  },

  async completePasswordReset(token) {
    if (!tokenIsValid(token)) return "expired";
    used.add(token!);
    return "ok";
  },
};
