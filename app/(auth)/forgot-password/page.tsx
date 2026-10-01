import type { Metadata } from "next";
import { AuthColumn } from "@/components/auth/AuthColumn";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Notice } from "@/components/ui/Notice";

// /forgot-password (Forgot Password), SKELETON: send a reset link to the owner's email.
// An expired or used reset link lands here with a notice.

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <AuthColumn title="Reset your password" intro="Enter the email you sign in with, and we’ll send you a link to set a new password.">
      {expired === "1" && (
        <div role="status" className="mt-base">
          <Notice tone="warning">That reset link has expired or was already used. Send a new one below.</Notice>
        </div>
      )}
      <ForgotPasswordForm />
    </AuthColumn>
  );
}
