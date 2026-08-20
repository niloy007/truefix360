import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  ESTIMATE_CLIENT_STATUSES,
  ESTIMATE_REVIEW_STATUSES,
  OPEN_WORK_ORDER_STATUSES,
  PIPELINE_STAGES,
  UNASSIGNED_WORK_ORDER_STATUSES,
} from "@/lib/admin/status";
import { sanitizeSearchTerm, utcDayBounds } from "@/lib/format";

export const ADMIN_PAGE_SIZE = 25;

type Nested = Record<string, unknown> | Record<string, unknown>[] | null | undefined;

export function unwrap<T extends Record<string, unknown>>(value: Nested): T | null {
  if (!value) return null;
  return (Array.isArray(value) ? value[0] : value) as T;
}

export function paramValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

type CountFilter = PromiseLike<{ count: number | null }> & {
  eq: (column: string, value: string) => CountFilter;
  in: (column: string, values: readonly string[]) => CountFilter;
  gte: (column: string, value: string) => CountFilter;
  lt: (column: string, value: string) => CountFilter;
  not: (column: string, operator: string, value: null) => CountFilter;
};

async function countWhere(table: string, apply: (query: CountFilter) => CountFilter): Promise<number> {
  const admin = createAdminClient();
  const selected = admin.from(table).select("id", { count: "exact", head: true });
  const { count } = await apply(selected as unknown as CountFilter);
  return count ?? 0;
}

export async function getInboxBadges() {
  const [contacts, quotes, notifications, vendors] = await Promise.all([
    countWhere("contact_submissions", (q) => q.eq("status", "new")),
    countWhere("quote_requests", (q) => q.eq("status", "new")),
    countWhere("notification_deliveries", (q) => q.in("status", ["pending", "failed"])),
    countWhere("vendor_network_submissions", (q) => q.eq("status", "pending")),
  ]);
  return { contacts, quotes, notifications, vendors };
}

const WORK_ORDER_LIST_SELECT = `
  id,
  reference_number,
  title,
  status,
  priority,
  service_category,
  created_at,
  updated_at,
  scheduled_start,
  scheduled_end,
  properties(address1, city, state, zip),
  organizations:client_organization_id(name),
  work_order_assignments(status, organizations:vendor_organization_id(name))
`;

