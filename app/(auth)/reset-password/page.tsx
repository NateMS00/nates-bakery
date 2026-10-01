import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthColumn } from "@/components/auth/AuthColumn";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { PASSWORD_MIN_LENGTH, resetTokenIsValid } from "@/lib/auth/stub";

// /reset-password?token= (Reset Password), SKELETON: set a new password from the
// emailed link, then /login with the Password updated notice. An expired, used, or
// missing token goes to /forgot-password with a notice.

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token || !resetTokenIsValid(token)) redirect("/forgot-password?expired=1");
  return (
    <AuthColumn title="Set a new password">
      <ResetPasswordForm token={token} minLength={PASSWORD_MIN_LENGTH} />
    </AuthColumn>
  );
}
