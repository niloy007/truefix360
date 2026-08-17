import { EmailButton, EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  referenceNumber: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website?: string | null;
  city: string;
  state: string;
  services: string;
  statesCovered: string;
  travelRadius: string;
  insuranceStatus: string;
  workersCompStatus: string;
  emergencyAvailability: string;
  weekendAvailability: string;
  experience: string;
  submittedAt: string;
  adminUrl: string;
};

export function InternalVendorApplicationNotification(props: Props) {
  return (
    <EmailLayout
      title={`New vendor application ${props.referenceNumber}`}
      preview={`${props.companyName} — ${props.state}`}
    >
      <EmailParagraph>A new vendor application was saved in TrueFix360.</EmailParagraph>
      <EmailTable>
        <EmailRow label="Reference" value={props.referenceNumber} />
        <EmailRow label="Company" value={props.companyName} />
        <EmailRow label="Applicant" value={`${props.firstName} ${props.lastName}`.trim()} />
        <EmailRow label="Email" value={props.email} />
        <EmailRow label="Phone" value={props.phone} />
        <EmailRow label="Website" value={props.website} />
        <EmailRow label="Location" value={`${props.city}, ${props.state}`} />
        <EmailRow label="Services" value={props.services} />
        <EmailRow label="Coverage" value={props.statesCovered} />
        <EmailRow label="Travel radius" value={props.travelRadius} />
        <EmailRow label="Insurance" value={props.insuranceStatus} />
        <EmailRow label="Workers comp" value={props.workersCompStatus} />
        <EmailRow label="Emergency" value={props.emergencyAvailability} />
        <EmailRow label="Weekend" value={props.weekendAvailability} />
        <EmailRow label="Experience" value={props.experience} />
        <EmailRow label="Submitted" value={props.submittedAt} />
      </EmailTable>
      <EmailButton href={props.adminUrl} label="View in TrueFix360 Admin" />
    </EmailLayout>
  );
}
