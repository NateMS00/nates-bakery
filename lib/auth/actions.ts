"use server";

import { redirect } from "next/navigation";
import { authBackend } from "@/lib/backend";
import { PASSWORD_MIN_LENGTH, safeNext } from "./rules";

// Sign in, out, and password reset (SKELETON FLOW-04, BONES-system.md). The checks and
// messages live here; the backend (lib/backend) signs in and sends the reset link.

export async function signOut() {
  await (await authBackend()).signOut();
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
  if ((await (await authBackend()).signIn(email, password)) !== "ok") return { email, failed: true };
  redirect(safeNext(form.get("next")));
}

export type ResetRequestState = { email: string; error?: string; sent?: boolean };

export async function requestPasswordReset(_prev: ResetRequestState, form: FormData): Promise<ResetRequestState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email) return { email, error: "Enter your email" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { email, error: "Enter an email address like name@example.com" };
  await (await authBackend()).requestPasswordReset(email);
  // The same answer whether or not the address has an account.
  return { email, sent: true };
}

export type ResetState = { error?: string };

export async function resetPassword(token: string, _prev: ResetState, form: FormData): Promise<ResetState> {
  const auth = await authBackend();
  if (!(await auth.resetLinkIsValid(token))) redirect("/forgot-password?expired=1");
  const password = String(form.get("password") ?? "");
  if (password.length < PASSWORD_MIN_LENGTH) return { error: `Use at least ${PASSWORD_MIN_LENGTH} characters` };
  if ((await auth.completePasswordReset(token, password)) === "expired") redirect("/forgot-password?expired=1");
  redirect("/login?reset=done");
}
