import { Container } from "@/components/ui/Container";
import { LegalReviewBanner } from "@/components/ui/LegalReviewBanner";
import { PageHero } from "@/components/ui/PageHero";
import { company } from "@/config/company";
import { hasValue } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "Initial TrueFix360 website terms covering site use, quotes, and vendor applications.",
  path: "/terms",
});

export default function TermsPage() {
  const contact = hasValue(company.generalEmail) ? company.generalEmail : "the contact form on this website";

  return (
    <>
      <PageHero
        compact
        eyebrow="Legal"
        title="Terms of Service"
        description="Terms for use of this website. This template requires legal review and does not name a governing state."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ]}
      />
      <section className="section-space bg-white">
        <Container width="narrow" className="space-y-8 text-sm leading-7 text-muted sm:text-base">
          <LegalReviewBanner />
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Website use</h2>
            <p className="mt-3">
              This website is provided by TrueFix360 for information about property services and to collect inquiries. Do not use the site in a way that is unlawful or that interferes with its operation.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Service requests</h2>
            <p className="mt-3">
              Submitting a service request or quote form is an inquiry. It does not create a contract for work and does not require TrueFix360 to accept the assignment.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Estimates and quotes</h2>
            <p className="mt-3">
              Any pricing discussion that follows a website inquiry is subject to inspection, scope confirmation, and written agreement. Website submissions are not final pricing.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Vendor applications</h2>
            <p className="mt-3">
              Vendor applications are requests to be considered for the network. Submitting an application does not guarantee assignments or work volume and does not create an employment relationship.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">No guarantee of assignments</h2>
            <p className="mt-3">
              TrueFix360 does not promise a volume of work to vendors or a specific outcome to clients based solely on use of this website.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Intellectual property</h2>
            <p className="mt-3">
              Site content, branding, and layout are owned by TrueFix360 or its licensors and may not be copied for commercial use without permission.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Prohibited use</h2>
            <p className="mt-3">
              Do not submit false information, attempt unauthorized access, scrape the site in an abusive way, or use the forms to send malware or spam.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Third-party links</h2>
            <p className="mt-3">
              Links to third-party sites, if added, are provided for convenience. TrueFix360 is not responsible for those sites’ content or practices.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Disclaimers</h2>
            <p className="mt-3">
              The website is provided as is. TrueFix360 does not warrant that content is complete or that the site will be uninterrupted. Service descriptions are informational.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Limitation language placeholder</h2>
            <p className="mt-3">
              Limitation of liability language should be inserted here after legal review and should match the actual legal entity.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Governing-law placeholder</h2>
            <p className="mt-3">
              Governing law and venue are not stated on this website because a jurisdiction has not been provided. Counsel should complete this section before production.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Changes</h2>
            <p className="mt-3">
              These terms may be updated by posting a revised version on this page.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Contact</h2>
            <p className="mt-3">Questions about these terms can be sent through {contact}.</p>
          </section>
        </Container>
      </section>
    </>
  );
}
