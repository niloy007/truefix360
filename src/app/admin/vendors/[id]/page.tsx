import { DetailList } from "@/components/app/RecordList";
import { inviteUserAction } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/config/platform";
import { createSignedUrl } from "@/lib/storage";
import { notFound } from "next/navigation";

export default async function AdminVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("organizations").select("*").eq("id", id).eq("type", "vendor").maybeSingle();
  if (!data) notFound();
  const { data: profile } = await admin.from("vendor_profiles").select("*").eq("organization_id", id).maybeSingle();
  const { data: docs } = await admin.from("vendor_documents").select("*").eq("vendor_organization_id", id);
  const signed = await Promise.all(
    (docs ?? []).map(async (doc) => ({
      ...doc,
      url: await createSignedUrl(STORAGE_BUCKETS.vendorDocuments, doc.storage_path, 300),
    })),
  );
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.name}</h1>
      <DetailList
        rows={[
          ["Legal name", profile?.legal_name],
          ["Contact", profile?.primary_contact_name],
          ["Email", profile?.primary_email],
          ["Coverage", profile?.coverage],
          ["Insurance", profile?.insurance_status],
          ["Internal notes", profile?.internal_notes],
        ]}
      />
      <section>
        <h2 className="font-heading text-xl font-semibold">Documents</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {signed.map((doc) => (
            <li key={doc.id}>
              {doc.category}: {doc.url ? <a className="font-semibold text-brand" href={doc.url}>{doc.original_name}</a> : doc.original_name}
            </li>
          ))}
        </ul>
      </section>
      <form action={inviteUserAction} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Invite vendor user</h2>
        <input type="hidden" name="organizationId" value={id} />
        <select name="role" className="input-field">
          <option value="vendor_admin">Vendor admin</option>
          <option value="crew">Crew</option>
        </select>
        <input name="firstName" className="input-field" placeholder="First name" />
        <input name="lastName" className="input-field" placeholder="Last name" />
        <input name="email" type="email" required className="input-field" placeholder="Email" />
        <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">Send invitation</button>
      </form>
    </div>
  );
}
