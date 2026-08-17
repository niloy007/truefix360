import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminServiceRequestsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("service_requests")
    .select("id, reference_number, issue, status, created_at, service_category")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <RecordList
      title="Service Requests"
      description="Client portal and converted quote requests."
      empty="No service requests yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/service-requests/${row.id}`,
        title: `${row.reference_number} · ${row.issue}`,
        meta: row.service_category,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
