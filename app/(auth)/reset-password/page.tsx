import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthColumn } from "@/components/auth/AuthColumn";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/rules";
import { authBackend } from "@/lib/backend";

// /reset-password (Reset Password), SKELETON: set a new password from the emailed link,
// then /login with the Password updated notice. The backend decides whether the link
// still works (Supabase: a reset session from /auth/confirm; fixtures: ?token=); an
// expired, used, or missing one goes to /forgot-password with a notice.

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!(await (await authBackend()).resetLinkIsValid(token))) redirect("/forgot-password?expired=1");
  return (
    <AuthColumn title="Set a new password">
      <ResetPasswordForm token={token ?? ""} minLength={PASSWORD_MIN_LENGTH} />
    </AuthColumn>
  );
}
