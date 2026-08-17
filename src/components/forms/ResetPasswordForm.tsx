"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthHashSessionCatcher } from "@/components/auth/AuthHashSessionCatcher";
import { Button } from "@/components/ui/Button";
import { FieldWrap } from "@/components/forms/FieldWrap";
import { updatePasswordAction } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

export function ResetPasswordForm({
  linkError,
  hasSession,
}: {
  linkError?: string | null;
  hasSession: boolean;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      updatePasswordAction(formData),
    null,
  );

  return (
    <AuthHashSessionCatcher workingLabel="Opening your reset link…" gate={!hasSession}>
      {linkError ? (
        <div className="grid gap-5">
          <p
            role="alert"
            className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink"
          >
            {linkError}
          </p>
          <p className="text-sm text-muted">
            <Link href="/forgot-password" className="font-semibold text-ink hover:text-brand">
              Request a new reset link
            </Link>
          </p>
        </div>
      ) : null}
      {hasSession ? (
        <form className="grid gap-5" action={action} noValidate>
          <FieldWrap label="New Password" htmlFor="new-password" required>
            <input
              id="new-password"
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
            htmlFor="confirm-password"
            required
            error={state?.error}
            hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
          >
            <input
              id="confirm-password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className="input-field"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </FieldWrap>
          <Button type="submit" disabled={pending} arrow>
            {pending ? "Updating…" : "Update Password"}
          </Button>
        </form>
      ) : null}
    </AuthHashSessionCatcher>
  );
}
