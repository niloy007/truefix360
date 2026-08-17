import { Container } from "@/components/ui/Container";
import { LegalReviewBanner } from "@/components/ui/LegalReviewBanner";
import { PageHero } from "@/components/ui/PageHero";
import { company } from "@/config/company";
import { hasValue } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "Initial TrueFix360 website privacy policy template covering forms, cookies, and related information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const contact = hasValue(company.generalEmail) ? company.generalEmail : "the contact form on this website";

  return (
    <>
      <PageHero
        compact
        eyebrow="Legal"
        title="Privacy Policy"
        description="How this website may collect and use information. This template requires legal review."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
      />
      <section className="section-space bg-white">
        <Container width="narrow" className="prose-legal space-y-8 text-sm leading-7 text-muted sm:text-base">
          <LegalReviewBanner />
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Information collected</h2>
            <p className="mt-3">
              TrueFix360 may collect information you submit through this website, including names, company names, contact details, property locations, service descriptions, vendor business details, and messages.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Contact forms</h2>
            <p className="mt-3">
              The contact form collects the details you enter so the team can respond to inquiries. Until production delivery is connected, submissions may be validated without permanent storage.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Vendor applications</h2>
            <p className="mt-3">
              Vendor applications collect business and coverage information. Sensitive tax identifiers are not requested on this public form and are intended for later secure onboarding. Document upload controls are displayed for completeness and are not a permanent storage system in this release.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Service requests</h2>
            <p className="mt-3">
              Quote and service request forms may include property addresses, occupancy status, and work descriptions so a request can be reviewed.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Resident communications</h2>
            <p className="mt-3">
              If a property manager or owner requests occupied-property work, TrueFix360 may receive resident contact details from that client in order to schedule access. Residents may also submit questions through this website.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Website usage</h2>
            <p className="mt-3">
              Standard server and hosting logs may record technical data such as IP address, browser type, and pages requested. Analytics tools may be added later and should be disclosed when enabled.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Cookies</h2>
            <p className="mt-3">
              This website may use cookies or similar technologies that are strictly needed for operation. Additional cookies, if introduced, should be described here after legal review.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Service providers</h2>
            <p className="mt-3">
              Hosting, email, form delivery, and similar providers may process information on TrueFix360’s behalf when those systems are connected.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Data security</h2>
            <p className="mt-3">
              TrueFix360 intends to use reasonable administrative and technical measures appropriate to this website. No method of transmission is completely secure.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Retention</h2>
            <p className="mt-3">
              Information should be kept only as long as needed for the purpose collected, legal obligations, or dispute resolution. Specific periods will be set during legal review.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">User choices</h2>
            <p className="mt-3">
              You may request access, correction, or deletion of information you submitted, subject to legal exceptions, by contacting TrueFix360 through {contact}.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Children</h2>
            <p className="mt-3">
              This website is not directed to children, and TrueFix360 does not knowingly collect personal information from children through these pages.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Updates</h2>
            <p className="mt-3">
              This policy may change. The updated version will be posted on this page.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-2xl font-semibold text-ink">Contact</h2>
            <p className="mt-3">
              Privacy questions can be sent through {contact}.
            </p>
          </section>
        </Container>
      </section>
    </>
  );
}
