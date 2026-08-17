import { EmailButton, EmailLayout, EmailParagraph, EmailRow, EmailTable } from "@/emails/EmailLayout";

type Props = {
  title: string;
  preview: string;
  rows: Array<{ label: string; value?: string | null }>;
  adminUrl: string;
};

export function InternalGenericNotification({ title, preview, rows, adminUrl }: Props) {
  return (
    <EmailLayout title={title} preview={preview}>
      <EmailParagraph>{preview}</EmailParagraph>
      <EmailTable>
        {rows.map((row) => (
          <EmailRow key={row.label} label={row.label} value={row.value} />
        ))}
      </EmailTable>
      <EmailButton href={adminUrl} label="View in TrueFix360 Admin" />
    </EmailLayout>
  );
}
