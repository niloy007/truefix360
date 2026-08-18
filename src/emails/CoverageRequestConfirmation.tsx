import { EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  name: string;
  county: string;
  state: string;
  serviceCategory: string;
};

export function CoverageRequestConfirmation(props: Props) {
  return (
    <EmailLayout
      title="We received your coverage request"
      preview={`Reference ${props.referenceNumber}`}
    >
      <EmailParagraph>Hello {props.name || "there"},</EmailParagraph>
      <EmailParagraph>
        TrueFix360 received your coverage request. This confirms receipt only. It does not mean
        local coverage is already established or that a crew is assigned.
      </EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={props.referenceNumber} />
        <EmailRow label="Service" value={props.serviceCategory} />
        <EmailRow label="Area" value={`${props.county}, ${props.state}`} />
      </EmailTable>
      <EmailParagraph>
        Operations will review the location and follow up using the contact details you provided.
      </EmailParagraph>
    </EmailLayout>
  );
}
