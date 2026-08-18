import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminInput, PageHeader, StatusBadge } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin.from("organizations").select("id, name, status, created_at").eq("type", "client").order("name");
  if (params.q) query = query.ilike("name", `%${params.q}%`);
  const { data } = await query;
  const ids = (data ?? []).map((row) => row.id);
  const [{ data: properties }, { data: workOrders }, { data: requests }] = await Promise.all([
    ids.length ? admin.from("properties").select("id, client_organization_id").in("client_organization_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? admin.from("work_orders").select("id, client_organization_id, status").in("client_organization_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? admin.from("service_requests").select("id, client_organization_id, status").in("client_organization_id", ids) : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Client organizations, properties, and open operational volume." />
      <FilterBar>
        <AdminInput name="q" defaultValue={params.q} placeholder="Search client name" />
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Search</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No clients yet" body="Client organizations appear when quotes are converted or a client is invited." />
      ) : (
        <AdminTable headers={["Client", "Active properties", "Open work orders", "Open requests", "Status"]}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2"><Link href={`/admin/clients/${row.id}`} className="font-semibold hover:text-brand">{row.name}</Link></td>
              <td className="px-3 py-2">{(properties ?? []).filter((item) => item.client_organization_id === row.id).length}</td>
              <td className="px-3 py-2">{(workOrders ?? []).filter((item) => item.client_organization_id === row.id && !["completed", "cancelled"].includes(item.status)).length}</td>
              <td className="px-3 py-2">{(requests ?? []).filter((item) => item.client_organization_id === row.id && !["converted", "closed", "cancelled"].includes(item.status)).length}</td>
              <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
