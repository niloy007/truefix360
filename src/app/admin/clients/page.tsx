import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminClientsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("id, name, status, created_at")
    .eq("type", "client")
    .order("created_at", { ascending: false });
  return (
    <RecordList
      title="Clients"
      description="Client organizations."
      empty="No client organizations yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/clients/${row.id}`,
        title: row.name,
        meta: "Client organization",
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
