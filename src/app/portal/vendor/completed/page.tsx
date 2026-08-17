import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorCompletedPage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_order_assignments")
    .select("id, work_order_id, completed_at")
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .eq("status", "completed");
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Completed Jobs</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">{row.work_order_id}</div>
        ))}
      </div>
    </div>
  );
}
