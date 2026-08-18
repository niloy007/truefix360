import { EmailButton, EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  email: string;
  phone: string;
  city: string;
  state: string;
  county: string;
  serviceCategory: string;
  urgency: string;
  numberOfProperties?: string | null;
  description: string;
  coverageResult: string;
  adminUrl: string;
};

export function InternalCoverageRequestNotification(props: Props) {
  return (
    <EmailLayout
      title={`Coverage request ${props.referenceNumber}`}
      preview={`${props.serviceCategory} in ${props.county}, ${props.state}`}
    >
      <EmailParagraph>A coverage request was saved in TrueFix360.</EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={props.referenceNumber} />
        <EmailRow label="Name" value={`${props.firstName} ${props.lastName}`.trim()} />
        <EmailRow label="Company" value={props.company} />
        <EmailRow label="Email" value={props.email} />
        <EmailRow label="Phone" value={props.phone} />
        <EmailRow label="Location" value={`${props.county}, ${props.city}, ${props.state}`} />
        <EmailRow label="Service" value={props.serviceCategory} />
        <EmailRow label="Urgency" value={props.urgency} />
        <EmailRow label="Properties" value={props.numberOfProperties} />
        <EmailRow label="Coverage result" value={props.coverageResult} />
        <EmailRow label="Details" value={props.description} />
      </EmailTable>
      <EmailButton href={props.adminUrl} label="Open in admin" />
    </EmailLayout>
  );
}
