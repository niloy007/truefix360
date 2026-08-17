import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PageHero } from "@/components/ui/PageHero";
import { residentFaqs } from "@/data/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Resident Experience",
  description:
    "What to expect before, during, and after a TrueFix360 maintenance appointment at an occupied property.",
  path: "/resident-experience",
});

const before = [
  "Confirm you can be available during the service window, or arrange approved access.",
  "Provide gate, parking, or entry details if they were not already shared.",
  "Secure pets.",
  "Clear the work area when practical so the technician can reach the issue safely.",
];

const during = [
  "The technician should arrive in the communicated window when possible and identify the purpose of the visit.",
  "Work should stay in the requested area unless a safety issue requires otherwise.",
  "Photos or notes may be taken to document the condition and completion of the work.",
  "Ask questions about the immediate work. Lease or rent questions belong with your property contact.",
];

const after = [
  "Confirm the original issue was addressed as scoped.",
  "Report unresolved issues through the property manager or owner who requested the work.",
  "If you were given a TrueFix360 contact for that appointment, you may use it as well.",
];

export default function ResidentExperiencePage() {
  return (
    <>
      <PageHero
        eyebrow="Resident Experience"
        title="What to Expect When Service Is Scheduled"
        description="TrueFix360 may complete maintenance requested by a property manager or owner. This page explains the appointment — not your lease."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Residents", href: "/residents" },
          { label: "Resident Experience" },
        ]}
      />
      <section className="section-space bg-white">
        <Container className="grid gap-10 lg:grid-cols-3">
          <article>
            <p className="eyebrow mb-3">01</p>
            <h2 className="font-heading text-2xl font-semibold">Before your appointment</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
              {before.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <p className="eyebrow mb-3">02</p>
            <h2 className="font-heading text-2xl font-semibold">During service</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
              {during.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <p className="eyebrow mb-3">03</p>
            <h2 className="font-heading text-2xl font-semibold">After service</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
              {after.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container width="narrow">
          <h2 className="mb-8 font-heading text-3xl font-semibold tracking-tight">Resident FAQ</h2>
          <FAQAccordion items={residentFaqs} />
        </Container>
      </section>
      <CTASection
        title="Questions about an upcoming visit?"
        primary={{ href: "/contact?topic=resident", label: "Contact Resident Support" }}
        secondary={{ href: "/residents", label: "Resident Information" }}
      />
    </>
  );
}
