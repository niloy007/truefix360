import { CTASection } from "@/components/ui/CTASection";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PageHero } from "@/components/ui/PageHero";
import { vendorFaqs } from "@/data/faqs";
import { vendorExpectations, vendorTrades } from "@/data/vendors";
import { pageMetadata } from "@/lib/seo";
import { Check } from "lucide-react";

export const metadata = pageMetadata({
  title: "Vendor Network",
  description:
    "Join the TrueFix360 vendor network. Independent contractors and service companies can apply to work across preservation, maintenance, and related trades.",
  path: "/vendors",
});

export default function VendorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Vendors"
        title="Join the TrueFix360 Vendor Network"
        description="TrueFix360 works with qualified independent contractors and service companies. Submitting an application does not guarantee assignments or work volume."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Vendors" },
        ]}
        primaryCta={{ href: "/vendors/apply", label: "Apply Now" }}
        secondaryCta={{ href: "/login", label: "Vendor Login" }}
      />
      <section className="section-space bg-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Who we work with</h2>
          <p className="mt-4 max-w-3xl text-muted leading-7">
            Independent contractors, small service companies, and trade specialists
            who can complete scoped property work professionally and document it.
          </p>
          <h3 className="mt-10 font-heading text-2xl font-semibold">Service categories</h3>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {vendorTrades.map((trade) => (
              <li key={trade} className="border border-line bg-cream px-4 py-3 text-sm font-medium">
                {trade}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container className="grid gap-4 md:grid-cols-3">
          <FeatureCard title="What we look for" description="Reliable scheduling, relevant field experience, insurance readiness, and coverage in markets where work is needed." />
          <FeatureCard title="How onboarding works" description="Apply on this website. If the profile is a fit, additional documents and details are collected during secure onboarding." />
          <FeatureCard title="Vendor expectations" description="Show up prepared, follow the scope, communicate issues, and return completion documentation." />
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Vendor expectations</h2>
          <ul className="mt-8 grid gap-3">
            {vendorExpectations.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-ink sm:text-base">
                <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container width="narrow">
          <h2 className="mb-8 font-heading text-3xl font-semibold tracking-tight">Vendor FAQ</h2>
          <FAQAccordion items={vendorFaqs} />
        </Container>
      </section>
      <CTASection
        title="Ready to apply?"
        description="Submitting an application does not guarantee assignments or work volume."
        primary={{ href: "/vendors/apply", label: "Become a Vendor" }}
        secondary={{ href: "/contact", label: "Ask a Question" }}
      />
    </>
  );
}
