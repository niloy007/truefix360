import Link from "next/link";
import { AdminTable, EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminVendorApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const statuses = ["submitted", "reviewing", "more_information_needed", "approved", "declined"] as const;
  const counts = Object.fromEntries(
    await Promise.all(
      statuses.map(async (status) => {
        const { count } = await admin.from("vendor_applications").select("id", { count: "exact", head: true }).eq("status", status);
        return [status, count ?? 0];
      }),
    ),
  ) as Record<string, number>;
  let query = admin
    .from("vendor_applications")
    .select("id, reference_number, company_name, first_name, last_name, city, state, services, coverage_states, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Vendor applications" description="Review public vendor network applications with the existing approve and request-info actions." />
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Link key={status} href={`/admin/vendor-applications?status=${status}`} className="border border-line bg-white px-3 py-2 text-sm">
            {status.replaceAll("_", " ")} <strong>{counts[status]}</strong>
          </Link>
        ))}
      </div>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No vendor applications yet" body="Public vendor applications will appear here for review." />
      ) : (
        <AdminTable headers={["Reference", "Company", "Contact", "Location", "Services", "Coverage", "Submitted", "Status"]}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2"><Link href={`/admin/vendor-applications/${row.id}`} className="font-semibold hover:text-brand">{row.reference_number}</Link></td>
              <td className="px-3 py-2">{row.company_name}</td>
              <td className="px-3 py-2">{row.first_name} {row.last_name}</td>
              <td className="px-3 py-2">{row.city}, {row.state}</td>
              <td className="px-3 py-2">{(row.services ?? []).slice(0, 3).join(", ")}</td>
              <td className="px-3 py-2">{row.coverage_states || "—"}</td>
              <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
              <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
