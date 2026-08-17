import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { Container } from "@/components/ui/Container";
import { isSupabaseConfigured } from "@/config/env";
import {
  parseAuthLinkErrorParam,
  resetLinkErrorMessage,
} from "@/lib/auth/password";
import { pageMetadata } from "@/lib/seo";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = pageMetadata({
  title: "Reset your password",
  description: "Choose a new TrueFix360 portal password.",
  path: "/reset-password",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const code = firstParam(params.code);
  const tokenHash = firstParam(params.token_hash);
  const type = firstParam(params.type);
  const errorParam = firstParam(params.error);
  const errorCode = firstParam(params.error_code);

  if (code || tokenHash) {
    const callback = new URLSearchParams();
    callback.set("next", "/reset-password");
    if (code) callback.set("code", code);
    if (tokenHash) callback.set("token_hash", tokenHash);
    callback.set("type", type || "recovery");
    redirect(`/auth/callback?${callback.toString()}`);
  }

  if (errorParam || errorCode) {
    const kind =
      parseAuthLinkErrorParam(errorParam) ?? parseAuthLinkErrorParam(errorCode);
    if (kind && errorParam !== kind) {
      redirect(`/reset-password?error=${kind}`);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <ResetPasswordScreen
        linkError={resetLinkErrorMessage("not_configured")}
        hasSession={false}
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && errorParam) {
    redirect("/reset-password");
  }

  const kind = parseAuthLinkErrorParam(errorParam);
  const linkError = user
    ? null
    : resetLinkErrorMessage(kind) ?? resetLinkErrorMessage("missing");

  return <ResetPasswordScreen linkError={linkError} hasSession={Boolean(user)} />;
}

function ResetPasswordScreen({
  linkError,
  hasSession,
}: {
  linkError: string | null;
  hasSession: boolean;
}) {
  return (
    <section className="bg-ink">
      <Container className="grid min-h-[60vh] items-center gap-10 py-16 lg:grid-cols-2">
        <div className="text-white">
          <p className="eyebrow mb-4">Portal Access</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Reset your password
          </h1>
          <p className="mt-5 max-w-md text-muted-dark leading-7">
            Use at least 10 characters. After saving, you will sign in with the new password.
          </p>
        </div>
        <div className="border border-white/10 bg-white p-6 sm:p-8">
          <ResetPasswordForm linkError={linkError} hasSession={hasSession} />
        </div>
      </Container>
    </section>
  );
}
