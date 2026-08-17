import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientFilesPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("work_orders")
    .select("id")
    .eq("client_organization_id", ctx.membership.organizationId);
  const ids = (orders ?? []).map((row) => row.id);
  const { data } = ids.length
    ? await admin.from("work_order_files").select("id, original_name, category").in("work_order_id", ids).in("visibility", ["client", "shared"])
    : { data: [] };
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Files</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((file) => (
          <div key={file.id} className="px-4 py-3 text-sm">{file.category}: {file.original_name}</div>
        ))}
        {(data ?? []).length === 0 ? <p className="px-4 py-6 text-sm text-muted">No client-visible files yet.</p> : null}
      </div>
    </div>
  );
}
