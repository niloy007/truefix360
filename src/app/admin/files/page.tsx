import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminFilesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_order_files")
    .select("id, original_name, category, visibility, created_at, work_order_id")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Files</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((file) => (
          <div key={file.id} className="px-4 py-3 text-sm">
            {file.original_name} · {file.category} · {file.visibility}
          </div>
        ))}
        {(data ?? []).length === 0 ? <p className="px-4 py-6 text-sm text-muted">No work-order files yet.</p> : null}
      </div>
    </div>
  );
}
