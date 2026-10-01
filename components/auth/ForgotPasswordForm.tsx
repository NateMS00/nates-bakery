"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { requestPasswordReset, type ResetRequestState } from "@/lib/auth/actions";

// BONES-system /forgot-password: intro, the Link expired notice, and the form; sending
// replaces all three with the sent state, and focus moves to its heading.
export function ForgotPasswordForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(requestPasswordReset, { email: "" });
  const email = useRef<HTMLInputElement>(null);
  const sent = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.sent) sent.current?.focus();
    else if (state.error) email.current?.focus();
  }, [state]);

  if (state.sent) {
    // The same answer whether or not the address has an account.
    return (
      <div className="mt-lg">
        <h2 ref={sent} tabIndex={-1} className="type-heading text-ink outline-none">
          Check your email
        </h2>
        <p className="mt-sm type-body-md text-body">
          If there’s a Nate’s Bakery account for {state.email}, a reset link is on its way. It works once, for one hour. Open it on this device, in
          this browser.
        </p>
        <TextLink href="/login" className="mt-base inline-flex min-h-touch-min items-center type-body-md">
          Back to sign in
        </TextLink>
      </div>
    );
  }

  return (
    <>
      <p className="mt-sm type-body-md text-body">Enter the email you sign in with, and we’ll send you a link to set a new password.</p>
      {expired && (
        <div role="status" className="mt-base">
          <Notice tone="warning">That reset link has expired, was already used, or was opened in a different browser. Send a new one below.</Notice>
        </div>
      )}
      <form action={action} noValidate className="mt-lg flex flex-col gap-base">
        <TextField
          ref={email}
          id="reset-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.email}
          key={`email-${state.email}`}
          error={state.error}
        />
        <Button type="submit" variant="primary" aria-busy={pending || undefined} className="mt-sm w-full">
          {pending ? "Sending…" : "Send reset link"}
        </Button>
        <TextLink href="/login" className="inline-flex min-h-touch-min items-center self-start type-body-md">
          Back to sign in
        </TextLink>
      </form>
    </>
  );
}
