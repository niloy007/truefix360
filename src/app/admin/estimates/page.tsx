import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminSelect, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminEstimatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from("estimates")
    .select("id, reference_number, status, created_at, amount, client_sell_amount, work_orders(reference_number, properties(address1, city, state)), organizations:vendor_organization_id(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Estimates" description="Internal staff can see vendor cost and client sell amount. Those values stay off client and vendor payloads." />
      <div className="flex flex-wrap gap-2">
        {[
          ["submitted", "Awaiting review"],
          ["sent_to_client", "Awaiting client"],
          ["approved", "Approved"],
          ["declined", "Declined"],
        ].map(([status, label]) => (
          <Link key={status} href={`/admin/estimates?status=${status}`} className="border border-line bg-white px-3 py-2 text-sm">{label}</Link>
        ))}
        <Link href="/admin/estimates" className="border border-line bg-white px-3 py-2 text-sm">All</Link>
      </div>
      <FilterBar>
        <AdminSelect name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {["draft", "submitted", "internal_review", "sent_to_client", "approved", "declined", "withdrawn"].map((status) => (
            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
          ))}
        </AdminSelect>
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Filter</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No estimates yet" body="Vendor-submitted estimates will appear here for internal review." />
      ) : (
        <AdminTable headers={["Estimate", "WO", "Property", "Vendor", "Vendor amount", "Client amount", "Status", "Submitted"]}>
          {(data ?? []).map((row) => {
            const workOrder = Array.isArray(row.work_orders) ? row.work_orders[0] : row.work_orders;
            const property = workOrder && (Array.isArray(workOrder.properties) ? workOrder.properties[0] : workOrder.properties);
            const vendor = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
            return (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2"><Link href={`/admin/estimates/${row.id}`} className="font-semibold hover:text-brand">{row.reference_number}</Link></td>
                <td className="px-3 py-2">{workOrder?.reference_number ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{property ? `${property.address1}, ${property.city}` : "—"}</td>
                <td className="px-3 py-2">{vendor?.name ?? "—"}</td>
                <td className="px-3 py-2">{row.amount ?? "—"}</td>
                <td className="px-3 py-2">{row.client_sell_amount ?? "—"}</td>
                <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
                <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
