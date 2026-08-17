"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FieldWrap } from "@/components/forms/FieldWrap";
import {
  getBrowserSupabaseConfigStatus,
  getPasswordRecoveryRedirectTo,
  isBrowserSupabaseConfigured,
} from "@/config/public-env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);
  const showDevDiagnostic = process.env.NODE_ENV === "development";

  async function handleSubmit(formData: FormData) {
    setError(null);
    if (!isBrowserSupabaseConfigured()) {
      setError("Password reset is not configured yet.");
      return;
    }
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email) {
      setError("Email is required.");
      return;
    }

    setPending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordRecoveryRedirectTo(),
      });
      setOk(true);
    } catch {
      setOk(true);
    } finally {
      setPending(false);
    }
  }

  if (ok) {
    return (
      <p role="status" className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
        If an account exists for that email, a reset link is on the way. Check your inbox and spam folder.
      </p>
    );
  }

  return (
    <form className="grid gap-5" action={handleSubmit} noValidate>
      {showDevDiagnostic ? (
        <p className="text-xs text-muted">
          Supabase browser config: {getBrowserSupabaseConfigStatus()}
        </p>
      ) : null}
      <FieldWrap label="Email" htmlFor="reset-email" required error={error ?? undefined}>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          className="input-field"
          required
        />
      </FieldWrap>
      <Button type="submit" disabled={pending} arrow>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-sm text-muted">
        <Link href="/login" className="font-semibold text-ink hover:text-brand">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
