import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Client Login",
  description: "Sign in to the TrueFix360 client or vendor portal when access is provisioned.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <section className="bg-ink">
      <Container className="grid min-h-[70vh] items-center gap-10 py-16 lg:grid-cols-2">
        <div className="text-white">
          <p className="eyebrow mb-4">Client & Vendor Access</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome Back
          </h1>
          <p className="mt-5 max-w-md text-muted-dark leading-7">
            Sign in to the client, vendor, or TrueFix360 staff portal. Access is
            provisioned by TrueFix360. This screen does not create public accounts.
          </p>
        </div>
        <div className="border border-white/10 bg-white p-6 sm:p-8">
          <Suspense fallback={<p className="text-sm text-muted">Loading sign-in…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
