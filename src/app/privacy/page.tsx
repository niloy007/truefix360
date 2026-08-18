import { LegalCallout } from "@/components/legal/LegalCallout";
import { LegalList, LegalSection } from "@/components/legal/LegalSection";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { legal, type LegalTocItem } from "@/config/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How TrueFix360 collects, uses, stores, and shares information submitted through our website, forms, and secure client and vendor portals.",
  path: "/privacy",
});

const toc: LegalTocItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "scope", label: "Scope" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "information-you-provide", label: "Information you provide" },
  { id: "accounts", label: "Accounts and authentication" },
  { id: "property-service", label: "Property and service information" },
  { id: "vendor-information", label: "Vendor information" },
  { id: "files", label: "Files, photos, and documents" },
  { id: "technical", label: "Technical and session information" },
  { id: "use", label: "How we use information" },
  { id: "sharing", label: "How we share information" },
  { id: "providers", label: "Service providers" },
  { id: "cookies", label: "Cookies and sessions" },
  { id: "security", label: "Security" },
  { id: "retention", label: "Retention" },
  { id: "choices", label: "Your choices" },
  { id: "portals", label: "Portal information" },
  { id: "children", label: "Children" },
  { id: "third-party-sites", label: "Third-party websites" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="This policy explains how TrueFix360 handles information submitted through our public website, service forms, and authenticated client, vendor, and staff portals."
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Privacy Policy" },
      ]}
      currentHref="/privacy"
      toc={toc}
      contactTitle="Privacy questions"
      contactDescription="To ask about information TrueFix360 holds, or to request access, correction, or deletion, email us. We may need enough detail to locate the relevant account or record. Some information may be retained when we have an operational, contractual, security, or legal reason to keep it."
      contactEmails={[legal.supportEmail]}
    >
      <LegalCallout title="Privacy at a glance">
        <p>We collect information you provide to request service, apply as a vendor, check coverage, or use an authorized portal.</p>
        <p>We use that information to coordinate property preservation and maintenance work, communicate about requests, and operate accounts.</p>
        <p>Portal records and files are limited by role and organization. Public vendor applications do not collect Social Security numbers or EINs.</p>
        <p>
          Privacy questions:{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>
        </p>
      </LegalCallout>

      <LegalSection id="introduction" number="01" title="Introduction">
        <p>
          TrueFix360 operates a property preservation and property maintenance platform. Clients, property
          managers, vendors, residents, and visitors may use this website to learn about services, submit
          requests, apply to the vendor network, or sign in to an authorized portal.
        </p>
        <p>
          This Privacy Policy describes information practices for the public website and the authenticated
          platform. It is an operational description of how the service works. It is not a certification of
          any particular privacy statute.
        </p>
      </LegalSection>

      <LegalSection id="scope" number="02" title="Scope">
        <p>This policy applies to:</p>
        <LegalList
          items={[
            "the public TrueFix360 website, including contact, quote, vendor application, and coverage request forms;",
            "the coverage checker, which looks up market and county coverage without requiring an account;",
            "authenticated client, vendor, and TrueFix360 staff portals;",
            "files stored for quotes, work orders, and vendor compliance; and",
            "operational notifications related to those records.",
          ]}
        />
        <p>
          It does not automatically apply to third-party websites we link to, or to written contracts that
          separately govern a client or vendor relationship.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" number="03" title="Information we collect">
        <p>TrueFix360 collects information in these categories:</p>
        <LegalList
          items={[
            <><strong className="text-ink">Information you submit</strong> through public forms and portal actions.</>,
            <><strong className="text-ink">Account information</strong> for invited users, including email, profile details, organization membership, and role.</>,
            <><strong className="text-ink">Property and job records</strong> created to coordinate work.</>,
            <><strong className="text-ink">Files</strong> such as photos, PDFs, estimates, and vendor compliance documents.</>,
            <><strong className="text-ink">Operational logs</strong> such as audit events and notification delivery records.</>,
            <><strong className="text-ink">Limited technical data</strong> needed to run the website, protect forms, and maintain signed-in sessions.</>,
          ]}
        />
        <p>
          We do not currently use advertising pixels, analytics suites, or marketing trackers on this
          website. If that changes, this policy will be updated.
        </p>
      </LegalSection>

      <LegalSection id="information-you-provide" number="04" title="Information you provide">
        <p>
          <strong className="text-ink">Contact form.</strong> Name, optional company, email, phone, topic, and
          message. Submissions are stored and used to respond.
        </p>
        <p>
          <strong className="text-ink">Quote / service request form.</strong> First and last name, optional
          company, email, phone, property address, city, state, ZIP, property type, occupancy status, service
          category, requested service, description, urgency, optional preferred date, number of properties,
          preferred contact method, and optional photos or PDF files.
        </p>
        <p>
          <strong className="text-ink">Coverage request form.</strong> First and last name, optional company,
          email, phone, optional property address, city, state, county, optional ZIP, service category,
          optional number of properties, urgency, and a description of the coverage needed.
        </p>
        <p>
          <strong className="text-ink">Coverage checker.</strong> The public checker asks for state, county,
          and service category to return an informational coverage result. It does not require a name, email,
          or account.
        </p>
        <p>
          Forms also include a hidden anti-spam field. That field is not used as business contact information.
        </p>
      </LegalSection>

      <LegalSection id="accounts" number="05" title="Accounts and authentication">
        <p>
          TrueFix360 does not offer public self-registration. Accounts are created by invitation for TrueFix360
          staff, client-organization users, and vendor-organization users.
        </p>
        <p>Account-related information may include:</p>
        <LegalList
          items={[
            "email address used to sign in;",
            "profile name or display name;",
            "organization membership and role (admin, staff, client, vendor admin, or crew);",
            "account status;",
            "first and last login timestamps; and",
            "password-reset and invitation activity handled by the authentication service.",
          ]}
        />
        <p>
          Passwords are processed by the authentication provider. They are not stored in TrueFix360 application
          tables as recoverable password values.
        </p>
      </LegalSection>

      <LegalSection id="property-service" number="06" title="Property and service information">
        <p>
          To coordinate work, authorized users and TrueFix360 staff may maintain records such as property
          addresses, occupancy or access notes, service requests, work orders, schedules, estimates, status
          updates, and related communications.
        </p>
        <p>
          Authorized client users may submit service requests from the client portal, including issue details
          and supporting files. Assigned vendor users may see the property and access information needed to
          perform an assignment. Financial fields that are internal to TrueFix360 or a client relationship
          are not shown to vendors through the vendor portal.
        </p>
      </LegalSection>

      <LegalSection id="vendor-information" number="07" title="Vendor information">
        <p>
          The public vendor application collects business and coverage details: company name, contact name,
          email, phone, optional website, business address, business type, years in business, crew count,
          insurance and workers-compensation status, services, states and counties or cities served, travel
          radius, trip-charge preference, hours, emergency and weekend availability, and experience.
        </p>
        <p>
          The public application does not collect Social Security numbers, EINs, or tax identifiers. It does
          not accept W-9s, insurance certificates, or licenses as public-form uploads.
        </p>
        <p>
          After an application is reviewed, an approved vendor organization may be invited to the vendor
          portal. Authenticated vendor users may later upload compliance documents such as a W-9, general
          liability certificate, workers-compensation document, or business license. Those files are stored
          privately and are not part of the public application.
        </p>
        <p>
          Vendor coverage submitted on an application is a claimed service area. Only coverage that TrueFix360
          later verifies or activates is used as network capability for Coverage Intelligence.
        </p>
      </LegalSection>

      <LegalSection id="files" number="08" title="Files, photos, and documents">
        <p>Users may provide files such as:</p>
        <LegalList
          items={[
            "photos or PDFs attached to a public quote request;",
            "photos or documents attached to a client service request;",
            "work-order photos and documentation, including before, during, after, supporting, completion, and estimate files; and",
            "authenticated vendor compliance documents.",
          ]}
        />
        <p>
          Public uploads are limited to JPG, PNG, WebP, and PDF files, with a maximum size and file count.
          Files are stored in private storage. Access is granted to authorized users through the application,
          including short-lived download links rather than public file URLs.
        </p>
        <p>
          Uploading a file does not transfer ownership of that file to TrueFix360 beyond what is needed to
          store, review, display, and use it for the requested service.
        </p>
      </LegalSection>

      <LegalSection id="technical" number="09" title="Technical and session information">
        <p>
          When you use the website, hosting and application infrastructure may process ordinary technical data
          needed to deliver pages, protect forms, and keep the service available. Authenticated areas use
          session cookies so the platform can recognize a signed-in user.
        </p>
        <p>
          TrueFix360 also keeps operational records such as form-submission references, rate-limit counters
          based on hashed identifiers, audit events, and notification delivery status. Those records support
          security, troubleshooting, and service coordination. They are not used as an advertising profile.
        </p>
        <p>
          This website does not currently collect advertising identifiers or device fingerprints for marketing.
        </p>
      </LegalSection>

      <LegalSection id="use" number="10" title="How we use information">
        <p>We use information to:</p>
        <LegalList
          items={[
            "respond to inquiries and resident questions;",
            "evaluate quote, service, and coverage requests;",
            "create and manage service requests, properties, work orders, and estimates;",
            "source, assign, and communicate with qualified vendors;",
            "review applications and verify claimed vendor coverage;",
            "provide portal access and support;",
            "send operational email related to submissions, invitations, and account security;",
            "maintain records needed to perform and document work;",
            "protect the platform against spam, abuse, and unauthorized access; and",
            "improve how the website and platform operate.",
          ]}
        />
        <p>We do not use website form submissions to run third-party advertising campaigns.</p>
      </LegalSection>

      <LegalSection id="sharing" number="11" title="How we share information">
        <p>
          Providing property services requires us to share certain information when reasonably necessary to
          coordinate, perform, support, or administer services. Depending on the situation, information may be
          shared with:
        </p>
        <LegalList
          items={[
            "TrueFix360 staff who coordinate or support the work;",
            "authorized users in the relevant client organization;",
            "assigned or approved vendor organizations and their authorized users, limited to information needed for the assignment;",
            "infrastructure and communications providers that host, store, or transmit data on our behalf; and",
            "professional advisers or authorities when required by law, dispute, or safety.",
          ]}
        />
        <p>
          Access is limited by role and organization where the platform is designed to do so. Vendors are not
          shown client not-to-exceed or sell-price fields through the vendor portal. Clients are not shown
          vendor cost fields through the client portal.
        </p>
      </LegalSection>

      <LegalSection id="providers" number="12" title="Service providers">
        <p>TrueFix360 uses service providers to operate the platform, including:</p>
        <LegalList
          items={[
            <><strong className="text-ink">Supabase</strong> for database, authentication, and private file storage.</>,
            <><strong className="text-ink">Hostinger</strong> for website hosting.</>,
            <><strong className="text-ink">Email delivery providers</strong> for operational messages when email sending is configured. The application is built to send those messages through Resend.</>,
          ]}
        />
        <p>
          The application also includes an optional staff WhatsApp notification channel. That channel is off
          unless separately enabled and configured. This policy does not treat WhatsApp as a current default
          processor of public-form information.
        </p>
        <p>
          Providers process information only as needed to supply their service. Office mailboxes such as{" "}
          {legal.officeEmail} and {legal.supportEmail} may also receive copies of operational notices.
        </p>
      </LegalSection>

      <LegalSection id="cookies" number="13" title="Cookies and sessions">
        <p>
          TrueFix360 uses essential cookies and similar session technologies so authorized users can sign in
          and stay signed in to the client, vendor, and staff portals. Those cookies are required for secure
          account access.
        </p>
        <p>
          We do not currently set analytics, advertising, or social-media tracking cookies. Because the site
          does not use non-essential tracking, this page does not present a marketing-cookie consent banner.
        </p>
        <p>
          If analytics or advertising technologies are added later, they will be described here before they
          are treated as part of ordinary site use.
        </p>
      </LegalSection>

      <LegalSection id="security" number="14" title="Security">
        <p>
          TrueFix360 uses administrative, technical, and organizational measures intended to protect
          information in a manner appropriate to a property-services platform. Those measures include
          authenticated portals, role-based access, organization boundaries, private file storage, server-side
          authorization checks, and audit logging.
        </p>
        <p>
          No internet service or data system can guarantee absolute security. Transmission and storage
          involve residual risk.
        </p>
      </LegalSection>

      <LegalSection id="retention" number="15" title="Retention">
        <p>
          Information is retained for as long as reasonably necessary for operational, contractual,
          recordkeeping, security, dispute-resolution, and legal purposes, subject to applicable requirements.
        </p>
        <p>
          This policy does not publish a single deletion schedule for every record type. Work-order files,
          estimates, vendor applications, and similar business records may need to be kept after a job or
          application is closed. Temporary file-download links expire after a short period; that expiry is not
          a retention period for the underlying file.
        </p>
      </LegalSection>

      <LegalSection id="choices" number="16" title="Your choices">
        <p>
          You may contact TrueFix360 to ask about access, correction, or deletion of information we hold, or
          to ask a privacy question. Email {legal.supportEmail} and include enough detail for us to locate the
          relevant account, form submission, or property record.
        </p>
        <p>
          We will review the request. Deletion is not always possible. We may retain information when we have
          a continuing operational need, a contractual or legal obligation, a security or anti-abuse reason,
          or an unresolved dispute.
        </p>
        <p>
          Authorized portal users can also review and, where the portal allows, update certain profile or
          company details after signing in.
        </p>
      </LegalSection>

      <LegalSection id="portals" number="17" title="Portal information">
        <p>
          Client portal records may include properties, service requests, work orders, estimates, files, and
          status information for the user’s organization.
        </p>
        <p>
          Vendor portal records may include assignments, schedules, estimates the vendor is asked to submit,
          work-order actions, photos, completion documentation, coverage, company profile details, and
          compliance documents.
        </p>
        <p>
          Staff portals are used by TrueFix360 personnel to administer those records, users, notifications,
          and audit events.
        </p>
      </LegalSection>

      <LegalSection id="children" number="18" title="Children">
        <p>
          TrueFix360 is a property-services business platform. The website and portals are not directed to
          children under 13, and TrueFix360 does not knowingly seek personal information from children through
          the platform.
        </p>
      </LegalSection>

      <LegalSection id="third-party-sites" number="19" title="Third-party websites">
        <p>
          The website may link to third-party sites for convenience, such as map directions used in field
          coordination. Those sites have their own practices. TrueFix360 is not responsible for their content
          or privacy controls.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="20" title="Changes">
        <p>
          We may update this policy as the website or platform changes. The revised version will be posted on
          this page with an updated date.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="21" title="Contact">
        <p>
          Privacy questions and information requests may be sent to{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
