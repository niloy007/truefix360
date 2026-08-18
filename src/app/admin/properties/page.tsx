import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminInput, PageHeader } from "@/components/admin/ui";
import { paramValue, unwrap } from "@/lib/admin/queries";
import { formatPropertyLine } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = paramValue(params.q) ?? "";
  const admin = createAdminClient();
  let query = admin
    .from("properties")
    .select("id, address1, city, state, zip, occupancy_status, organizations:client_organization_id(id, name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) query = query.or(`address1.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Properties" description="Client properties used on service requests and work orders." />
      <FilterBar>
        <AdminInput name="q" defaultValue={q} placeholder="Search address, city, or state" />
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Search</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No properties yet" body="Properties appear when clients, quotes, or service requests are converted." />
      ) : (
        <AdminTable headers={["Address", "City / state", "Client", "Occupancy"]}>
          {(data ?? []).map((row) => {
            const client = unwrap<{ id?: string; name?: string }>(row.organizations as never);
            return (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2">{formatPropertyLine(row)}</td>
                <td className="px-3 py-2 text-muted">{[row.city, row.state].filter(Boolean).join(", ")}</td>
                <td className="px-3 py-2">
                  {client?.id ? <Link href={`/admin/clients/${client.id}`} className="font-semibold hover:text-brand">{client.name}</Link> : "—"}
                </td>
                <td className="px-3 py-2">{row.occupancy_status || "—"}</td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
