import { NextResponse, type NextRequest } from "next/server";
import { authBackend } from "@/lib/backend";

// The emailed password-reset link lands here, through Supabase (?code=…, or
// ?token_hash=…&type=recovery with a custom template). A link that works goes to Set a
// new password. A used, expired, or broken one, one opened in a different browser, or
// Supabase's own ?error=… redirect goes to Forgot password with its notice, never an
// error page.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const ok = await (await authBackend()).confirmEmailLink({ code: params.get("code"), tokenHash: params.get("token_hash"), type: params.get("type") });
  const target = new URL(ok ? "/reset-password" : "/forgot-password?expired=1", request.url);
  return NextResponse.redirect(target);
}