export async function getDashboardSnapshot() {
  const admin = createAdminClient();
  const { start, end } = utcDayBounds();
  const now = new Date().toISOString();

  const [
    openWorkOrders,
    needsAssignment,
    dueToday,
    overdue,
    emergencyUnassigned,
    estimatesToReview,
    clientApprovals,
    newServiceRequests,
    vendorApplications,
    coverageGaps,
    pipeline,
    attentionWorkOrders,
    reviewEstimates,
    triageRequests,
    recentWorkOrders,
    sourcingQueue,
    recentNotifications,
  ] = await Promise.all([
    countWhere("work_orders", (q) => q.in("status", [...OPEN_WORK_ORDER_STATUSES])),
    countWhere("work_orders", (q) => q.in("status", [...UNASSIGNED_WORK_ORDER_STATUSES])),
    countWhere("work_orders", (q) =>
      q.in("status", [...OPEN_WORK_ORDER_STATUSES]).gte("scheduled_start", start).lt("scheduled_start", end),
    ),
    countWhere("work_orders", (q) =>
      q.in("status", [...OPEN_WORK_ORDER_STATUSES]).not("scheduled_end", "is", null).lt("scheduled_end", now),
    ),
    countWhere("work_orders", (q) =>
      q.in("status", [...UNASSIGNED_WORK_ORDER_STATUSES]).in("priority", ["emergency", "urgent"]),
    ),
    countWhere("estimates", (q) => q.in("status", [...ESTIMATE_REVIEW_STATUSES])),
    countWhere("estimates", (q) => q.in("status", [...ESTIMATE_CLIENT_STATUSES])),
    countWhere("service_requests", (q) => q.eq("status", "submitted")),
    countWhere("vendor_applications", (q) => q.in("status", ["submitted", "reviewing"])),
    countWhere("coverage_gaps", (q) => q.in("status", ["open", "sourcing"])),
    Promise.all(
      PIPELINE_STAGES.map(async (stage) => {
        const count =
          stage.id === "completed_today"
            ? await countWhere("work_orders", (q) =>
                q.eq("status", "completed").gte("updated_at", start).lt("updated_at", end),
              )
            : await countWhere("work_orders", (q) => q.in("status", [...stage.statuses]));
        return { id: stage.id, label: stage.label, count };
      }),
    ),
    admin
      .from("work_orders")
      .select(WORK_ORDER_LIST_SELECT)
      .in("status", [...OPEN_WORK_ORDER_STATUSES])
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("estimates")
      .select("id, reference_number, status, created_at, work_order_id, work_orders(reference_number, title, service_category)")
      .in("status", [...ESTIMATE_REVIEW_STATUSES, ...ESTIMATE_CLIENT_STATUSES])
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("service_requests")
      .select("id, reference_number, issue, status, created_at, service_category, priority, properties(city, state)")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("work_orders")
      .select(WORK_ORDER_LIST_SELECT)
      .order("updated_at", { ascending: false })
      .limit(10),
    admin
      .from("work_orders")
      .select(WORK_ORDER_LIST_SELECT)
      .in("status", [...UNASSIGNED_WORK_ORDER_STATUSES])
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("notification_deliveries")
      .select("id, event_type, status, recipient, attempted_at")
      .order("attempted_at", { ascending: false })
      .limit(8),
  ]);

  return {
    kpis: {
      openWorkOrders,
      needsAssignment,
      dueToday,
      overdue,
      emergencyUnassigned,
      estimatesToReview,
      clientApprovals,
      newServiceRequests,
      vendorApplications,
      coverageGaps,
    },
    pipeline,
    attentionWorkOrders: attentionWorkOrders.data ?? [],
    reviewEstimates: reviewEstimates.data ?? [],
    triageRequests: triageRequests.data ?? [],
    recentWorkOrders: recentWorkOrders.data ?? [],
    sourcingQueue: sourcingQueue.data ?? [],
    recentNotifications: recentNotifications.data ?? [],
  };
}

export type AdminSearchHit = {
  type: "Work order" | "Service request" | "Quote" | "Client" | "Vendor" | "Contact" | "Coverage request";
  id: string;
  href: string;
  title: string;
  subtitle: string;
};

