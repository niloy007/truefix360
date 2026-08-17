import Link from "next/link";
import { EmptyState, StatCard } from "@/components/app/AppShell";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientDashboardPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const org = ctx.membership.organizationId;
  const [open, progress, approval, completed] = await Promise.all([
    admin.from("service_requests").select("id", { count: "exact", head: true }).eq("client_organization_id", org).in("status", ["submitted", "reviewing"]),
    admin.from("work_orders").select("id", { count: "exact", head: true }).eq("client_organization_id", org).in("status", ["assigned", "scheduled", "in_progress", "en_route", "on_site"]),
    admin.from("estimates").select("id, work_orders!inner(client_organization_id)", { count: "exact", head: true }).eq("work_orders.client_organization_id", org).eq("status", "sent_to_client"),
    admin.from("work_orders").select("id", { count: "exact", head: true }).eq("client_organization_id", org).eq("status", "completed"),
  ]);
  const { data: recent } = await admin
    .from("service_requests")
    .select("id, reference_number, issue, status, created_at")
    .eq("client_organization_id", org)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
        <Link href="/portal/client/requests/new" className="inline-flex h-12 items-center bg-brand px-4 text-sm font-semibold text-white">
          New Service Request
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Requests" value={open.count ?? 0} />
        <StatCard label="In Progress" value={progress.count ?? 0} />
        <StatCard label="Awaiting Approval" value={approval.count ?? 0} />
        <StatCard label="Completed Recently" value={completed.count ?? 0} />
      </div>
      <section>
        <h2 className="font-heading text-xl font-semibold">Recent activity</h2>
        <div className="mt-4 divide-y divide-line border border-line bg-white">
          {(recent ?? []).length === 0 ? (
            <EmptyState title="No requests yet" body="Create a service request to get started." />
          ) : (
            (recent ?? []).map((row) => (
              <Link key={row.id} href={`/portal/client/requests/${row.id}`} className="block px-4 py-3 text-sm hover:bg-cream">
                {row.reference_number} · {row.issue} · {row.status}
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
