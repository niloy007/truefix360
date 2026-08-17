"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldWrap } from "@/components/forms/FieldWrap";
import { completeInvitePasswordAction } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

export function InvitePasswordForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      completeInvitePasswordAction(formData),
    null,
  );

  return (
    <form className="grid gap-5" action={action} noValidate>
      <FieldWrap label="Create Password" htmlFor="invite-password" required>
        <input
          id="invite-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="input-field"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
      </FieldWrap>
      <FieldWrap
        label="Confirm Password"
        htmlFor="invite-confirm-password"
        required
        error={state?.error}
        hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
      >
        <input
          id="invite-confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          className="input-field"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
      </FieldWrap>
      <Button type="submit" disabled={pending} arrow>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
