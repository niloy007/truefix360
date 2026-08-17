import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminVendorApplicationsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_applications")
    .select("id, reference_number, company_name, first_name, last_name, state, services, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <RecordList
      title="Vendor Applications"
      description="Public vendor network applications."
      empty="No vendor applications yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/vendor-applications/${row.id}`,
        title: `${row.reference_number} · ${row.company_name}`,
        meta: `${row.first_name} ${row.last_name} · ${row.state} · ${(row.services ?? []).slice(0, 3).join(", ")}`,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
