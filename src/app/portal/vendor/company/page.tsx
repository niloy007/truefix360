import { updateVendorCompany } from "@/lib/portal/actions";
import { stripVendorProfileForVendor } from "@/lib/confidentiality";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorCompanyPage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_profiles")
    .select("legal_name, primary_phone, primary_email, coverage, service_categories")
    .eq("organization_id", ctx.membership.organizationId)
    .maybeSingle();
  const profile = data ? stripVendorProfileForVendor(data) : null;
  return (
    <form action={updateVendorCompany} className="grid max-w-xl gap-3">
      <h1 className="font-heading text-3xl font-semibold">Company</h1>
      <p className="text-sm">{profile?.legal_name ?? ctx.membership.organizationName}</p>
      <input name="phone" defaultValue={profile?.primary_phone ?? ""} className="input-field" placeholder="Phone" />
      <input name="email" defaultValue={profile?.primary_email ?? ""} className="input-field" placeholder="Email" />
      <input name="coverage" defaultValue={profile?.coverage ?? ""} className="input-field" placeholder="Coverage" />
      <input name="services" defaultValue={(profile?.service_categories ?? []).join(", ")} className="input-field" placeholder="Services" />
      <button className="h-12 bg-brand text-sm font-semibold text-white">Save</button>
    </form>
  );
}
