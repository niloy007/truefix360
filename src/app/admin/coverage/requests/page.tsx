import Link from "next/link";
import { AdminTable, EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { serviceLabel } from "@/lib/coverage/logic";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCoverageRequestsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("coverage_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader title="Coverage requests" description="Public coverage review requests. History is preserved when status changes." />
      {(data ?? []).length === 0 ? (
        <EmptyState title="No coverage requests yet" body="Public coverage request submissions will appear here." />
      ) : (
        <AdminTable headers={["Reference", "Company", "Location", "Service", "Urgency", "Result", "Status", "Submitted"]}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2">
                <Link href={`/admin/coverage/requests/${row.id}`} className="font-semibold hover:text-brand">{row.reference_number}</Link>
              </td>
              <td className="px-3 py-2">{row.company || `${row.first_name} ${row.last_name}`}</td>
              <td className="px-3 py-2">{row.county_name}, {row.state_code}</td>
              <td className="px-3 py-2">{serviceLabel(row.service_category)}</td>
              <td className="px-3 py-2">{row.urgency}</td>
              <td className="px-3 py-2">{row.coverage_result_at_submission}</td>
              <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
              <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
