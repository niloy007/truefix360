import { uploadVendorDocument } from "@/lib/portal/actions";
import { requireVendorUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorDocumentsPage() {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_documents")
    .select("id, category, original_name, created_at")
    .eq("vendor_organization_id", ctx.membership.organizationId);
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Documents</h1>
      <form action={uploadVendorDocument} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <select name="category" className="input-field">
          <option value="w9">W-9</option>
          <option value="general_liability">General Liability</option>
          <option value="workers_comp">Workers Compensation</option>
          <option value="business_license">Business License</option>
        </select>
        <input name="files" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
        <button className="h-12 bg-brand text-sm font-semibold text-white">Upload</button>
      </form>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">{row.category}: {row.original_name}</div>
        ))}
      </div>
    </div>
  );
}
