import type { AuthBackend, DataBackend } from "./types";

// Picks the backend from BACKERY_BACKEND (server only):
// - "fixtures": in-memory fixtures and a stub owner session, for `npm run dev` and the
//   Playwright suites (both set it). Refused on a Vercel production deployment, so
//   fixtures can never reach the live site.
// - anything else (unset in production): Supabase.

export type BackendName = "fixtures" | "supabase";

export function backendName(): BackendName {
  const name = process.env.BACKERY_BACKEND === "fixtures" ? "fixtures" : "supabase";
  if (name === "fixtures" && process.env.VERCEL_ENV === "production") {
    throw new Error("BACKERY_BACKEND=fixtures is not allowed in production.");
  }
  return name;
}

function notBuiltYet(): never {
  throw new Error("The Supabase backend isn't built yet; set BACKERY_BACKEND=fixtures.");
}

export async function dataBackend(): Promise<DataBackend> {
  if (backendName() === "fixtures") return (await import("./fixtures/data")).fixturesData;
  return (await import("./supabase/data")).supabaseData;
}

export async function authBackend(): Promise<AuthBackend> {
  if (backendName() === "fixtures") return (await import("./fixtures/auth")).fixturesAuth;
  return supabaseAuthPlaceholder;
}

// Until the Supabase auth lands: nobody is signed in, and everything else refuses.
// getSession reads the request's cookies first, as the real one will, so pages that
// depend on the session (Not found's shell) render per request instead of at build.
const supabaseAuthPlaceholder: AuthBackend = {
  async getSession() {
    const { cookies } = await import("next/headers");
    await cookies();
    return null;
  },
  signIn: notBuiltYet,
  signOut: notBuiltYet,
  requestPasswordReset: notBuiltYet,
  resetLinkIsValid: notBuiltYet,
  completePasswordReset: notBuiltYet,
};
