import { authBackend } from "@/lib/backend";
import type { Session } from "./rules";

export type { Session };

export async function getSession(): Promise<Session | null> {
  return (await authBackend()).getSession();
}
