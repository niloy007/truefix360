import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; topic?: string; q?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from("contact_submissions")
    .select("id, reference_number, first_name, last_name, topic, status, created_at, email")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status);
  if (params.topic) query = query.eq("topic", params.topic);
  if (params.q) query = query.or(`email.ilike.%${params.q}%,reference_number.ilike.%${params.q}%`);
  const { data } = await query;

  return (
    <RecordList
      title="Contacts"
      description="Public contact and coverage inquiries."
      empty="No contact submissions yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/contacts/${row.id}`,
        title: `${row.reference_number} · ${row.first_name} ${row.last_name}`.trim(),
        meta: `${row.topic} · ${row.email}`,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
