import type { Metadata } from "next";
import { AuthColumn } from "@/components/auth/AuthColumn";
import { LoginForm } from "@/components/auth/LoginForm";
import { Notice } from "@/components/ui/Notice";
import { safeNext } from "@/lib/auth/stub";

// /login (Sign In), SKELETON: email, password, a link to /forgot-password; the
// Password updated notice after a reset; no sign-up link. Continues to `?next=`.

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; reset?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next, reset } = await searchParams;
  return (
    <AuthColumn title="Sign in">
      {reset === "done" && (
        <div role="status" className="mt-base">
          <Notice tone="info">Password updated. Sign in with your new password.</Notice>
        </div>
      )}
      <LoginForm next={safeNext(next)} />
    </AuthColumn>
  );
}
