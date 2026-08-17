import Link from "next/link";
import { EmptyState, StatCard, StatusBadge } from "@/components/app/AppShell";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const [
    contacts,
    quotes,
    requests,
    workOrders,
    vendorApps,
    estimates,
    activity,
  ] = await Promise.all([
    count(admin, "contact_submissions", "status", "new"),
    count(admin, "quote_requests", "status", "new"),
    count(admin, "service_requests", "status", "submitted"),
    countNot(admin, "work_orders", "status", ["completed", "cancelled"]),
    count(admin, "vendor_applications", "status", "submitted"),
    countIn(admin, "estimates", "status", ["submitted", "internal_review", "sent_to_client"]),
    admin.from("audit_logs").select("id, action, entity_type, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const { data: recent } = await admin
    .from("quote_requests")
    .select("id, reference_number, first_name, last_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Live counts from TrueFix360 records.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="New Contacts" value={contacts} />
        <StatCard label="New Quote Requests" value={quotes} />
        <StatCard label="Open Service Requests" value={requests} />
        <StatCard label="Active Work Orders" value={workOrders} />
        <StatCard label="Vendor Applications Awaiting Review" value={vendorApps} />
        <StatCard label="Estimates Awaiting Action" value={estimates} />
      </div>
      <section>
        <h2 className="font-heading text-xl font-semibold">Recent activity</h2>
        <div className="mt-4 divide-y divide-line border border-line bg-white">
          {(activity.data ?? []).length === 0 ? (
            <EmptyState title="No activity yet" body="Audit events will appear here as the team works." />
          ) : (
            (activity.data ?? []).map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>{row.action} · {row.entity_type}</span>
                <span className="text-muted">{formatDateTime(row.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </section>
      <section>
        <h2 className="font-heading text-xl font-semibold">Recent submissions</h2>
        <div className="mt-4 divide-y divide-line border border-line bg-white">
          {(recent ?? []).length === 0 ? (
            <EmptyState title="No quote requests yet" body="Public Get a Quote submissions will show here." />
          ) : (
            (recent ?? []).map((row) => (
              <Link key={row.id} href={`/admin/quotes/${row.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-cream">
                <span>{row.reference_number} · {row.first_name} {row.last_name}</span>
                <StatusBadge value={row.status} />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

async function count(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  column: string,
  value: string,
) {
  const { count } = await admin.from(table).select("id", { count: "exact", head: true }).eq(column, value);
  return count ?? 0;
}

async function countIn(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  column: string,
  values: string[],
) {
  const { count } = await admin.from(table).select("id", { count: "exact", head: true }).in(column, values);
  return count ?? 0;
}

async function countNot(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  column: string,
  values: string[],
) {
  const { count } = await admin.from(table).select("id", { count: "exact", head: true }).not(column, "in", `(${values.join(",")})`);
  return count ?? 0;
}
