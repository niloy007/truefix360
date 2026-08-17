import { EmailButton, EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  email: string;
  phone: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  occupancyStatus: string;
  serviceCategory: string;
  requestedService: string;
  description: string;
  urgency: string;
  preferredDate?: string | null;
  numberOfProperties: string;
  preferredContactMethod: string;
  attachmentCount: number;
  submittedAt: string;
  adminUrl: string;
};

export function InternalQuoteNotification(props: Props) {
  return (
    <EmailLayout
      title={`New quote request ${props.referenceNumber}`}
      preview={`${props.serviceCategory} in ${props.city}, ${props.state}`}
    >
      <EmailParagraph>A new quote request was saved in TrueFix360.</EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={props.referenceNumber} />
        <EmailRow label="Name" value={`${props.firstName} ${props.lastName}`.trim()} />
        <EmailRow label="Company" value={props.company} />
        <EmailRow label="Email" value={props.email} />
        <EmailRow label="Phone" value={props.phone} />
        <EmailRow label="Property" value={`${props.propertyAddress}, ${props.city}, ${props.state} ${props.zip}`} />
        <EmailRow label="Property type" value={props.propertyType} />
        <EmailRow label="Occupancy" value={props.occupancyStatus} />
        <EmailRow label="Service" value={props.serviceCategory} />
        <EmailRow label="Requested work" value={props.requestedService} />
        <EmailRow label="Description" value={props.description} />
        <EmailRow label="Urgency" value={props.urgency} />
        <EmailRow label="Preferred date" value={props.preferredDate} />
        <EmailRow label="Properties" value={props.numberOfProperties} />
        <EmailRow label="Contact method" value={props.preferredContactMethod} />
        <EmailRow label="Attachments" value={String(props.attachmentCount)} />
        <EmailRow label="Submitted" value={props.submittedAt} />
      </EmailTable>
      <EmailButton href={props.adminUrl} label="View in TrueFix360 Admin" />
    </EmailLayout>
  );
}
