import type { Metadata } from "next";
import { AuthColumn } from "@/components/auth/AuthColumn";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

// /forgot-password (Forgot Password), SKELETON: send a reset link to the owner's email.
// An expired or used reset link lands here with a notice.

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <AuthColumn title="Reset your password">
      <ForgotPasswordForm expired={expired === "1"} />
    </AuthColumn>
  );
}
