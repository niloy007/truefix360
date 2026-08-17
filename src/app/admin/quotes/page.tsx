import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminQuotesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("quote_requests")
    .select("id, reference_number, first_name, last_name, city, state, service_category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <RecordList
      title="Quote Requests"
      description="Public Get a Quote submissions."
      empty="No quote requests yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/quotes/${row.id}`,
        title: `${row.reference_number} · ${row.service_category}`,
        meta: `${row.first_name} ${row.last_name} · ${row.city}, ${row.state}`,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
