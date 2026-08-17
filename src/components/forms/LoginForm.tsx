"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FieldWrap } from "@/components/forms/FieldWrap";
import { cn } from "@/lib/utils";

type UserType = "client" | "vendor";

export function LoginForm() {
  const [userType, setUserType] = useState<UserType>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors: { email?: string; password?: string } = {};
        if (!email.trim()) nextErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          nextErrors.email = "Enter a valid email address.";
        }
        if (!password) nextErrors.password = "Password is required.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setSubmitting(true);
        window.setTimeout(() => {
          setSubmitting(false);
          setMessage(
            "Client and vendor portals are not connected yet. Credentials were not stored or transmitted. Need access? Contact TrueFix360.",
          );
        }, 400);
      }}
      noValidate
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Account type</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "client", label: "Client / Partner" },
              { id: "vendor", label: "Vendor" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn(
                "border px-3 py-3 text-sm font-semibold",
                userType === option.id
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-ink hover:border-ink",
              )}
              aria-pressed={userType === option.id}
              onClick={() => setUserType(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
      <FieldWrap label="Email" htmlFor="login-email" required error={errors.email}>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          className="input-field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
      </FieldWrap>
      <FieldWrap label="Password" htmlFor="login-password" required error={errors.password}>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="input-field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
      </FieldWrap>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-brand"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          Remember me
        </label>
        <button
          type="button"
          className="font-medium text-brand hover:text-brand-hover"
          onClick={() =>
            setMessage(
              "Password recovery will be available when client and vendor portals are connected. Need access? Contact TrueFix360.",
            )
          }
        >
          Forgot Password
        </button>
      </div>
      {message ? (
        <p role="status" className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting} arrow>
        {submitting ? "Checking…" : "Sign In"}
      </Button>
      <p className="text-sm text-muted">
        Need access?{" "}
        <Link href="/contact" className="font-semibold text-ink hover:text-brand">
          Contact TrueFix360
        </Link>
      </p>
    </form>
  );
}
