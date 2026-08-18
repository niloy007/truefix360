import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTabs } from "@/components/admin/tabs";
import { InternalOnly, PageHeader, PriorityBadge, StatusBadge } from "@/components/admin/ui";
import { assignWorkOrder, updateWorkOrderSchedule } from "@/lib/admin/actions";
import { assignedVendorName, unwrap } from "@/lib/admin/queries";
import { eventLabel, humanizeKey } from "@/lib/admin/status";
import { formatDateTime, formatPropertyLine, formatRelativeTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminWorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_orders")
    .select(
      "*, properties(*), organizations:client_organization_id(name), work_order_assignments(status, organizations:vendor_organization_id(id, name))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const [{ data: events }, { data: estimates }, { data: files }, { data: vendors }] = await Promise.all([
    admin.from("work_order_events").select("*").eq("work_order_id", id).order("created_at", { ascending: false }).limit(50),
    admin.from("estimates").select("*").eq("work_order_id", id).order("created_at", { ascending: false }),
    admin.from("work_order_files").select("*").eq("work_order_id", id).order("created_at", { ascending: false }).limit(40),
    admin.from("organizations").select("id, name").eq("type", "vendor").eq("status", "active").order("name"),
  ]);

  const property = unwrap<Record<string, string | null>>(data.properties as never);
  const client = unwrap<{ name?: string }>(data.organizations as never);
  const vendorName = assignedVendorName(data.work_order_assignments as never);
  const toLocal = (value: string | null) => (value ? value.slice(0, 16) : "");

  async function assign(formData: FormData) {
    "use server";
    await assignWorkOrder(id, String(formData.get("vendorOrganizationId")));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.reference_number}
        description={data.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <PriorityBadge value={data.priority} />
            <StatusBadge value={data.status} />
            <Link href="/admin/dispatch" className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold">
              Dispatch
            </Link>
          </div>
        }
      />
      <p className="text-sm text-muted">{formatPropertyLine(property)} · {client?.name ?? "Client"}</p>
      <AdminTabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4 border border-line bg-white p-4 text-sm">
                  <p><span className="text-muted">Service:</span> {data.service_category}</p>
                  <p><span className="text-muted">Scope:</span> {data.scope || "—"}</p>
                  <p><span className="text-muted">Occupancy:</span> {property?.occupancy_status || "—"}</p>
                  <p><span className="text-muted">Client reference:</span> {data.client_reference || "—"}</p>
                  <p><span className="text-muted">Access:</span> {data.access_instructions || "—"}</p>
                  <p><span className="text-muted">Resident:</span> {data.resident_contact_name || "—"} {data.resident_contact_phone || ""}</p>
                  <InternalOnly>
                    <p>Client NTE: {data.client_nte ?? "—"}</p>
                    <p className="mt-2 whitespace-pre-wrap">Internal notes: {data.internal_notes || "—"}</p>
                    <p className="mt-2">Vendor-visible notes: {data.vendor_visible_notes || "—"}</p>
                  </InternalOnly>
                </div>
                <div className="space-y-4">
                  <div className="border border-line bg-white p-4">
                    <h2 className="font-heading text-lg font-semibold">Assigned vendor</h2>
                    <p className="mt-2 text-sm">{vendorName}</p>
                    <form action={assign} className="mt-3 grid gap-2">
                      <select name="vendorOrganizationId" className="input-field" required>
                        <option value="">Select vendor</option>
                        {(vendors ?? []).map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                        ))}
                      </select>
                      <button type="submit" className="h-10 bg-brand text-sm font-semibold text-white">Assign vendor</button>
                    </form>
                  </div>
                  <div className="border border-line bg-white p-4">
                    <h2 className="font-heading text-lg font-semibold">Schedule</h2>
                    <form action={updateWorkOrderSchedule} className="mt-3 grid gap-2">
                      <input type="hidden" name="workOrderId" value={id} />
                      <input name="scheduledStart" type="datetime-local" defaultValue={toLocal(data.scheduled_start)} className="input-field" />
                      <input name="scheduledEnd" type="datetime-local" defaultValue={toLocal(data.scheduled_end)} className="input-field" />
                      <button type="submit" className="h-10 border border-ink text-sm font-semibold">Update schedule</button>
                    </form>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "timeline",
            label: "Timeline",
            content: (
              <ol className="space-y-3 border border-line bg-white p-4">
                {(events ?? []).length === 0 ? <p className="text-sm text-muted">No events yet.</p> : (events ?? []).map((event) => (
                  <li key={event.id} className="border-l-2 border-brand pl-3 text-sm">
                    <p className="font-semibold">{eventLabel(event.event)}</p>
                    <p className="text-muted">{formatDateTime(event.created_at)} · {formatRelativeTime(event.created_at)}</p>
                    {event.note ? <p>{event.note}</p> : null}
                  </li>
                ))}
              </ol>
            ),
          },
          {
            id: "vendor",
            label: "Vendor",
            content: (
              <div className="border border-line bg-white p-4 text-sm">
                <p>Current assignment: {vendorName}</p>
                <p className="mt-2 text-muted">Use Assign vendor to offer this job. Client NTE stays internal.</p>
              </div>
            ),
          },
          {
            id: "estimate",
            label: "Estimate",
            content: (
              <div className="divide-y divide-line border border-line bg-white">
                {(estimates ?? []).length === 0 ? <p className="px-4 py-6 text-sm text-muted">No estimates yet.</p> : (estimates ?? []).map((estimate) => (
                  <Link key={estimate.id} href={`/admin/estimates/${estimate.id}`} className="block px-4 py-3 text-sm hover:bg-cream">
                    <span className="font-semibold">{estimate.reference_number}</span>
                    <span className="mt-1 block text-muted">Vendor {estimate.amount ?? "—"} · Client {estimate.client_sell_amount ?? "—"} · {humanizeKey(estimate.status)}</span>
                  </Link>
                ))}
              </div>
            ),
          },
          {
            id: "photos",
            label: "Photos",
            content: (
              <ul className="border border-line bg-white p-4 text-sm">
                {(files ?? []).filter((file) => String(file.mime_type ?? "").startsWith("image/")).map((file) => (
                  <li key={file.id}>{file.original_name} · {file.category}</li>
                ))}
                {(files ?? []).filter((file) => String(file.mime_type ?? "").startsWith("image/")).length === 0 ? <li className="text-muted">No photos uploaded.</li> : null}
              </ul>
            ),
          },
          {
            id: "documents",
            label: "Documents",
            content: (
              <ul className="border border-line bg-white p-4 text-sm">
                {(files ?? []).length === 0 ? <li className="text-muted">No documents yet.</li> : (files ?? []).map((file) => (
                  <li key={file.id}>{file.original_name} · {file.visibility}</li>
                ))}
              </ul>
            ),
          },
          {
            id: "client",
            label: "Client updates",
            content: <p className="border border-line bg-white p-4 text-sm">{data.client_visible_notes || "No client-facing updates yet."}</p>,
          },
          {
            id: "notes",
            label: "Internal notes",
            content: (
              <InternalOnly>
                <p className="whitespace-pre-wrap">{data.internal_notes || "No internal notes."}</p>
              </InternalOnly>
            ),
          },
        ]}
      />
    </div>
  );
}
