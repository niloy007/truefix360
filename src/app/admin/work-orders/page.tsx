import Link from "next/link";
import {
  AdminTable,
  EmptyState,
  FilterBar,
  AdminInput,
  AdminSelect,
  PageHeader,
  Pagination,
  PriorityBadge,
  StatusBadge,
} from "@/components/admin/ui";
import { assignedVendorName, ADMIN_PAGE_SIZE, paramValue, unwrap } from "@/lib/admin/queries";
import { WORK_ORDER_QUICK_FILTERS, OPEN_WORK_ORDER_STATUSES } from "@/lib/admin/status";
import { formatDate, formatPropertyLine, utcDayBounds } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminWorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = paramValue(params.q) ?? "";
  const status = paramValue(params.status) ?? "";
  const priority = paramValue(params.priority) ?? "";
  const filter = paramValue(params.filter) ?? "";
  const page = Math.max(1, Number(paramValue(params.page) ?? "1") || 1);
  const admin = createAdminClient();
  const { start, end } = utcDayBounds();
  const now = new Date().toISOString();

  let query = admin
    .from("work_orders")
    .select(
      "id, reference_number, title, status, priority, service_category, updated_at, scheduled_start, scheduled_end, properties(address1, city, state), organizations:client_organization_id(name), work_order_assignments(status, organizations:vendor_organization_id(name))",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);

  if (q) query = query.or(`reference_number.ilike.%${q}%,title.ilike.%${q}%,service_category.ilike.%${q}%`);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (filter === "unassigned") query = query.in("status", ["new", "sourcing", "offered"]);
  if (filter === "due-today") query = query.gte("scheduled_start", start).lt("scheduled_start", end);
  if (filter === "overdue") query = query.in("status", [...OPEN_WORK_ORDER_STATUSES]).lt("scheduled_end", now);

  const { data, count } = await query;
  const rows = data ?? [];

  function hrefFor(next: Record<string, string>) {
    const search = new URLSearchParams();
    const merged = { q, status, priority, filter, page: String(page), ...next };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    const qs = search.toString();
    return qs ? `/admin/work-orders?${qs}` : "/admin/work-orders";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work orders"
        description="Track assignment, schedule, estimates, and completion across the field."
        actions={
          <Link href="/admin/work-orders/new" className="inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white">
            New Work Order
          </Link>
        }
      />
      <div className="flex flex-wrap gap-2">
        {WORK_ORDER_QUICK_FILTERS.map((item) => {
          const query = item.query as { filter?: string; status?: string };
          const active =
            (item.id === "all" && !filter && !status) ||
            (query.filter && filter === query.filter) ||
            (query.status && status === query.status);
          return (
            <Link
              key={item.id}
              href={item.id === "all" ? "/admin/work-orders" : hrefFor({ ...query, page: "1" })}
              className={`border px-3 py-1.5 text-sm font-semibold ${active ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <FilterBar>
        <AdminInput name="q" defaultValue={q} placeholder="Search reference, title, service" />
        <AdminSelect name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {[...OPEN_WORK_ORDER_STATUSES, "completed", "cancelled"].map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect name="priority" defaultValue={priority}>
          <option value="">All priorities</option>
          <option value="routine">Routine</option>
          <option value="priority">Priority</option>
          <option value="emergency">Emergency</option>
        </AdminSelect>
        {filter ? <input type="hidden" name="filter" value={filter} /> : null}
        <button type="submit" className="h-10 bg-ink px-4 text-sm font-semibold text-white">
          Apply
        </button>
      </FilterBar>
      {rows.length === 0 ? (
        <EmptyState
          title="No work orders yet"
          body="Create a work order manually or convert a service request."
          action={
            <Link href="/admin/work-orders/new" className="inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white">
              New Work Order
            </Link>
          }
        />
      ) : (
        <>
          <AdminTable headers={["WO", "Property", "Service", "Client", "Vendor", "Priority", "Status", "Schedule", "Updated"]}>
            {rows.map((row) => {
              const property = unwrap<{ address1?: string; city?: string; state?: string }>(row.properties as never);
              const client = unwrap<{ name?: string }>(row.organizations as never);
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
                  <td className="px-3 py-2">{assignedVendorName(row.work_order_assignments as never)}</td>
                  <td className="px-3 py-2">
                    <PriorityBadge value={row.priority} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge value={row.status} />
                  </td>
                  <td className="px-3 py-2 text-muted">{formatDate(row.scheduled_start ?? row.scheduled_end)}</td>
                  <td className="px-3 py-2 text-muted">{formatDate(row.updated_at)}</td>
                </tr>
              );
            })}
          </AdminTable>
          <Pagination
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={count ?? 0}
            makeHref={(nextPage) => hrefFor({ page: String(nextPage) })}
          />
        </>
      )}
    </div>
  );
}
