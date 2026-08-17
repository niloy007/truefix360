import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientPropertiesPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("properties")
    .select("id, address1, city, state, zip, property_type, occupancy_status")
    .eq("client_organization_id", ctx.membership.organizationId);
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Properties</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">
            {row.address1}, {row.city}, {row.state} {row.zip}
          </div>
        ))}
        {(data ?? []).length === 0 ? <p className="px-4 py-6 text-sm text-muted">No properties on file yet.</p> : null}
      </div>
    </div>
  );
}
