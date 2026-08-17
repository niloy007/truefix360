import { RecordList } from "@/components/app/RecordList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminEstimatesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("estimates")
    .select("id, reference_number, status, created_at, amount, client_sell_amount")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <RecordList
      title="Estimates"
      description="Vendor cost and client-facing sell amounts are both visible here."
      empty="No estimates yet."
      rows={(data ?? []).map((row) => ({
        id: row.id,
        href: `/admin/estimates/${row.id}`,
        title: row.reference_number,
        meta: `Vendor ${row.amount ?? "—"} · Client ${row.client_sell_amount ?? "—"}`,
        status: row.status,
        createdAt: row.created_at,
      }))}
    />
  );
}
