import { EmailButton, EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  email: string;
  phone: string;
  topic: string;
  message: string;
  submittedAt: string;
  adminUrl: string;
};

export function InternalContactNotification(props: Props) {
  return (
    <EmailLayout
      title={`New contact request ${props.referenceNumber}`}
      preview={`${props.referenceNumber} from ${props.firstName} ${props.lastName}`}
    >
      <EmailParagraph>A new contact request was saved in TrueFix360.</EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={props.referenceNumber} />
        <EmailRow label="Name" value={`${props.firstName} ${props.lastName}`.trim()} />
        <EmailRow label="Company" value={props.company} />
        <EmailRow label="Email" value={props.email} />
        <EmailRow label="Phone" value={props.phone} />
        <EmailRow label="Topic" value={props.topic} />
        <EmailRow label="Submitted" value={props.submittedAt} />
        <EmailRow label="Message" value={props.message} />
      </EmailTable>
      <EmailButton href={props.adminUrl} label="View in TrueFix360 Admin" />
    </EmailLayout>
  );
}
