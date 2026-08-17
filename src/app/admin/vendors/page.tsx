import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminVendorsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("id, name, status, created_at")
    .eq("type", "vendor")
    .order("created_at", { ascending: false });
  return (
    <RecordList
      title="Vendors"
      description="Vendor organizations."
      empty="No vendor organizations yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/vendors/${row.id}`,
        title: row.name,
        meta: "Vendor organization",
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
