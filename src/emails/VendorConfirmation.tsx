import { EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  companyName: string;
};

export function VendorConfirmation({ referenceNumber, companyName }: Props) {
  return (
    <EmailLayout
      title="We received your vendor application"
      preview={`Reference ${referenceNumber}`}
    >
      <EmailParagraph>Thank you, {companyName}.</EmailParagraph>
      <EmailParagraph>
        TrueFix360 received your vendor application. Submitting an application does not
        guarantee work assignments or work volume.
      </EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={referenceNumber} />
      </EmailTable>
      <EmailParagraph>Save this number for your records.</EmailParagraph>
    </EmailLayout>
  );
}
