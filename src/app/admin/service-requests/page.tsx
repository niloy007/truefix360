import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminSelect, PageHeader, PriorityBadge, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminServiceRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from("service_requests")
    .select("id, reference_number, issue, status, created_at, service_category, priority, organizations:client_organization_id(name), properties(city, state)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Service requests" description="Triage incoming client requests and convert them into work orders." />
      <div className="flex flex-wrap gap-2">
        {["submitted", "reviewing", "converted", "closed"].map((status) => (
          <Link key={status} href={`/admin/service-requests?status=${status}`} className="border border-line bg-white px-3 py-2 text-sm capitalize">
            {status.replaceAll("_", " ")}
          </Link>
        ))}
        <Link href="/admin/service-requests" className="border border-line bg-white px-3 py-2 text-sm">All</Link>
      </div>
      <FilterBar>
        <AdminSelect name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {["submitted", "reviewing", "accepted", "converted", "closed", "cancelled"].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </AdminSelect>
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Filter</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No service requests yet" body="Client portal requests and converted quotes will appear here." />
      ) : (
        <AdminTable headers={["Reference", "Client", "Property", "Service", "Priority", "Submitted", "Status"]}>
          {(data ?? []).map((row) => {
            const client = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
            const property = Array.isArray(row.properties) ? row.properties[0] : row.properties;
            return (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2"><Link href={`/admin/service-requests/${row.id}`} className="font-semibold hover:text-brand">{row.reference_number}</Link></td>
                <td className="px-3 py-2">{client?.name ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{property ? `${property.city}, ${property.state}` : "—"}</td>
                <td className="px-3 py-2">{row.service_category}</td>
                <td className="px-3 py-2"><PriorityBadge value={row.priority} /></td>
                <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
                <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
