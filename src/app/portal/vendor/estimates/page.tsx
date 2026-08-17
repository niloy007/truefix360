import { toVendorEstimatePayload } from "@/lib/confidentiality";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorEstimatesPage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("estimates")
    .select("id, reference_number, work_order_id, status, amount, description, labor_material_explanation, created_at")
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .order("created_at", { ascending: false });
  const rows = (data ?? []).map((row) => toVendorEstimatePayload(row));
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Estimates</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">
            {row.referenceNumber} · {row.amount} · {row.status}
          </div>
        ))}
      </div>
    </div>
  );
}
