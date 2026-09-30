"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STUB_SESSION_COOKIE } from "./stub";

// STUB: sign out ends the stub session → /login (SKELETON Navigation, Utility).
export async function signOut() {
  (await cookies()).set(STUB_SESSION_COOKIE, "guest", { path: "/", sameSite: "lax" });
  redirect("/login");
}

// STUB: stands in for the real sign-in until /login is built (PROMPTS.md step 8).
export async function stubSignIn(next: string) {
  (await cookies()).delete(STUB_SESSION_COOKIE);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/recipes");
}
