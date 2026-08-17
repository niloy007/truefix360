import { stripVendorProfileForVendor } from "@/lib/confidentiality";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorCoveragePage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_profiles")
    .select("coverage, service_categories, city, state")
    .eq("organization_id", ctx.membership.organizationId)
    .maybeSingle();
  const profile = data ? stripVendorProfileForVendor(data) : null;
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Coverage</h1>
      <p className="text-sm">{profile?.coverage || "No coverage details on file."}</p>
      <p className="text-sm">{(profile?.service_categories ?? []).join(", ")}</p>
    </div>
  );
}
