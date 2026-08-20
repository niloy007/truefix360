"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FieldWrap } from "@/components/forms/FieldWrap";
import { loginAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type AccountType = "client" | "vendor";

function resolveInitialType(searchParams: URLSearchParams): AccountType {
  const type = (searchParams.get("type") ?? "").toLowerCase();
  if (type === "vendor") return "vendor";
  return "client";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const presetError = searchParams.get("error");
  const passwordReset = searchParams.get("passwordReset");
  const reset = searchParams.get("reset");
  const [accountType, setAccountType] = useState<AccountType>(() =>
    resolveInitialType(searchParams),
  );
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => loginAction(formData),
    null,
  );

  const message =
    state?.error ||
    (presetError === "not_configured"
      ? "Portal access is not configured yet."
      : presetError === "forbidden"
        ? "This account does not have access to that area."
        : null);

  return (
    <form className="grid gap-5" action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      {/* UX only — never used for authorization */}
      <input type="hidden" name="accountTypeHint" value={accountType} />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Account type</legend>
        <p className="mb-2 text-xs text-muted">
          This helps you find the right portal. Access is determined by your TrueFix360 account, not
          this selection.
        </p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account type">
          <button
            type="button"
            aria-pressed={accountType === "client"}
            onClick={() => setAccountType("client")}
            className={cn(
              "border px-3 py-3 text-center text-sm font-semibold transition",
              accountType === "client"
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-ink hover:border-brand/50",
            )}
          >
            Client / Partner
          </button>
          <button
            type="button"
            aria-pressed={accountType === "vendor"}
            onClick={() => setAccountType("vendor")}
            className={cn(
              "border px-3 py-3 text-center text-sm font-semibold transition",
              accountType === "vendor"
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-ink hover:border-brand/50",
            )}
          >
            Vendor
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">
          {accountType === "vendor" ? "Vendor Access" : "Client & Partner Access"}
        </p>
        <p className="mt-1 text-xs text-muted">
          {accountType === "vendor"
            ? "Sign in with the credentials TrueFix360 provisioned for your vendor organization."
            : "Sign in with the credentials TrueFix360 provisioned for your client or partner organization."}
        </p>
      </fieldset>
      <FieldWrap label="Email" htmlFor="login-email" required>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          className="input-field"
          required
        />
      </FieldWrap>
      <FieldWrap label="Password" htmlFor="login-password" required>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="input-field"
          required
        />
      </FieldWrap>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="remember" className="accent-brand" />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-brand hover:text-brand-hover">
          Forgot Password
        </Link>
      </div>
      {passwordReset === "success" || reset ? (
        <p role="status" className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
          Your password has been updated. Sign in with your new password.
        </p>
      ) : null}
      {message ? (
        <p role="alert" className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} arrow>
        {pending ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-xs leading-5 text-muted">
        Use of this portal is subject to our{" "}
        <Link
          href="/privacy"
          className="font-medium text-ink underline decoration-brand/40 underline-offset-2 hover:text-brand"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          className="font-medium text-ink underline decoration-brand/40 underline-offset-2 hover:text-brand"
        >
          Terms of Service
        </Link>
        .
      </p>
      <p className="text-sm text-muted">
        Need access?{" "}
        <Link href="/contact" className="font-semibold text-ink hover:text-brand">
          Contact TrueFix360
        </Link>
      </p>
    </form>
  );
}
