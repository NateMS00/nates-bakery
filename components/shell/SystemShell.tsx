import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { AppShell } from "./AppShell";
import { PublicShell } from "./PublicShell";

/** Privacy, Not Found, Error: the App shell for the owner, the public shell for anyone else. */
export async function SystemShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  return session ? <AppShell>{children}</AppShell> : <PublicShell>{children}</PublicShell>;
}
