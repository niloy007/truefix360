import Link from "next/link";
import {
  AlertBar,
  EmptyState,
  MetricCard,
  PageHeader,
  PriorityBadge,
  StatusBadge,
  AdminTable,
} from "@/components/admin/ui";
import { assignedVendorName, getDashboardSnapshot, unwrap } from "@/lib/admin/queries";
import { isEmergencyPriority, isUnassignedStatus } from "@/lib/admin/status";
import { formatDate, formatPropertyLine, formatRelativeTime } from "@/lib/format";

export default async function AdminDashboardPage() {
  const data = await getDashboardSnapshot();
  const alerts = [
    data.kpis.emergencyUnassigned > 0
      ? {
          href: "/admin/work-orders?filter=unassigned",
          label: `${data.kpis.emergencyUnassigned} emergency work order${data.kpis.emergencyUnassigned === 1 ? "" : "s"} have no vendor assigned`,
        }
      : null,
    data.kpis.overdue > 0
      ? {
          href: "/admin/work-orders?filter=overdue",
          label: `${data.kpis.overdue} work order${data.kpis.overdue === 1 ? "" : "s"} ${data.kpis.overdue === 1 ? "is" : "are"} overdue`,
        }
      : null,
    data.kpis.estimatesToReview > 0
      ? {
          href: "/admin/estimates?status=submitted",
          label: `${data.kpis.estimatesToReview} estimate${data.kpis.estimatesToReview === 1 ? "" : "s"} waiting for internal review`,
        }
      : null,
    data.kpis.coverageGaps > 0
      ? {
          href: "/admin/coverage/gaps",
          label: `${data.kpis.coverageGaps} coverage gap${data.kpis.coverageGaps === 1 ? "" : "s"} need sourcing`,
        }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  const attention = [...data.attentionWorkOrders]
    .sort((a, b) => {
      const score = (row: typeof a) =>
        (isEmergencyPriority(row.priority) && isUnassignedStatus(row.status) ? 8 : 0) +
        (row.scheduled_end && new Date(row.scheduled_end).getTime() < Date.now() ? 6 : 0) +
        (isUnassignedStatus(row.status) ? 3 : 0);
      return score(b) - score(a);
    })
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations command center"
        description="What needs attention right now across requests, work orders, estimates, and vendors."
        actions={
          <Link href="/admin/work-orders/new" className="inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white">
            New Work Order
          </Link>
        }
      />
      <AlertBar items={alerts} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open work orders" value={data.kpis.openWorkOrders} href="/admin/work-orders" />
        <MetricCard
          label="Needs assignment"
          value={data.kpis.needsAssignment}
          href="/admin/work-orders?filter=unassigned"
          hint={`${data.kpis.emergencyUnassigned} emergency`}
        />
        <MetricCard label="Due today" value={data.kpis.dueToday} href="/admin/work-orders?filter=due-today" />
        <MetricCard
          label="Urgent / overdue"
          value={data.kpis.overdue + data.kpis.emergencyUnassigned}
          href="/admin/work-orders?filter=overdue"
        />
        <MetricCard label="Estimates to review" value={data.kpis.estimatesToReview} href="/admin/estimates?status=submitted" />
        <MetricCard label="Client approvals" value={data.kpis.clientApprovals} href="/admin/estimates?status=sent_to_client" />
        <MetricCard label="New service requests" value={data.kpis.newServiceRequests} href="/admin/service-requests?status=submitted" />
        <MetricCard label="Vendor applications" value={data.kpis.vendorApplications} href="/admin/vendor-applications?status=submitted" />
        <MetricCard label="Coverage gaps" value={data.kpis.coverageGaps} href="/admin/coverage/gaps" />
      </section>
      <section>
        <h2 className="font-heading text-xl font-semibold">Work order pipeline</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {data.pipeline.map((stage) => (
            <Link
              key={stage.id}
              href={
                stage.id === "completed_today"
                  ? "/admin/work-orders?status=completed"
                  : `/admin/work-orders?status=${
                      stage.id === "on_site"
                        ? "on_site"
                        : stage.id === "awaiting_approval"
                          ? "awaiting_client_approval"
                          : stage.id
                    }`
              }
              className="min-w-[140px] border border-line bg-white p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{stage.label}</p>
              <p className="mt-2 font-heading text-3xl font-semibold">{stage.count}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-heading text-xl font-semibold">Needs attention</h2>
          <div className="mt-3 divide-y divide-line border border-line bg-white">
            {attention.length === 0 ? (
              <EmptyState title="Nothing urgent" body="When emergency, overdue, or unassigned work appears, it will show here." />
            ) : (
              attention.map((row) => {
                const property = unwrap<{ address1?: string; city?: string; state?: string }>(row.properties);
                const client = unwrap<{ name?: string }>(row.organizations);
                return (
                  <div key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
                        {isEmergencyPriority(row.priority)
                          ? "Emergency"
                          : isUnassignedStatus(row.status)
                            ? "Unassigned"
                            : "Follow-up"}
                      </p>
                      <Link href={`/admin/work-orders/${row.id}`} className="font-semibold text-ink hover:text-brand">
                        {row.reference_number} · {row.title}
                      </Link>
                      <p className="text-sm text-muted">
                        {formatPropertyLine(property)} · {client?.name ?? "Client"}
                      </p>
                      <p className="mt-1 text-xs text-muted">Created {formatRelativeTime(row.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge value={row.priority} />
                      <StatusBadge value={row.status} />
                      <Link
                        href={isUnassignedStatus(row.status) ? `/admin/dispatch?workOrderId=${row.id}` : `/admin/work-orders/${row.id}`}
                        className="inline-flex h-9 items-center border border-ink px-3 text-sm font-semibold"
                      >
                        {isUnassignedStatus(row.status) ? "Assign vendor" : "Open"}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-xl font-semibold">Vendor sourcing</h2>
            <div className="mt-3 divide-y divide-line border border-line bg-white">
              {data.sourcingQueue.length === 0 ? (
                <EmptyState title="No sourcing queue" body="Work orders that need coverage will appear here." />
              ) : (
                data.sourcingQueue.map((row) => {
                  const property = unwrap<{ city?: string; state?: string }>(row.properties);
                  return (
                    <Link key={row.id} href={`/admin/dispatch?workOrderId=${row.id}`} className="block px-4 py-3 hover:bg-cream">
                      <p className="font-semibold">{row.reference_number}</p>
                      <p className="text-sm text-muted">
                        {[property?.city, property?.state].filter(Boolean).join(", ")} · {row.service_category} · {row.priority}
                      </p>
                    </Link>
                  );
                })
              )}
              <Link href="/admin/dispatch" className="block px-4 py-3 text-sm font-semibold text-brand">
                Open dispatch →
              </Link>
            </div>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Estimates & requests</h2>
            <div className="mt-3 divide-y divide-line border border-line bg-white">
              {data.reviewEstimates.map((row) => (
                <Link key={row.id} href={`/admin/estimates/${row.id}`} className="block px-4 py-3 text-sm hover:bg-cream">
                  <span className="font-semibold">{row.reference_number}</span>
                  <span className="mt-1 block text-muted">Estimate {String(row.status).replaceAll("_", " ")}</span>
                </Link>
              ))}
              {data.triageRequests.map((row) => (
                <Link key={row.id} href={`/admin/service-requests/${row.id}`} className="block px-4 py-3 text-sm hover:bg-cream">
                  <span className="font-semibold">{row.reference_number}</span>
                  <span className="mt-1 block text-muted">{row.issue}</span>
                </Link>
              ))}
              {data.reviewEstimates.length === 0 && data.triageRequests.length === 0 ? (
                <EmptyState title="No review queue" body="Submitted estimates and new service requests will appear here." />
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">Recent work orders</h2>
          <Link href="/admin/work-orders" className="text-sm font-semibold text-brand">
            View all work orders →
          </Link>
        </div>
        {data.recentWorkOrders.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No work orders yet"
              body="Create a work order manually or convert a service request."
              action={
                <Link href="/admin/work-orders/new" className="inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white">
                  New Work Order
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-3">
            <AdminTable headers={["WO", "Property", "Service", "Client", "Vendor", "Status", "Schedule / due"]}>
              {data.recentWorkOrders.map((row) => {
                const property = unwrap<{ address1?: string; city?: string; state?: string }>(row.properties);
                const client = unwrap<{ name?: string }>(row.organizations);
                return (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-3 py-2">
                      <Link href={`/admin/work-orders/${row.id}`} className="font-semibold hover:text-brand">
                        {row.reference_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted">{formatPropertyLine(property)}</td>
                    <td className="px-3 py-2">{row.service_category}</td>
                    <td className="px-3 py-2">{client?.name ?? "—"}</td>
                    <td className="px-3 py-2">{assignedVendorName(row.work_order_assignments)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge value={row.status} />
                    </td>
                    <td className="px-3 py-2 text-muted">{formatDate(row.scheduled_start ?? row.scheduled_end)}</td>
                  </tr>
                );
              })}
            </AdminTable>
          </div>
        )}
      </section>
    </div>
  );
}
