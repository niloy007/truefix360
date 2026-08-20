import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { VendorForm } from "@/components/vendors/VendorForm";
import { updateVendorAction } from "@/lib/vendors/actions";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id, name, vendor_profiles(*)")
    .eq("id", id)
    .eq("type", "vendor")
    .maybeSingle();
  if (!org) notFound();
  const profileRaw = org.vendor_profiles;
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
  if (!profile) notFound();

  const boundUpdate = updateVendorAction.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${org.name}`}
        description="Update vendor details, coverage, availability, and shared-network visibility."
        actions={
          <Link
            href={`/admin/vendors/${id}`}
            className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold"
          >
            Back to profile
          </Link>
        }
      />
      <VendorForm
        mode="edit"
        submitLabel="Save Vendor"
        cancelHref={`/admin/vendors/${id}`}
        action={boundUpdate}
        initial={{
          companyName: org.name,
          contactName: profile.primary_contact_name ?? "",
          phone: profile.primary_phone ?? "",
          alternatePhone: profile.alternate_phone ?? "",
          email: profile.primary_email ?? "",
          website: profile.website ?? "",
          address: profile.address ?? "",
          city: profile.city ?? "",
          state: profile.state ?? "",
          zip: profile.zip ?? "",
          services: profile.service_categories ?? [],
          coverageStates: profile.coverage_states ?? [],
          coverageCounties: profile.coverage_counties ?? [],
          coverageCities: profile.coverage_cities ?? [],
          coverageZips: profile.coverage_zips ?? [],
          serviceRadiusMiles: profile.service_radius_miles,
          homeZip: profile.home_zip ?? "",
          tripFeeEnabled: Boolean(profile.trip_fee_enabled),
          tripFeeAmount: profile.trip_fee_amount,
          tripFeeNotes: profile.trip_fee_notes ?? "",
          standardAvailability: profile.standard_availability ?? "",
          emergencyAvailable: Boolean(profile.emergency_available),
          afterHoursAvailable: Boolean(profile.after_hours_available),
          weekendAvailable: Boolean(profile.weekend_available),
          licenseNumber: profile.license_number ?? "",
          licenseState: profile.license_state ?? "",
          licenseExpiresOn: profile.license_expires_on ?? "",
          insuranceStatus: profile.insurance_status ?? "",
          insuranceExpiresOn: profile.insurance_expires_on ?? "",
          w9Status: profile.w9_status ?? "",
          preferred: Boolean(profile.preferred),
          vendorStatus: profile.vendor_status ?? "active",
          sharedNetworkVisible: Boolean(profile.shared_network_visible),
          internalNotes: profile.internal_notes ?? "",
          publicNotes: profile.public_notes ?? "",
        }}
      />
    </div>
  );
}
