import { DetailList } from "@/components/app/RecordList";
import { assignWorkOrder } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function AdminWorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("work_orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const { data: vendors } = await admin
    .from("organizations")
    .select("id, name")
    .eq("type", "vendor")
    .eq("status", "active");
  const { data: events } = await admin
    .from("work_order_events")
    .select("id, event, visibility, created_at, note")
    .eq("work_order_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <form action={async (formData) => {
        "use server";
        await assignWorkOrder(id, String(formData.get("vendorOrganizationId")));
      }} className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Offer to vendor
          <select name="vendorOrganizationId" className="input-field mt-1" required>
            <option value="">Select vendor</option>
            {(vendors ?? []).map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-12 bg-brand px-4 text-sm font-semibold text-white">Offer job</button>
      </form>
      <DetailList
        rows={[
          ["Title", data.title],
          ["Status", data.status],
          ["Scope", data.scope],
          ["Client NTE", data.client_nte],
          ["Internal notes", data.internal_notes],
          ["Vendor-visible notes", data.vendor_visible_notes],
          ["Client-visible notes", data.client_visible_notes],
        ]}
      />
      <section>
        <h2 className="font-heading text-xl font-semibold">Timeline</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(events ?? []).map((event) => (
            <li key={event.id}>{event.event} · {event.visibility}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
