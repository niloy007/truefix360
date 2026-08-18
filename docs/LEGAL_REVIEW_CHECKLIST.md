# TrueFix360 legal review checklist

Internal document for owner and counsel. Do not treat the public website pages as certified legal advice.

Public `/privacy`, `/terms`, and `/accessibility` pages were rewritten on **August 18, 2026** to describe the live website and platform. Template warnings were removed from public pages. Open items below should be confirmed before treating those pages as final legal documents.

## Entity and contact

- [ ] Confirm the legal entity name. Public pages currently display the brand name **TrueFix360** because `company.legalName` is not set.
- [ ] Confirm a business mailing address, if one should appear on legal pages.
- [ ] Confirm that `support@truefix360.com` and `office@truefix360.com` are the correct public legal/privacy contacts.
- [ ] Confirm whether a phone number should be published. None is configured.

## Governing law and disputes

- [ ] Confirm governing law / state. No jurisdiction is configured, so the public Terms page does not name a state.
- [ ] Confirm dispute venue, arbitration, or court forum if required.
- [ ] Confirm whether a separate written client or vendor agreement will control over website terms.

## Liability and contract language

- [ ] Review limitation-of-liability wording. Current public language is conservative and does not attempt aggressive caps or waivers.
- [ ] Review indemnification wording.
- [ ] Review vendor independent-contractor wording. Website terms state that an application does not create employment and that detailed contractor terms belong in a separate vendor agreement.
- [ ] Confirm whether additional vendor onboarding agreements are required after approval.

## Privacy and retention

- [ ] Confirm whether any U.S. state privacy law (including CCPA/CPRA or similar) or GDPR currently applies to TrueFix360.
- [ ] Confirm a data-request workflow for access, correction, and deletion requests sent to `support@truefix360.com`.
- [ ] Confirm retention periods. The application does not currently define fixed deletion schedules for submissions, portal records, or files.
- [ ] Review children’s privacy language. The public statement is limited to “not directed to children under 13.”
- [ ] Confirm that public vendor applications should continue to omit SSN/EIN collection.

## Cookies, analytics, and tracking

- [ ] Confirm that no marketing analytics, advertising pixels, or session-replay tools are in production. None were found in the current codebase.
- [ ] If analytics or advertising cookies are added later, update `/privacy` and review cookie-consent requirements before launch.
- [ ] Confirm that essential authentication/session cookies are acceptable without a public consent banner.

## Payments, insurance, and licensing

- [ ] Confirm payment, invoicing, and cancellation terms. Website terms currently defer to estimates, work authorizations, or written agreements and do not invent Net 30 or similar terms.
- [ ] Confirm whether insurance, licensing, or bonding statements should appear on public pages. None were added.
- [ ] Confirm refund or cancellation policy needs, if any. No refund policy page was created.

## Operational accuracy to re-check after platform changes

- [ ] Public forms persist to the database: contact, quote, vendor application, coverage request.
- [ ] Quote attachments may include JPG, PNG, WebP, and PDF files stored privately.
- [ ] Vendor compliance documents (W-9, insurance, licenses) are collected only after authenticated portal access.
- [ ] Coverage checker results are informational; coverage requests are stored and do not guarantee sourcing.
- [ ] Accounts are invitation-based. Roles include admin, staff, client, vendor admin, and crew.
- [ ] Email notifications may be sent through Resend when configured. WhatsApp staff alerts exist in code but are disabled unless configured.
- [ ] Hosting is on Hostinger. Database, auth, and private storage are on Supabase.

## Accessibility

- [ ] Confirm whether any formal WCAG/ADA assessment will be commissioned. Public pages do not claim certification.
- [ ] Confirm the accessibility feedback mailbox (`support@truefix360.com`) and any internal response process.

## Suggested owner/counsel review order

1. Entity name, address, and governing law.
2. Privacy Policy information-collection and sharing sections against current operations.
3. Terms of Service service-request, estimate, coverage, and vendor-application sections.
4. Limitation of liability, indemnification, and independent-contractor language.
5. Accessibility statement limitations and feedback process.
6. Form and login disclosure language.
