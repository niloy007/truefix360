import { EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  name: string;
};

export function ContactConfirmation({ referenceNumber, name }: Props) {
  return (
    <EmailLayout
      title="Your message has been received"
      preview={`Reference ${referenceNumber}`}
    >
      <EmailParagraph>Hello {name || "there"},</EmailParagraph>
      <EmailParagraph>
        TrueFix360 received your message. Save this reference number for your records.
      </EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={referenceNumber} />
      </EmailTable>
    </EmailLayout>
  );
}
