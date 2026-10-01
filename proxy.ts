import { NextResponse, type NextRequest } from "next/server";
import { STUB_SESSION_COOKIE, safeNext, sessionFromCookie } from "@/lib/auth/stub";

// Route-boundary access from SKELETON §3, using the STUB session.
// - App area (owner): signed out → /login?next=<path and query>
// - Auth area (guest-only): signed-in owner → the same-site `?next=` path, or /recipes
export function proxy(request: NextRequest) {
  const session = sessionFromCookie(request.cookies.get(STUB_SESSION_COOKIE)?.value);
  const { pathname, search } = request.nextUrl;
  const isAuthArea = ["/login", "/forgot-password", "/reset-password"].includes(pathname);

  if (isAuthArea && session) {
    return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }
  if (!isAuthArea && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/recipes/:path*", "/import/:path*", "/login", "/forgot-password", "/reset-password"],
};
