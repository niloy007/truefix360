import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Forgot Password",
  description: "Reset TrueFix360 portal access.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <section className="bg-ink">
      <Container className="grid min-h-[60vh] items-center gap-10 py-16 lg:grid-cols-2">
        <div className="text-white">
          <p className="eyebrow mb-4">Portal Access</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Reset your password
          </h1>
          <p className="mt-5 max-w-md text-muted-dark leading-7">
            Enter the email on your TrueFix360 account. We never send passwords in email.
          </p>
        </div>
        <div className="border border-white/10 bg-white p-6 sm:p-8">
          <ForgotPasswordForm />
        </div>
      </Container>
    </section>
  );
}
