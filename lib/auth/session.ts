import { cookies } from "next/headers";
import { STUB_SESSION_COOKIE, sessionFromCookie, type Session } from "./stub";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return sessionFromCookie(store.get(STUB_SESSION_COOKIE)?.value);
}
