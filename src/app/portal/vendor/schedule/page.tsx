import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";

export default async function VendorSchedulePage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data: assigned } = await admin
    .from("work_order_assignments")
    .select("work_order_id")
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .in("status", ["offered", "accepted", "completed"]);
  const ids = (assigned ?? []).map((row) => row.work_order_id);
  const { data } = ids.length
    ? await admin
        .from("work_orders")
        .select("id, reference_number, scheduled_start, status, title")
        .in("id", ids)
        .not("scheduled_start", "is", null)
        .order("scheduled_start", { ascending: true })
    : { data: [] };
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Schedule</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">
            {row.reference_number} · {row.title} · {formatDateTime(row.scheduled_start)}
          </div>
        ))}
      </div>
    </div>
  );
}
