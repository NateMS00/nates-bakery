import { cookies } from "next/headers";
import type { Session } from "@/lib/auth/rules";
import type { AuthBackend } from "../types";
import { supabaseServer } from "./server";

// Supabase Auth: one owner account (created in the dashboard; sign-ups are off), email
// and password, the session in cookies (@supabase/ssr).
//
// Password reset (BONES-system.md), single use, with Supabase's default email template:
// 1. Forgot password asks Supabase to email a reset link that comes back to
//    /auth/confirm (redirectTo; allowed in the dashboard's redirect URLs). The server
//    client uses PKCE, so this browser also keeps a one-time code verifier in a cookie.
// 2. The link goes through Supabase and lands on /auth/confirm?code=…, which exchanges
//    the code with that verifier (Supabase uses the code up) for a session, and sets
//    RECOVERY_COOKIE: this session may only set a new password. While the cookie is
//    there, nobody counts as signed in anywhere else in the app. Opened in another
//    browser, there's no verifier, the exchange fails, and the page says the link
//    expired. (A custom template could send ?token_hash= instead; that works too.)
// 3. Set a new password updates it, signs out every session, and clears the cookie, so
//    neither the link nor the page works again (→ Forgot password, "expired").

export const RECOVERY_COOKIE = "backery_recovery";
const RECOVERY_MAX_AGE = 60 * 60; // an hour, like the reset link itself

/** The signed-in owner, from a verified session (getClaims checks the token). */
export function ownerFromClaims(claims: { email?: unknown } | null | undefined, recovering: boolean): Session | null {
  if (!claims || recovering) return null;
  return { role: "owner", email: typeof claims.email === "string" ? claims.email : "" };
}

async function recovering() {
  return (await cookies()).get(RECOVERY_COOKIE)?.value === "1";
}

async function endRecovery() {
  (await cookies()).delete(RECOVERY_COOKIE);
}

export const supabaseAuth: AuthBackend = {
  async getSession() {
    const db = await supabaseServer();
    const { data } = await db.auth.getClaims();
    return ownerFromClaims(data?.claims, await recovering());
  },

  async signIn(email, password) {
    const db = await supabaseServer();
    // Any failure (wrong email, wrong password, too many tries) reads the same.
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return "invalid";
    await endRecovery();
    return "ok";
  },

  async signOut() {
    const db = await supabaseServer();
    await db.auth.signOut({ scope: "local" });
    await endRecovery();
  },

  async requestPasswordReset(email, confirmUrl) {
    const db = await supabaseServer();
    // Supabase answers the same for unknown addresses; errors (like rate limits) are
    // logged, never shown, so the page can't reveal which emails have an account.
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: confirmUrl });
    if (error) console.warn(`Password reset email not sent: ${error.message}`);
  },

  async confirmEmailLink({ code, tokenHash, type }) {
    const db = await supabaseServer();
    let ok = false;
    try {
      if (code) {
        // Throws, rather than returning an error, when this browser has no verifier.
        ok = !(await db.auth.exchangeCodeForSession(code)).error;
      } else if (tokenHash && type === "recovery") {
        ok = !(await db.auth.verifyOtp({ type: "recovery", token_hash: tokenHash })).error;
      }
    } catch {
      ok = false;
    }
    if (!ok) return false;
    (await cookies()).set(RECOVERY_COOKIE, "1", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: RECOVERY_MAX_AGE });
    return true;
  },

  async resetLinkIsValid() {
    if (!(await recovering())) return false;
    const db = await supabaseServer();
    const { data } = await db.auth.getClaims();
    return Boolean(data?.claims);
  },

  async completePasswordReset(_token, password) {
    if (!(await this.resetLinkIsValid(undefined))) return "expired";
    const db = await supabaseServer();
    const { error } = await db.auth.updateUser({ password });
    if (error) {
      console.warn(`Password not updated: ${error.message}`);
      return "expired";
    }
    // Every session, on every device, has to sign in again with the new password.
    await db.auth.signOut({ scope: "global" });
    await endRecovery();
    return "ok";
  },
};
