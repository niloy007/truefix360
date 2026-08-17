import { StatCard } from "@/components/app/AppShell";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorDashboardPage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const org = ctx.membership.organizationId;
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const [offered, assigned, due, estimate, review] = await Promise.all([
    admin.from("work_order_assignments").select("id", { count: "exact", head: true }).eq("vendor_organization_id", org).eq("status", "offered"),
    admin.from("work_order_assignments").select("id", { count: "exact", head: true }).eq("vendor_organization_id", org).eq("status", "accepted"),
    admin.from("work_orders").select("id, work_order_assignments!inner(vendor_organization_id)", { count: "exact", head: true }).eq("work_order_assignments.vendor_organization_id", org).gte("scheduled_start", start.toISOString()).lt("scheduled_start", end.toISOString()),
    admin.from("work_orders").select("id, work_order_assignments!inner(vendor_organization_id)", { count: "exact", head: true }).eq("work_order_assignments.vendor_organization_id", org).eq("status", "estimate_required"),
    admin.from("estimates").select("id", { count: "exact", head: true }).eq("vendor_organization_id", org).eq("status", "submitted"),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Offered Jobs" value={offered.count ?? 0} />
        <StatCard label="Assigned" value={assigned.count ?? 0} />
        <StatCard label="Due Today" value={due.count ?? 0} />
        <StatCard label="Estimate Required" value={estimate.count ?? 0} />
        <StatCard label="Awaiting Review" value={review.count ?? 0} />
      </div>
    </div>
  );
}
