import type { NextRequest, NextResponse } from "next/server";
import type { Session } from "@/lib/auth/rules";
import { backendName } from "./index";

// The session as proxy.ts sees it, from the request's cookies only (an optimistic
// check; pages and actions check again). `carry` copies anything the backend had to
// set on the way (a refreshed Supabase session) onto the response proxy.ts returns,
// whether that's NextResponse.next() or a redirect.

export interface ProxySession {
  session: Session | null;
  carry(response: NextResponse): NextResponse;
}

export async function proxySession(request: NextRequest): Promise<ProxySession> {
  if (backendName() === "fixtures") {
    const { STUB_SESSION_COOKIE, sessionFromCookie } = await import("./fixtures/auth");
    return { session: sessionFromCookie(request.cookies.get(STUB_SESSION_COOKIE)?.value), carry: (response) => response };
  }
  throw new Error("The Supabase backend isn't built yet; set BACKERY_BACKEND=fixtures.");
}
