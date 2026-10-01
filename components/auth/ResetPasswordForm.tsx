"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { resetPassword, type ResetState } from "@/lib/auth/actions";

export function ResetPasswordForm({ token, minLength }: { token: string; minLength: number }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword.bind(null, token), {});
  const [show, setShow] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) field.current?.focus();
  }, [state]);

  return (
    <form action={action} noValidate className="mt-lg flex flex-col gap-base">
      <div>
        <TextField
          ref={field}
          id="new-password"
          name="password"
          label="New password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          {...(!state.error && { "aria-describedby": "new-password-hint" })}
          error={state.error}
        />
        {!state.error && (
          <p id="new-password-hint" className="mt-xs type-body-sm text-muted">
            At least {minLength} characters.
          </p>
        )}
      </div>
      {/* One field you can check by showing it, instead of typing it twice. */}
      <Checkbox checked={show} onChange={setShow}>
        Show password
      </Checkbox>
      <Button type="submit" variant="primary" aria-busy={pending || undefined} className="mt-sm w-full">
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
