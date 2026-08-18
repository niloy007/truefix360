import Link from "next/link";
import { AdminTable, EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { serviceLabel } from "@/lib/coverage/logic";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCoverageGapsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("coverage_gaps")
    .select("*")
    .in("status", ["open", "sourcing"])
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader title="Coverage gaps" description="Uncovered county and service combinations with active demand." />
      {(data ?? []).length === 0 ? (
        <EmptyState title="No open coverage gaps" body="Gaps appear when a request needs a county and service with no verified coverage." />
      ) : (
        <AdminTable headers={["County", "State", "Service", "Demand", "Priority", "Status", "Opened", "Action"]}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2">{row.county_name}</td>
              <td className="px-3 py-2">{row.state_code}</td>
              <td className="px-3 py-2">{serviceLabel(row.service_category)}</td>
              <td className="px-3 py-2">{row.active_request_count}</td>
              <td className="px-3 py-2">{row.priority}</td>
              <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
              <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
              <td className="px-3 py-2">
                <Link href={`/admin/dispatch?state=${row.state_code}&service=${row.service_category}`} className="font-semibold text-brand">
                  Source vendor
                </Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
