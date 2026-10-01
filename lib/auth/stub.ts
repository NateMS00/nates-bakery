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
