import Link from "next/link";
import { toClientEstimatePayload } from "@/lib/confidentiality";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/app/AppShell";

export default async function ClientEstimatesPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("estimates")
    .select("id, reference_number, work_order_id, status, client_sell_amount, client_visible_scope, client_comment, created_at, work_orders!inner(client_organization_id)")
    .eq("work_orders.client_organization_id", ctx.membership.organizationId)
    .order("created_at", { ascending: false });
  const rows = (data ?? []).map((row) => toClientEstimatePayload(row));
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Estimates</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {rows.map((row) => (
          <Link key={row.id} href={`/portal/client/estimates/${row.id}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-cream">
            <span>{row.referenceNumber} · {row.amount ?? "Pending"}</span>
            <StatusBadge value={row.status} />
          </Link>
        ))}
        {rows.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No estimates yet.</p> : null}
      </div>
    </div>
  );
}
