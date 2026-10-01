import { NextResponse, type NextRequest } from "next/server";
import { authBackend } from "@/lib/backend";

// The emailed password-reset link lands here (Supabase email template:
// /auth/confirm?token_hash=…&type=recovery). A link that works goes to Set a new
// password; a used, expired, or broken one goes to Forgot password with its notice.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const ok = await (await authBackend()).confirmEmailLink(params.get("token_hash"), params.get("type"));
  const target = new URL(ok ? "/reset-password" : "/forgot-password?expired=1", request.url);
  return NextResponse.redirect(target);
}
