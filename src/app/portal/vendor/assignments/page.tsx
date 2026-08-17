import Link from "next/link";
import { StatusBadge } from "@/components/app/AppShell";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorAssignmentsPage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_order_assignments")
    .select("id, status, work_order_id, offered_at")
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .order("offered_at", { ascending: false });
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Assignments</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((row) => (
          <Link key={row.id} href={`/portal/vendor/assignments/${row.id}`} className="flex items-center justify-between px-4 py-4 text-sm hover:bg-cream">
            <span>Work order {row.work_order_id.slice(0, 8)}</span>
            <StatusBadge value={row.status} />
          </Link>
        ))}
        {(data ?? []).length === 0 ? <p className="px-4 py-6 text-sm text-muted">No assignments yet.</p> : null}
      </div>
    </div>
  );
}
