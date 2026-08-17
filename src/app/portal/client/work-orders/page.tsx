import { RecordList } from "@/components/app/RecordList";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientWorkOrdersPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_orders")
    .select("id, reference_number, title, status, created_at, service_category")
    .eq("client_organization_id", ctx.membership.organizationId)
    .order("created_at", { ascending: false });
  return (
    <RecordList
      title="Work Orders"
      description="Client-visible work order information only."
      empty="No work orders yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/portal/client/work-orders/${row.id}`,
        title: `${row.reference_number} · ${row.title}`,
        meta: row.service_category,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
