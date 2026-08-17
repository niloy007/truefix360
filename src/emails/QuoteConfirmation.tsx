import { EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  name: string;
  serviceCategory: string;
  city: string;
  state: string;
};

export function QuoteConfirmation(props: Props) {
  return (
    <EmailLayout
      title="Your service request has been received"
      preview={`Reference ${props.referenceNumber}`}
    >
      <EmailParagraph>Hello {props.name || "there"},</EmailParagraph>
      <EmailParagraph>
        TrueFix360 received your quote request. This is a confirmation of receipt only.
        It does not mean the work has been accepted or priced.
      </EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={props.referenceNumber} />
        <EmailRow label="Service" value={props.serviceCategory} />
        <EmailRow label="Location" value={`${props.city}, ${props.state}`} />
      </EmailTable>
      <EmailParagraph>
        Our team will review the details and follow up using the contact method you selected.
        Save this number for your records.
      </EmailParagraph>
    </EmailLayout>
  );
}