export async function searchAdminRecords(rawQuery: string): Promise<AdminSearchHit[]> {
  const q = sanitizeSearchTerm(rawQuery);
  if (q.length < 2) return [];
  const admin = createAdminClient();
  const like = `%${q}%`;

  const [workOrders, requests, quotes, clients, vendors, contacts, coverageRequests] = await Promise.all([
    admin
      .from("work_orders")
      .select("id, reference_number, title, service_category, properties(address1, city, state)")
      .or(`reference_number.ilike.${like},title.ilike.${like},service_category.ilike.${like}`)
      .limit(5),
    admin
      .from("service_requests")
      .select("id, reference_number, issue, service_category")
      .or(`reference_number.ilike.${like},issue.ilike.${like}`)
      .limit(4),
    admin
      .from("quote_requests")
      .select("id, reference_number, requested_service, company, city, state")
      .or(`reference_number.ilike.${like},company.ilike.${like},requested_service.ilike.${like}`)
      .limit(4),
    admin.from("organizations").select("id, name").eq("type", "client").ilike("name", like).limit(4),
    admin.from("organizations").select("id, name").eq("type", "vendor").ilike("name", like).limit(4),
    admin
      .from("contact_submissions")
      .select("id, reference_number, first_name, last_name, email")
      .or(`reference_number.ilike.${like},email.ilike.${like},first_name.ilike.${like},last_name.ilike.${like}`)
      .limit(4),
    admin
      .from("coverage_requests")
      .select("id, reference_number, county_name, state_code, service_category")
      .or(`reference_number.ilike.${like},county_name.ilike.${like},state_code.ilike.${like}`)
      .limit(4),
  ]);

  const hits: AdminSearchHit[] = [];
  for (const row of workOrders.data ?? []) {
    const property = unwrap<{ address1?: string; city?: string; state?: string }>(row.properties as Nested);
    hits.push({
      type: "Work order",
      id: row.id,
      href: `/admin/work-orders/${row.id}`,
      title: row.reference_number,
      subtitle: [row.title ?? row.service_category, property?.address1, [property?.city, property?.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" · "),
    });
  }
  for (const row of requests.data ?? []) {
    hits.push({
      type: "Service request",
      id: row.id,
      href: `/admin/service-requests/${row.id}`,
      title: row.reference_number,
      subtitle: row.issue ?? row.service_category,
    });
  }
  for (const row of quotes.data ?? []) {
    hits.push({
      type: "Quote",
      id: row.id,
      href: `/admin/quotes/${row.id}`,
      title: row.reference_number,
      subtitle: [row.company, row.requested_service, [row.city, row.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" · "),
    });
  }
  for (const row of clients.data ?? []) {
    hits.push({ type: "Client", id: row.id, href: `/admin/clients/${row.id}`, title: row.name, subtitle: "Client organization" });
  }
  for (const row of vendors.data ?? []) {
    hits.push({ type: "Vendor", id: row.id, href: `/admin/vendors/${row.id}`, title: row.name, subtitle: "Vendor organization" });
  }
  for (const row of contacts.data ?? []) {
    hits.push({
      type: "Contact",
      id: row.id,
      href: `/admin/contacts/${row.id}`,
      title: row.reference_number,
      subtitle: `${row.first_name} ${row.last_name} · ${row.email}`,
    });
  }
  for (const row of coverageRequests.data ?? []) {
    hits.push({
      type: "Coverage request",
      id: row.id,
      href: `/admin/coverage/requests/${row.id}`,
      title: row.reference_number,
      subtitle: `${row.county_name}, ${row.state_code} · ${row.service_category}`,
    });
  }
  return hits.slice(0, 12);
}

export function assignedVendorName(assignments: Nested): string {
  const rows = Array.isArray(assignments) ? assignments : assignments ? [assignments] : [];
  const accepted = rows.find((row) => row.status === "accepted" || row.status === "offered") ?? rows[0];
  const org = unwrap<{ name?: string }>(accepted?.organizations as Nested);
  return org?.name ?? "Unassigned";
}

export async function getVendorCandidates(workOrderId: string) {
  const admin = createAdminClient();
  const { data: workOrder } = await admin
    .from("work_orders")
    .select("id, service_category, properties(state, city)")
    .eq("id", workOrderId)
    .maybeSingle();
  const property = unwrap<{ state?: string; city?: string }>(workOrder?.properties as Nested);
  const { data: vendors } = await admin
    .from("vendor_profiles")
    .select(
      "id, organization_id, legal_name, primary_contact_name, primary_email, coverage, insurance_status, city, state, service_categories, onboarding_status, organizations(id, name, status)",
    )
    .limit(50);

  const service = String(workOrder?.service_category ?? "").toLowerCase();
  const state = String(property?.state ?? "").toLowerCase();

  return (vendors ?? [])
    .map((vendor) => {
      const org = unwrap<{ id: string; name: string; status: string }>(vendor.organizations as Nested);
      const categories = Array.isArray(vendor.service_categories)
        ? vendor.service_categories.map((item) => String(item).toLowerCase())
        : [];
      const coverage = `${vendor.coverage ?? ""} ${vendor.state ?? ""} ${vendor.city ?? ""}`.toLowerCase();
      let score = 0;
      if (org?.status === "active") score += 2;
      if (vendor.onboarding_status === "approved" || vendor.onboarding_status === "active") score += 2;
      if (service && categories.some((item) => item.includes(service) || service.includes(item))) score += 4;
      if (state && (coverage.includes(state) || String(vendor.state ?? "").toLowerCase() === state)) score += 3;
      return {
        organizationId: vendor.organization_id as string,
        organizationName: org?.name ?? vendor.legal_name ?? "Vendor",
        organizationStatus: org?.status ?? "unknown",
        coverage: vendor.coverage as string | null,
        services: categories,
        city: vendor.city as string | null,
        state: vendor.state as string | null,
        insuranceStatus: vendor.insurance_status as string | null,
        onboardingStatus: vendor.onboarding_status as string | null,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export { WORK_ORDER_LIST_SELECT };
