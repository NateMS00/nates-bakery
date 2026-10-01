import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/rules";
import { proxySession } from "@/lib/backend/proxy";

// Route-boundary access from SKELETON §3, with the configured backend's session.
// - App area (owner): signed out → /login?next=<path and query>
// - Auth area (guest-only): signed-in owner → the same-site `?next=` path, or /recipes
export async function proxy(request: NextRequest) {
  const { session, carry } = await proxySession(request);
  const { pathname, search } = request.nextUrl;
  const isAuthArea = ["/login", "/forgot-password", "/reset-password"].includes(pathname);

  if (isAuthArea && session) {
    return carry(NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url)));
  }
  if (!isAuthArea && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return carry(NextResponse.redirect(login));
  }
  return carry(NextResponse.next({ request }));
}

export const config = {
  matcher: ["/recipes/:path*", "/import/:path*", "/login", "/forgot-password", "/reset-password"],
};
