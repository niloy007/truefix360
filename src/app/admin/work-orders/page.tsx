import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminWorkOrdersPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_orders")
    .select("id, reference_number, title, status, created_at, service_category")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <RecordList
      title="Work Orders"
      description="Internal operations records."
      empty="No work orders yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/work-orders/${row.id}`,
        title: `${row.reference_number} · ${row.title}`,
        meta: row.service_category,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
