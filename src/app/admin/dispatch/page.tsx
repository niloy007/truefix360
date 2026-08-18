import Link from "next/link";
import { PageHeader, PriorityBadge, StatusBadge } from "@/components/admin/ui";
import { assignWorkOrder } from "@/lib/admin/actions";
import { getVendorCandidates, paramValue, unwrap } from "@/lib/admin/queries";
import { formatDate, formatPropertyLine } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDispatchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedId = paramValue(params.workOrderId);
  const service = paramValue(params.service) ?? "";
  const state = paramValue(params.state) ?? "";
  const priority = paramValue(params.priority) ?? "";
  const admin = createAdminClient();

  let query = admin
    .from("work_orders")
    .select("id, reference_number, title, status, priority, service_category, scheduled_start, properties(address1, city, state), organizations:client_organization_id(name)")
    .in("status", ["new", "sourcing", "offered"])
    .order("created_at", { ascending: false })
    .limit(50);
  if (service) query = query.eq("service_category", service);
  if (priority) query = query.eq("priority", priority);
  if (state) query = query.eq("properties.state", state);
  const { data: workOrders } = await query;

  const selected = (workOrders ?? []).find((row) => row.id === selectedId) ?? workOrders?.[0];
  const candidates = selected ? await getVendorCandidates(selected.id) : [];

  async function assign(formData: FormData) {
    "use server";
    await assignWorkOrder(String(formData.get("workOrderId")), String(formData.get("vendorOrganizationId")));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch"
        description="Source vendors for unassigned work using coverage and service data already in TrueFix360."
      />
      <form className="flex flex-wrap gap-2 border border-line bg-white p-3" method="get">
        <input name="service" defaultValue={service} placeholder="Service" className="input-field h-10 py-0 text-sm" />
        <input name="state" defaultValue={state} placeholder="State" className="input-field h-10 py-0 text-sm" />
        <select name="priority" defaultValue={priority} className="input-field h-10 py-0 text-sm">
          <option value="">All priorities</option>
          <option value="routine">Routine</option>
          <option value="priority">Priority</option>
          <option value="emergency">Emergency</option>
        </select>
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Filter</button>
      </form>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="border border-line bg-white">
          <h2 className="border-b border-line px-4 py-3 font-heading text-lg font-semibold">Unassigned work orders</h2>
          <div className="divide-y divide-line">
            {(workOrders ?? []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">No unassigned work orders match these filters.</p>
            ) : (
              (workOrders ?? []).map((row) => {
                const property = unwrap<{ address1?: string; city?: string; state?: string }>(row.properties as never);
                const client = unwrap<{ name?: string }>(row.organizations as never);
                const active = selected?.id === row.id;
                return (
                  <Link
                    key={row.id}
                    href={`/admin/dispatch?workOrderId=${row.id}`}
                    className={`block px-4 py-3 ${active ? "bg-cream" : "hover:bg-cream"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{row.reference_number}</p>
                      <PriorityBadge value={row.priority} />
                    </div>
                    <p className="text-sm text-muted">{formatPropertyLine(property)}</p>
                    <p className="text-sm text-muted">{row.service_category} · {client?.name ?? "Client"} · {formatDate(row.scheduled_start)}</p>
                    <StatusBadge value={row.status} />
                  </Link>
                );
              })
            )}
          </div>
        </section>
        <section className="border border-line bg-white">
          <h2 className="border-b border-line px-4 py-3 font-heading text-lg font-semibold">Vendor matches</h2>
          {!selected ? (
            <p className="px-4 py-6 text-sm text-muted">Select a work order to see vendor candidates.</p>
          ) : (
            <div className="divide-y divide-line">
              {candidates.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted">No vendor profiles are available to match yet.</p>
              ) : (
                candidates.slice(0, 12).map((vendor) => (
                  <div key={vendor.organizationId} className="px-4 py-3">
                    <p className="font-semibold">{vendor.organizationName}</p>
                    <p className="text-sm text-muted">
                      {[vendor.city, vendor.state].filter(Boolean).join(", ")} · {vendor.services.slice(0, 4).join(" • ") || "Services not listed"}
                    </p>
                    <p className="text-sm text-muted">Coverage: {vendor.coverage || "Not specified"}</p>
                    <p className="text-xs text-muted">Status: {vendor.organizationStatus} · Onboarding: {vendor.onboardingStatus || "—"}</p>
                    <form action={assign} className="mt-2">
                      <input type="hidden" name="workOrderId" value={selected.id} />
                      <input type="hidden" name="vendorOrganizationId" value={vendor.organizationId} />
                      <button type="submit" className="h-9 bg-brand px-3 text-sm font-semibold text-white">Assign</button>
                    </form>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
      <CoverageGapsPanel />
    </div>
  );
}

async function CoverageGapsPanel() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("coverage_gaps")
    .select("id, county_name, state_code, service_category, active_request_count, status")
    .in("status", ["open", "sourcing"])
    .order("created_at", { ascending: true })
    .limit(8);
  if (!data?.length) return null;
  return (
    <section className="border border-line bg-white">
      <h2 className="border-b border-line px-4 py-3 font-heading text-lg font-semibold">Coverage gaps</h2>
      <div className="divide-y divide-line">
        {data.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-semibold">{row.county_name}, {row.state_code}</p>
              <p className="text-sm text-muted">{row.service_category} · {row.active_request_count} request{row.active_request_count === 1 ? "" : "s"} · no verified coverage</p>
            </div>
            <Link href="/admin/coverage/gaps" className="text-sm font-semibold text-brand">Source vendor</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
