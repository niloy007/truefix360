import { EmptyState, FilterBar, AdminInput, AdminSelect, PageHeader } from "@/components/admin/ui";
import { humanizeAuditAction } from "@/lib/admin/status";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; q?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at, actor_user_id, profiles:actor_user_id(display_name, first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(150);
  if (params.action) query = query.eq("action", params.action);
  if (params.entity) query = query.eq("entity_type", params.entity);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Human-readable activity first. Original action, entity, and metadata remain available." />
      <FilterBar>
        <AdminInput name="action" defaultValue={params.action} placeholder="Action" />
        <AdminSelect name="entity" defaultValue={params.entity ?? ""}>
          <option value="">All entities</option>
          {["work_orders", "estimates", "quote_requests", "contact_submissions", "vendor_applications", "profiles"].map((entity) => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </AdminSelect>
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Filter</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No audit events yet" body="Staff activity will appear here as the team works." />
      ) : (
        <div className="divide-y divide-line border border-line bg-white">
          {(data ?? []).map((row) => {
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            const actor = profile?.display_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "A team member";
            return (
              <details key={row.id} className="px-4 py-3 text-sm">
                <summary className="cursor-pointer list-none">
                  <p className="font-semibold">{humanizeAuditAction(row.action, actor, row.entity_id)}</p>
                  <p className="text-muted">{formatDateTime(row.created_at)}</p>
                </summary>
                <dl className="mt-3 grid gap-1 text-muted">
                  <div>Raw action: {row.action}</div>
                  <div>Entity: {row.entity_type} {row.entity_id ?? ""}</div>
                  <div>UTC: {row.created_at}</div>
                  <div>Metadata: {JSON.stringify(row.metadata ?? {})}</div>
                </dl>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
