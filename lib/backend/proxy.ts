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
  return supabaseProxySession(request);
}

// Supabase: verify the session (refreshing it when its token is about to expire) before
// any response exists, as @supabase/ssr requires. A refreshed session's cookies go on
// the request, so the page rendered next sees them, and on the response, with the
// no-cache headers @supabase/ssr supplies so a CDN never serves one user's session to
// another.
async function supabaseProxySession(request: NextRequest): Promise<ProxySession> {
  const { createServerClient } = await import("@supabase/ssr");
  const { supabaseEnv } = await import("./supabase/env");
  const { RECOVERY_COOKIE, ownerFromClaims } = await import("./supabase/auth");
  const { url, key } = supabaseEnv();
  let written: { name: string; value: string; options: Parameters<NextResponse["cookies"]["set"]>[2] }[] = [];
  let headers: Record<string, string> = {};
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, cacheHeaders) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        written = list;
        headers = cacheHeaders;
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const session = ownerFromClaims(data?.claims, request.cookies.get(RECOVERY_COOKIE)?.value === "1");
  return {
    session,
    carry(response) {
      for (const { name, value, options } of written) response.cookies.set(name, value, options);
      for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      return response;
    },
  };
}
