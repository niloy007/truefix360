import { EmailButton, EmailLayout, EmailParagraph } from "@/emails/EmailLayout";

type Props = {
  firstName?: string | null;
  organizationName: string;
  roleLabel: string;
  inviteUrl: string;
};

export function UserInviteEmail({
  firstName,
  organizationName,
  roleLabel,
  inviteUrl,
}: Props) {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi,";
  return (
    <EmailLayout
      title="You're invited to TrueFix360"
      preview={`Join ${organizationName} on TrueFix360`}
    >
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        You have been invited to access TrueFix360 for <strong>{organizationName}</strong> as{" "}
        <strong>{roleLabel}</strong>. Open the link below to create your password and activate
        your account.
      </EmailParagraph>
      <EmailButton href={inviteUrl} label="Accept invitation" />
      <EmailParagraph>
        If this link expires, ask a TrueFix360 administrator to resend your invitation.
      </EmailParagraph>
    </EmailLayout>
  );
}
