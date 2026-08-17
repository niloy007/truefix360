import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminAuditPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, actor_user_id")
    .order("created_at", { ascending: false })
    .limit(150);
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Audit</h1>
      <div className="divide-y divide-line border border-line bg-white">
        {(data ?? []).map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">
            {row.action} · {row.entity_type} · {formatDateTime(row.created_at)}
          </div>
        ))}
      </div>
    </div>
  );
}
