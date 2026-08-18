import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminSelect, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from("quote_requests")
    .select("id, reference_number, first_name, last_name, company, city, state, service_category, urgency, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Quote requests" description="Public Get a Quote submissions. Convert qualified requests into service requests." />
      <FilterBar>
        <AdminSelect name="status" defaultValue={params.status ?? ""}>
          <option value="">All</option>
          {["new", "reviewing", "contacted", "qualified", "converted", "declined", "closed"].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </AdminSelect>
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Filter</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No quote requests yet" body="Public Get a Quote submissions will appear here." action={<Link href="/get-a-quote" className="text-sm font-semibold text-brand">View Get a Quote page</Link>} />
      ) : (
        <AdminTable headers={["Reference", "Requestor", "Company", "Property", "Service", "Urgency", "Submitted", "Status"]}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2"><Link href={`/admin/quotes/${row.id}`} className="font-semibold hover:text-brand">{row.reference_number}</Link></td>
              <td className="px-3 py-2">{row.first_name} {row.last_name}</td>
              <td className="px-3 py-2">{row.company || "—"}</td>
              <td className="px-3 py-2">{row.city}, {row.state}</td>
              <td className="px-3 py-2">{row.service_category}</td>
              <td className="px-3 py-2">{row.urgency}</td>
              <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
              <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
