export const OPEN_WORK_ORDER_STATUSES = [
  "new",
  "sourcing",
  "offered",
  "assigned",
  "scheduled",
  "en_route",
  "on_site",
  "estimate_required",
  "awaiting_client_approval",
  "approved",
  "in_progress",
] as const;

export const CLOSED_WORK_ORDER_STATUSES = ["completed", "cancelled"] as const;

export const UNASSIGNED_WORK_ORDER_STATUSES = ["new", "sourcing", "offered"] as const;

export const EMERGENCY_PRIORITIES = ["emergency", "urgent"] as const;

export const ESTIMATE_REVIEW_STATUSES = ["submitted", "internal_review"] as const;

export const ESTIMATE_CLIENT_STATUSES = ["sent_to_client"] as const;

export const PIPELINE_STAGES = [
  { id: "new", label: "New", statuses: ["new"] },
  { id: "sourcing", label: "Sourcing", statuses: ["sourcing", "offered"] },
  { id: "assigned", label: "Assigned", statuses: ["assigned"] },
  { id: "scheduled", label: "Scheduled", statuses: ["scheduled"] },
  { id: "on_site", label: "On site", statuses: ["en_route", "on_site"] },
  {
    id: "awaiting_approval",
    label: "Awaiting approval",
    statuses: ["estimate_required", "awaiting_client_approval"],
  },
  { id: "completed_today", label: "Completed today", statuses: ["completed"] },
] as const;

const STATUS_TONES: Record<string, "neutral" | "orange" | "blue" | "indigo" | "green" | "red"> = {
  new: "neutral",
  submitted: "neutral",
  reviewing: "orange",
  sourcing: "orange",
  offered: "orange",
  estimate_required: "orange",
  awaiting_client_approval: "orange",
  more_information_needed: "orange",
  contacted: "orange",
  qualified: "orange",
  assigned: "blue",
  scheduled: "blue",
  accepted: "blue",
  en_route: "indigo",
  on_site: "indigo",
  in_progress: "indigo",
  approved: "green",
  completed: "green",
  converted: "green",
  responded: "green",
  sent_to_client: "blue",
  onboarded: "green",
  cancelled: "red",
  declined: "red",
  failed: "red",
  overdue: "red",
  emergency: "red",
  closed: "neutral",
  draft: "neutral",
  withdrawn: "neutral",
};

const PRIORITY_TONES: Record<string, "neutral" | "orange" | "red"> = {
  routine: "neutral",
  standard: "neutral",
  priority: "orange",
  emergency: "red",
  urgent: "red",
};

export function humanizeKey(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function statusTone(value: string): "neutral" | "orange" | "blue" | "indigo" | "green" | "red" {
  return STATUS_TONES[value] ?? "neutral";
}

export function priorityTone(value: string): "neutral" | "orange" | "red" {
  return PRIORITY_TONES[value] ?? "neutral";
}

export function isUnassignedStatus(status: string): boolean {
  return (UNASSIGNED_WORK_ORDER_STATUSES as readonly string[]).includes(status);
}

export function isEmergencyPriority(priority: string | null | undefined): boolean {
  return Boolean(priority && (EMERGENCY_PRIORITIES as readonly string[]).includes(priority));
}

export function isOpenWorkOrderStatus(status: string): boolean {
  return (OPEN_WORK_ORDER_STATUSES as readonly string[]).includes(status);
}

export function pipelineStageForStatus(status: string): string | null {
  const stage = PIPELINE_STAGES.find((item) => item.statuses.includes(status as never));
  return stage?.id ?? null;
}

const EVENT_LABELS: Record<string, string> = {
  created: "Work order created",
  offered: "Offered to vendor",
  assigned: "Vendor assigned",
  accepted: "Vendor accepted assignment",
  declined: "Vendor declined assignment",
  scheduled: "Schedule updated",
  sourcing: "Vendor sourcing started",
  completed: "Work order completed",
  cancelled: "Work order cancelled",
  estimate_submitted: "Vendor estimate submitted",
  estimate_sent: "Estimate sent to client",
};

export function eventLabel(event: string): string {
  return EVENT_LABELS[event] ?? humanizeKey(event);
}

const AUDIT_TEMPLATES: Record<string, string> = {
  "auth.login": "{actor} logged in",
  "auth.first_login": "{actor} completed first login",
  "auth.logout": "{actor} signed out",
  "contact.status_change": "{actor} updated a contact",
  "quote.status_change": "{actor} updated a quote request",
  "quote.converted": "{actor} converted a quote request",
  "vendor_application.status_change": "{actor} updated a vendor application",
  "vendor.approved": "{actor} approved a vendor application",
  "client.invite": "{actor} invited a client user",
  "vendor.invite": "{actor} invited a vendor user",
  "work_order.created": "{actor} created a work order",
  "work_order.assignment": "{actor} assigned a work order",
  "estimate.sent_to_client": "{actor} sent an estimate to the client",
};

export function humanizeAuditAction(
  action: string,
  actorName: string,
  entityId?: string | null,
): string {
  const template = AUDIT_TEMPLATES[action];
  const actor = actorName || "A team member";
  if (template) {
    const sentence = template.replace("{actor}", actor);
    return entityId ? `${sentence}` : sentence;
  }
  return `${actor} recorded ${humanizeKey(action)}`;
}

export const WORK_ORDER_QUICK_FILTERS = [
  { id: "all", label: "All", query: {} },
  { id: "needs-assignment", label: "Needs assignment", query: { filter: "unassigned" } },
  { id: "due-today", label: "Due today", query: { filter: "due-today" } },
  { id: "overdue", label: "Overdue", query: { filter: "overdue" } },
  { id: "estimate-required", label: "Estimate required", query: { status: "estimate_required" } },
  { id: "awaiting-approval", label: "Awaiting approval", query: { status: "awaiting_client_approval" } },
  { id: "completed", label: "Completed", query: { status: "completed" } },
] as const;
