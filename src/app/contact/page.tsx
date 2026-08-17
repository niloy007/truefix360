import { Suspense } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { company } from "@/config/company";
import { hasValue } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { Mail, Phone } from "lucide-react";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact TrueFix360 about service requests, partnerships, the vendor network, or resident questions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk About Your Property Service Needs"
        description="Use the form for new work, existing assignments, partnerships, vendor questions, resident issues, or billing. Office address and phone are shown only when published in company configuration."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />
      <section className="section-space bg-cream">
        <Container className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="border border-line bg-white p-5 sm:p-8">
            <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
          <aside className="space-y-6">
            {hasValue(company.phone) ? (
              <p className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 size-4 text-brand" aria-hidden="true" />
                <a href={`tel:${company.phone}`} className="font-medium text-ink hover:text-brand">
                  {company.phone}
                </a>
              </p>
            ) : null}
            {hasValue(company.generalEmail) ? (
              <p className="flex items-start gap-3 text-sm">
                <Mail className="mt-0.5 size-4 text-brand" aria-hidden="true" />
                <a href={`mailto:${company.generalEmail}`} className="font-medium text-ink hover:text-brand">
                  {company.generalEmail}
                </a>
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted">
                Public phone and email will appear here once they are added to
                company configuration. The form is the current intake path.
              </p>
            )}
            {hasValue(company.businessHours) ? (
              <p className="text-sm text-muted">{company.businessHours}</p>
            ) : null}
            {hasValue(company.address) ? (
              <p className="text-sm text-muted">{company.address}</p>
            ) : null}
          </aside>
        </Container>
      </section>
    </>
  );
}
