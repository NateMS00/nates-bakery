"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormError } from "@/components/auth/FormError";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { signIn, type SignInState } from "@/lib/auth/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { email: "" });
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  // A missing field: focus the first one with an error.
  useEffect(() => {
    if (state.errors?.email) email.current?.focus();
    else if (state.errors?.password) password.current?.focus();
  }, [state]);

  return (
    <form action={action} noValidate className="mt-lg flex flex-col gap-base">
      {state.failed && <FormError version={state}>Email or password is incorrect.</FormError>}
      <input type="hidden" name="next" value={next} />
      <TextField
        ref={email}
        id="login-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state.email}
        key={`email-${state.email}`}
        error={state.errors?.email}
      />
      <TextField
        ref={password}
        id="login-password"
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={state.errors?.password}
      />
      <Button type="submit" variant="primary" aria-busy={pending || undefined} className="mt-sm w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <TextLink href="/forgot-password" className="inline-flex min-h-touch-min items-center self-start type-body-md">
        Forgot password?
      </TextLink>
    </form>
  );
}
