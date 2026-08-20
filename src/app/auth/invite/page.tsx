import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHashSessionCatcher } from "@/components/auth/AuthHashSessionCatcher";
import { InvitePasswordForm } from "@/components/forms/InvitePasswordForm";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/config/env";
import { getAuthContext, resolveHomePath } from "@/lib/auth/guards";
import {
  inviteLinkErrorMessage,
  parseAuthLinkErrorParam,
} from "@/lib/auth/password";
import { pageMetadata } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = pageMetadata({
  title: "Welcome to TrueFix360",
  description: "Create your TrueFix360 portal password.",
  path: "/auth/invite",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type InvitePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

async function hasCompletedInviteOnboarding(userId: string): Promise<boolean> {
  if (!isServiceRoleConfigured()) return false;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("first_login_at")
      .eq("id", userId)
      .maybeSingle();
    return Boolean(data?.first_login_at);
  } catch {
    return false;
  }
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const code = firstParam(params.code);
  const tokenHash = firstParam(params.token_hash);
  const type = firstParam(params.type);
  const errorParam = firstParam(params.error);
  const errorCode = firstParam(params.error_code);

  if (code || tokenHash) {
    const callback = new URLSearchParams();
    callback.set("next", "/auth/invite");
    if (code) callback.set("code", code);
    if (tokenHash) callback.set("token_hash", tokenHash);
    if (type) callback.set("type", type);
    redirect(`/auth/callback?${callback.toString()}`);
  }

  if (errorParam || errorCode) {
    const kind =
      parseAuthLinkErrorParam(errorParam) ?? parseAuthLinkErrorParam(errorCode);
    if (kind && errorParam !== kind) {
      redirect(`/auth/invite?error=${kind}`);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <InviteScreen
        message={inviteLinkErrorMessage("not_configured")}
        showForm={false}
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (errorParam) redirect("/auth/invite");
    if (await hasCompletedInviteOnboarding(user.id)) {
      const ctx = await getAuthContext();
      redirect(ctx ? resolveHomePath(ctx.memberships) : "/login");
    }
  }

  const kind = parseAuthLinkErrorParam(errorParam);
  const message = user
    ? null
    : inviteLinkErrorMessage(kind) ??
      inviteLinkErrorMessage("missing");

  return (
    <InviteScreen
      message={message}
      showForm={Boolean(user)}
      alreadyUsed={kind === "used"}
      expired={kind === "expired" || kind === "missing"}
    />
  );
}

function InviteScreen({
  message,
  showForm,
  alreadyUsed = false,
  expired = false,
}: {
  message: string | null;
  showForm: boolean;
  alreadyUsed?: boolean;
  expired?: boolean;
}) {
  return (
    <section className="min-h-screen bg-ink">
      <Container className="grid min-h-screen items-center gap-10 py-16 lg:grid-cols-2">
        <div className="text-white">
          <Logo inverted className="mb-8" />
          <p className="eyebrow mb-4">Portal Access</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {expired ? "Invitation expired" : "Welcome to TrueFix360"}
          </h1>
          <p className="mt-5 max-w-md text-muted-dark leading-7">
            {expired
              ? "This invitation link is no longer valid. Ask a TrueFix360 administrator to resend your invitation."
              : "Create a password to finish setting up your invited account. Access is based on the organization TrueFix360 assigned to you."}
          </p>
        </div>
        <div className="border border-white/10 bg-white p-6 sm:p-8">
          <AuthHashSessionCatcher
            workingLabel="Opening your invitation…"
            gate={!showForm}
          >
            {message ? (
              <div className="grid gap-5">
                <p
                  role="alert"
                  className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink"
                >
                  {message}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center bg-brand px-4 font-semibold text-white"
                  >
                    Return to Login
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex h-11 items-center border border-line px-4 font-semibold text-ink hover:border-brand"
                  >
                    Contact TrueFix360
                  </Link>
                </div>
                {alreadyUsed ? (
                  <p className="text-sm text-muted">
                    If you already set a password, use{" "}
                    <Link href="/login" className="font-semibold text-ink hover:text-brand">
                      Sign in
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            ) : null}
            {showForm ? <InvitePasswordForm /> : null}
          </AuthHashSessionCatcher>
        </div>
      </Container>
    </section>
  );
}
