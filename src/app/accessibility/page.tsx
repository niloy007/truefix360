import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { company } from "@/config/company";
import { hasValue } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Accessibility",
  description:
    "TrueFix360 aims to provide an accessible website experience. Contact us if you encounter an access barrier.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  const contact = hasValue(company.generalEmail)
    ? company.generalEmail
    : "the contact form";

  return (
    <>
      <PageHero
        compact
        eyebrow="Accessibility"
        title="Website Accessibility"
        description="TrueFix360 aims to provide an accessible website experience. This page is not a WCAG certification claim."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Accessibility" },
        ]}
      />
      <section className="section-space bg-white">
        <Container width="narrow" className="space-y-6 text-base leading-7 text-muted">
          <p>
            TrueFix360 intends for this website to be usable with keyboard
            navigation, readable text, labeled form controls, and sufficient
            color contrast. Formal WCAG certification is not claimed.
          </p>
          <p>
            If you experience an access problem, contact TrueFix360 through{" "}
            {contact} and include the page URL and a description of the issue.
            The team will review the report and work toward a practical fix.
          </p>
        </Container>
      </section>
    </>
  );
}
