"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PASSWORD_MIN_LENGTH, STUB_SESSION_COOKIE, checkCredentials, resetTokenIsValid, safeNext, spendResetToken } from "./stub";

// STUB auth actions over lib/auth/stub.ts, with the real pages' behavior (SKELETON
// FLOW-04), so the UI is final while the backend is still to be chosen.

export async function signOut() {
  (await cookies()).set(STUB_SESSION_COOKIE, "guest", { path: "/", sameSite: "lax" });
  redirect("/login");
}

export type SignInState = { email: string; errors?: { email?: string; password?: string }; failed?: boolean };

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const errors: SignInState["errors"] = {};
  if (!email) errors.email = "Enter your email";
  if (!password) errors.password = "Enter your password";
  if (errors.email || errors.password) return { email, errors };
  // One message for either mistake, so the page never reveals which email has an account.
  if (!checkCredentials(email, password)) return { email, failed: true };
  (await cookies()).delete(STUB_SESSION_COOKIE);
  redirect(safeNext(form.get("next")));
}

export type ResetRequestState = { email: string; error?: string; sent?: boolean };

export async function requestPasswordReset(_prev: ResetRequestState, form: FormData): Promise<ResetRequestState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email) return { email, error: "Enter your email" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { email, error: "Enter an email address like name@example.com" };
  // STUB: no email is sent; the link goes to the server log instead.
  console.info(`[stub] Password reset link for ${email}: /reset-password?token=reset-${randomUUID()}`);
  // The same answer whether or not the address has an account.
  return { email, sent: true };
}

export type ResetState = { error?: string };

export async function resetPassword(token: string, _prev: ResetState, form: FormData): Promise<ResetState> {
  if (!resetTokenIsValid(token)) redirect("/forgot-password?expired=1");
  const password = String(form.get("password") ?? "");
  if (password.length < PASSWORD_MIN_LENGTH) return { error: `Use at least ${PASSWORD_MIN_LENGTH} characters` };
  spendResetToken(token);
  redirect("/login?reset=done");
}
