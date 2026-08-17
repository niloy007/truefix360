import { DetailList } from "@/components/app/RecordList";
import { approveVendorApplication, updateVendorApplicationStatus } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

const statuses = ["submitted", "reviewing", "more_information_needed", "approved", "declined", "onboarded"];

export default async function AdminVendorApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("vendor_applications").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <div className="flex flex-wrap gap-3">
        <form action={async (formData) => {
          "use server";
          await updateVendorApplicationStatus(id, String(formData.get("status")));
        }} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Status
            <select name="status" defaultValue={data.status} className="input-field mt-1">
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="h-12 bg-brand px-4 text-sm font-semibold text-white">Save status</button>
        </form>
        <form action={async () => {
          "use server";
          await approveVendorApplication(id);
        }}>
          <button type="submit" className="h-12 border border-ink px-4 text-sm font-semibold">Approve & create vendor organization</button>
        </form>
      </div>
      <DetailList
        rows={[
          ["Company", data.company_name],
          ["Applicant", `${data.first_name} ${data.last_name}`],
          ["Email", data.email],
          ["Phone", data.phone],
          ["Website", data.website],
          ["Address", `${data.address}, ${data.city}, ${data.state} ${data.zip}`],
          ["Business type", data.business_type],
          ["Years", data.years_in_business],
          ["Crews", data.crew_count],
          ["Insurance", data.insurance_status],
          ["Workers comp", data.workers_comp_status],
          ["Services", (data.services ?? []).join(", ")],
          ["States covered", data.states_covered],
          ["Counties / cities", data.counties_cities],
          ["Travel radius", data.travel_radius],
          ["Willing to travel", data.willing_to_travel],
          ["Trip charge", data.trip_charge_required],
          ["Hours", data.normal_hours],
          ["Emergency", data.emergency_availability],
          ["Weekend", data.weekend_availability],
          ["Experience", data.experience],
          ["Submitted", formatDateTime(data.created_at)],
        ]}
      />
    </div>
  );
}
