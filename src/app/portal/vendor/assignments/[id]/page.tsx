import { vendorJobAction, submitVendorEstimate, uploadWorkOrderPhoto } from "@/lib/portal/actions";
import { toVendorWorkOrderPayload } from "@/lib/confidentiality";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function VendorAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireVendorUser();
  const { id } = await params;
  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("work_order_assignments")
    .select("*")
    .eq("id", id)
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!assignment) notFound();
  const { data: workOrder } = await admin
    .from("work_orders")
    .select("id, reference_number, service_category, title, priority, status, scheduled_start, scheduled_end, vendor_visible_notes, access_instructions, resident_contact_name, resident_contact_phone, property_id")
    .eq("id", assignment.work_order_id)
    .maybeSingle();
  if (!workOrder) notFound();
  const { data: property } = workOrder.property_id
    ? await admin
        .from("properties")
        .select("address1, address2, city, state, zip, property_type, occupancy_status")
        .eq("id", workOrder.property_id)
        .maybeSingle()
    : { data: null };
  const payload = toVendorWorkOrderPayload({
    ...workOrder,
    properties: property,
  });

  async function run(action: string) {
    "use server";
    await vendorJobAction(id, action);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{payload.referenceNumber}</h1>
      <p className="text-sm">{payload.serviceCategory} · {payload.status}</p>
      {payload.property ? (
        <p className="text-sm">
          {payload.property.address1}, {payload.property.city}, {payload.property.state} {payload.property.zip}
          {payload.mapsUrl ? (
            <> · <a className="font-semibold text-brand" href={payload.mapsUrl}>Directions</a></>
          ) : null}
        </p>
      ) : null}
      <p className="text-sm leading-6">{payload.vendorVisibleNotes}</p>
      <p className="text-sm">Access: {payload.accessInstructions ?? "—"}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <form action={run.bind(null, "accept")}><button className="h-12 w-full bg-brand text-sm font-semibold text-white">Accept</button></form>
        <form action={run.bind(null, "decline")}><button className="h-12 w-full border border-ink text-sm font-semibold">Decline</button></form>
        <form action={run.bind(null, "on_my_way")}><button className="h-12 w-full border border-ink text-sm font-semibold">On My Way</button></form>
        <form action={run.bind(null, "on_site")}><button className="h-12 w-full border border-ink text-sm font-semibold">On Site</button></form>
        <form action={run.bind(null, "complete")}><button className="h-12 w-full border border-ink text-sm font-semibold">Mark Work Complete</button></form>
      </div>
      <form action={uploadWorkOrderPhoto} className="grid gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Job photos</h2>
        <input type="hidden" name="workOrderId" value={assignment.work_order_id} />
        <select name="category" className="input-field">
          <option value="before">Before</option>
          <option value="during">During</option>
          <option value="after">After</option>
        </select>
        <input name="caption" className="input-field" placeholder="Caption / note" />
        <input name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
        <button className="h-12 bg-brand text-sm font-semibold text-white">Upload photos</button>
      </form>
      <form action={submitVendorEstimate} className="grid gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Submit estimate</h2>
        <input type="hidden" name="workOrderId" value={assignment.work_order_id} />
        <input name="amount" type="number" step="0.01" required className="input-field" placeholder="Amount" />
        <textarea name="description" required className="input-field" rows={4} placeholder="Description" />
        <textarea name="laborMaterial" className="input-field" rows={3} placeholder="Labor / material explanation" />
        <button className="h-12 bg-brand text-sm font-semibold text-white">Submit estimate</button>
      </form>
    </div>
  );
}
