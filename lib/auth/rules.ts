// Auth rules that hold for every backend (BONES-system.md).

export interface Session {
  role: "owner";
  email: string;
}

/** The owner's display name on shared pages ("Shared by Nathan"); one owner, no accounts yet. */
export const OWNER_NAME = "Nathan";

export const PASSWORD_MIN_LENGTH = 12;

/** Only same-site paths, so `?next=` can't send anyone to another website. */
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/recipes";
}
