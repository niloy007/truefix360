import { LegalCallout } from "@/components/legal/LegalCallout";
import { LegalList, LegalSection } from "@/components/legal/LegalSection";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { legal, type LegalTocItem } from "@/config/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Terms for using the TrueFix360 website, service requests, vendor applications, coverage tools, and authenticated portals.",
  path: "/terms",
});

const toc: LegalTocItem[] = [
  { id: "acceptance", label: "Acceptance" },
  { id: "about", label: "About TrueFix360" },
  { id: "website-use", label: "Website and platform use" },
  { id: "service-requests", label: "Service requests" },
  { id: "quotes", label: "Quotes and estimates" },
  { id: "work-orders", label: "Work orders" },
  { id: "client-accounts", label: "Client accounts" },
  { id: "vendor-applications", label: "Vendor applications and accounts" },
  { id: "vendor-network", label: "Vendor network" },
  { id: "property-access", label: "Property access" },
  { id: "files", label: "Photos, files, and documentation" },
  { id: "communications", label: "Communications" },
  { id: "fees", label: "Fees and payment" },
  { id: "scheduling", label: "Cancellation and scheduling" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "account-security", label: "Account security" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "third-parties", label: "Third-party services" },
  { id: "availability", label: "Availability" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "suspension", label: "Suspension and termination" },
  { id: "changes", label: "Changes" },
  { id: "governing-law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="These terms govern use of the TrueFix360 website, public forms, coverage tools, and authenticated client, vendor, and staff portals."
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Terms of Service" },
      ]}
      currentHref="/terms"
      toc={toc}
      contactTitle="Questions about these terms"
      contactDescription="If you have questions about these Terms of Service, contact TrueFix360 using the addresses below."
      contactEmails={[legal.supportEmail, legal.officeEmail]}
    >
      <LegalCallout title="Please read this first">
        <p>
          Submitting a contact form, quote request, coverage request, or vendor application is a request for
          review. It does not by itself create a binding work contract, guarantee acceptance, or lock pricing.
        </p>
        <p>
          The website and portals are not a substitute for emergency services. For an immediate threat to life,
          safety, or property, contact the appropriate emergency number.
        </p>
      </LegalCallout>

      <LegalSection id="acceptance" number="01" title="Acceptance of terms">
        <p>
          By accessing truefix360.com, submitting a form, or using an authorized TrueFix360 portal, you agree
          to these Terms of Service and the Privacy Policy. If you do not agree, do not use the website or
          platform.
        </p>
        <p>
          If you use the platform on behalf of a company or organization, you represent that you have authority
          to bind that organization.
        </p>
      </LegalSection>

      <LegalSection id="about" number="02" title="About TrueFix360">
        <p>
          TrueFix360 provides property preservation and property maintenance services through a U.S. field
          network. The public website describes services, coverage, and ways to request work or apply as a
          vendor. Authorized users may also receive access to client, vendor, or staff portals.
        </p>
        <p>
          These website terms describe use of the site and platform. They do not replace a separate written
          client, vendor, or work-authorization agreement when one applies.
        </p>
      </LegalSection>

      <LegalSection id="website-use" number="03" title="Website and platform use">
        <p>
          You may use the website to learn about TrueFix360 services, check informational coverage results,
          submit requests, apply to the vendor network, and, if invited, sign in to a portal.
        </p>
        <p>
          You must provide accurate information, use the service only for lawful property-service purposes, and
          not interfere with the platform or other users.
        </p>
      </LegalSection>

      <LegalSection id="service-requests" number="04" title="Service requests">
        <p>
          Submitting a Contact, Get a Quote, Coverage Request, or portal service request is an inquiry. It does
          not automatically:
        </p>
        <LegalList
          items={[
            "create a binding contract for field work;",
            "require TrueFix360 to accept the assignment;",
            "guarantee vendor availability or a specific schedule; or",
            "establish a final price.",
          ]}
        />
        <p>
          A job becomes authorized according to applicable written approval, estimate acceptance, or work-order
          terms. TrueFix360 may decline, defer, or refer a request.
        </p>
      </LegalSection>

      <LegalSection id="quotes" number="05" title="Quotes and estimates">
        <p>
          Website quote requests and later estimate records are not final pricing unless specifically presented
          and accepted as an authorized client estimate.
        </p>
        <p>Pricing may depend on inspection, field conditions, scope confirmation, materials, access, and service requirements.</p>
        <p>
          Client portal estimates show client-facing amounts and scope. Vendor portal estimates concern the
          vendor’s proposed cost or explanation for assigned work. Those views are intentionally separate.
        </p>
      </LegalSection>

      <LegalSection id="work-orders" number="06" title="Work orders and service authorization">
        <p>
          When work is authorized, TrueFix360 may create a work order, assign a vendor, and track status,
          files, and related communications in the platform.
        </p>
        <p>
          Assignment through the platform is an operational workflow. It does not, by itself, change a separate
          vendor or client contract, and it does not guarantee a particular outcome in the field.
        </p>
      </LegalSection>

      <LegalSection id="client-accounts" number="07" title="Client accounts">
        <p>
          Client portal access is invitation-only. Credentials must not be shared except as permitted by the
          client organization and TrueFix360. Users are responsible for maintaining the security of their
          sign-in details.
        </p>
        <p>
          Portal records may include service requests, work orders, estimates, property information, photos,
          files, and status updates for the user’s organization. TrueFix360 may suspend access for security,
          inactivity, or authorization reasons.
        </p>
      </LegalSection>

      <LegalSection id="vendor-applications" number="08" title="Vendor applications and accounts">
        <p>Submitting a Vendor Application:</p>
        <LegalList
          items={[
            "does not guarantee approval;",
            "does not guarantee assignments or work volume;",
            "does not create employment with TrueFix360; and",
            "does not make claimed coverage part of the live network until it is reviewed and activated.",
          ]}
        />
        <p>
          Approved vendors may be required to enter separate agreements and to provide compliance documents
          through the vendor portal. Vendor users must submit accurate information. TrueFix360 may review,
          request more detail, or reject incomplete or inconsistent submissions.
        </p>
        <p>
          Vendor portal functions may include assignments, schedules, estimates, work-order actions, photos,
          completion documentation, coverage, and compliance documents.
        </p>
      </LegalSection>

      <LegalSection id="vendor-network" number="09" title="Vendor network">
        <p>
          Vendors and field technicians are independent service providers or service companies, not TrueFix360
          employees, unless a separate writing says otherwise. These website terms do not create a partnership,
          joint venture, or employment relationship.
        </p>
        <p>
          Detailed independent-contractor, tax, insurance, and payment terms, when they apply, are governed by
          the applicable vendor agreement and onboarding requirements rather than by this page alone.
        </p>
      </LegalSection>

      <LegalSection id="coverage" number="10" title="Coverage">
        <p>
          TrueFix360 identifies active and growing markets and established county and service capability.
          A state shown as an active or growing market does not mean every county or every service in that
          state is available.
        </p>
        <p>
          Coverage checker results are informational. They may change based on service category, scheduling,
          vendor availability, access, field conditions, and network status.
        </p>
        <p>
          If coverage is not established, TrueFix360 may evaluate whether qualified local coverage can be
          sourced. A coverage request does not guarantee that local coverage can be sourced.
        </p>
      </LegalSection>

      <LegalSection id="property-access" number="11" title="Property access and resident information">
        <p>
          Authorized property and service information may be shared with assigned field providers as needed to
          perform approved services. Users must provide lawful, accurate access instructions and contact
          information.
        </p>
        <p>
          These website terms do not require TrueFix360 to verify title or ownership unless a separate
          agreement says so. Clients remain responsible for having authority to request work at a property.
        </p>
      </LegalSection>

      <LegalSection id="files" number="12" title="Photos, files, and documentation">
        <p>
          Users may upload photos and documents so TrueFix360 can evaluate requests, document conditions, and
          complete authorized work. TrueFix360 does not claim ownership of client or vendor files merely because
          they are uploaded.
        </p>
        <p>
          By uploading material, you grant TrueFix360 a limited license to store, process, display, and share
          that material as needed to operate the requested service, including sharing with authorized staff,
          client users, and assigned vendors.
        </p>
      </LegalSection>

      <LegalSection id="communications" number="13" title="Communications">
        <p>
          TrueFix360 may contact you about a submission, account, invitation, or work record using the email
          or phone number you provide. Operational notices may also be sent to TrueFix360 office addresses.
        </p>
        <p>
          Account invitations and password-reset messages are sent only in connection with provisioned access.
          Submitting a public form does not create a portal account.
        </p>
      </LegalSection>

      <LegalSection id="fees" number="14" title="Fees and payment">
        <p>
          These website terms do not set invoice due dates, retainage, or credit terms. Fees, invoicing, and
          payment, when they apply, are established in the applicable estimate, work authorization, or written
          agreement.
        </p>
      </LegalSection>

      <LegalSection id="scheduling" number="15" title="Cancellation and scheduling">
        <p>
          Scheduling depends on access, vendor availability, weather, scope, and other field conditions.
          TrueFix360 may reschedule or decline work when conditions make performance impractical or unsafe.
        </p>
        <p>
          Cancellation or change practices, when they apply, will follow the applicable work-order or client
          instructions rather than a generic website refund rule.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" number="16" title="Acceptable use">
        <p>You may not:</p>
        <LegalList
          items={[
            "use the website or portals for unlawful purposes;",
            "access an account without authorization or share credentials improperly;",
            "submit false service, property, or vendor information;",
            "upload malware or harmful files;",
            "interfere with the service or attempt to probe, scrape, or extract protected or private data;",
            "impersonate another person or organization; or",
            "use automated means in a way that burdens or abuses the platform.",
          ]}
        />
      </LegalSection>

      <LegalSection id="account-security" number="17" title="Account security">
        <p>
          Portal users must protect their credentials and promptly tell TrueFix360 of suspected unauthorized
          access. TrueFix360 may suspend or revoke access to protect the platform, other users, or property
          records.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" number="18" title="Intellectual property">
        <p>
          The TrueFix360 name, logo, website design, software, and original site content are owned by
          TrueFix360 or its licensors. You may use the website for ordinary browsing and authorized account
          use. You may not copy the site for commercial reuse without permission.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" number="19" title="Third-party services and links">
        <p>
          The platform relies on infrastructure and communications providers. Links to third-party sites, if
          shown, are for convenience. TrueFix360 is not responsible for those sites’ content or terms.
        </p>
      </LegalSection>

      <LegalSection id="availability" number="20" title="No guarantee of availability">
        <p>
          TrueFix360 aims to keep the website and portals available, but does not promise uninterrupted access,
          error-free operation, or a particular response time. Maintenance, outages, and connectivity issues
          may occur.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" number="21" title="Disclaimers">
        <p>
          The website is provided as is. Service descriptions, coverage maps, and checker results are
          informational. TrueFix360 does not warrant that published content is complete or that a displayed
          market state means a specific property can be serviced on a given date.
        </p>
        <p>
          The website and portals are not emergency-dispatch systems and should not be used in place of
          emergency services.
        </p>
      </LegalSection>

      <LegalSection id="liability" number="22" title="Limitation of liability">
        <p>
          To the extent permitted by applicable law, TrueFix360 is not liable for indirect, incidental,
          special, consequential, or punitive damages, or for lost profits, arising from use of the website or
          platform.
        </p>
        <p>
          This section is a conservative website limitation. It does not attempt to rewrite a separate signed
          service or vendor agreement, and it does not limit liability that applicable law does not allow to
          be limited.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" number="23" title="Indemnification">
        <p>
          You agree to defend and hold TrueFix360 harmless from claims arising out of your misuse of the
          website or platform, inaccurate submissions, unauthorized access you cause, or your violation of
          these terms, to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection id="suspension" number="24" title="Suspension and termination">
        <p>
          TrueFix360 may suspend or end website or portal access if we believe a user has violated these
          terms, created a security risk, submitted abusive or false information, or no longer has
          authorization to use an account.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="25" title="Changes to these terms">
        <p>
          We may update these terms by posting a revised version on this page. The “Last updated” date will
          change when we do. Continued use after an update means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" number="26" title="Governing law">
        <p>
          These terms are intended to govern use of the TrueFix360 website and platform. If a dispute cannot
          be resolved informally, it will be handled under applicable law and in a forum that has a proper
          connection to the parties and the dispute.
        </p>
        <p>
          A specific governing state is not named on this page because that jurisdiction has not been set in
          TrueFix360 public configuration. If a written agreement between you and TrueFix360 names a governing
          law or venue, that agreement controls for the matters it covers.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="27" title="Contact">
        <p>
          Questions about these terms may be sent to{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a> or{" "}
          <a href={`mailto:${legal.officeEmail}`}>{legal.officeEmail}</a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
