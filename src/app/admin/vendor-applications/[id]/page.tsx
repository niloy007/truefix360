import { DetailList } from "@/components/app/RecordList";
import { approveVendorApplication, updateVendorApplicationStatus } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import {
  EMERGENCY_OPTIONS,
  WEEKEND_OPTIONS,
  YES_NO_DEPENDS,
  formatChoiceLabel,
  parseCoveragePayload,
  stateName,
} from "@/lib/vendor-application/coverage";

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
  const coverageGroups = parseCoveragePayload(data.states_covered ?? "", data.counties_cities ?? "");

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
          ["Experience", data.experience],
          ["Submitted", formatDateTime(data.created_at)],
        ]}
      />
      <section className="space-y-4 border border-line bg-white p-4 sm:p-5">
        <h2 className="font-heading text-xl font-semibold">Coverage</h2>
        {coverageGroups.length === 0 ? (
          <p className="text-sm text-muted">No structured coverage was provided.</p>
        ) : (
          coverageGroups.map((group) => (
            <div key={group.state} className="grid gap-2 border-t border-line pt-4">
              <h3 className="font-semibold uppercase tracking-wide">{stateName(group.state)}</h3>
              <p className="text-sm">
                <span className="text-muted">Counties: </span>
                {group.allCounties
                  ? "All counties claimed (unverified statewide claim — not published as public coverage)"
                  : group.counties.join(", ") || "—"}
              </p>
              <p className="text-sm">
                <span className="text-muted">Cities / Service Areas: </span>
                {group.cities.join(", ") || "—"}
              </p>
              <p className="text-sm">
                <span className="text-muted">Additional Nearby Areas: </span>
                {group.nearbyAreas ? "Yes" : "No"}
              </p>
            </div>
          ))
        )}
        <p className="text-sm">
          <span className="text-muted">Travel Radius: </span>
          {data.travel_radius ? `${data.travel_radius} miles` : "—"}
        </p>
        <p className="text-sm">
          <span className="text-muted">Willing to travel: </span>
          {formatChoiceLabel(data.willing_to_travel ?? "", YES_NO_DEPENDS)}
        </p>
        <p className="text-sm">
          <span className="text-muted">Trip charge: </span>
          {formatChoiceLabel(data.trip_charge_required ?? "", YES_NO_DEPENDS)}
        </p>
      </section>
      <section className="space-y-3 border border-line bg-white p-4 sm:p-5">
        <h2 className="font-heading text-xl font-semibold">Availability</h2>
        <p className="text-sm">
          <span className="text-muted">Business Hours: </span>
          {data.normal_hours || "—"}
        </p>
        <p className="text-sm">
          <span className="text-muted">Emergency Availability: </span>
          {formatChoiceLabel(data.emergency_availability ?? "", EMERGENCY_OPTIONS)}
        </p>
        <p className="text-sm">
          <span className="text-muted">Weekend Availability: </span>
          {formatChoiceLabel(data.weekend_availability ?? "", WEEKEND_OPTIONS)}
        </p>
      </section>
    </div>
  );
}
