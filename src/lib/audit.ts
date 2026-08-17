import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function writeAuditLog(entry: {
  actorUserId?: string | null;
  organizationId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const metadata = entry.metadata ?? {};
  const safe = JSON.parse(
    JSON.stringify(metadata, (key, value) => {
      const lowered = key.toLowerCase();
      if (
        lowered.includes("password") ||
        lowered.includes("token") ||
        lowered.includes("secret") ||
        lowered.includes("authorization")
      ) {
        return undefined;
      }
      return value;
    }),
  ) as Record<string, unknown>;

  await admin.from("audit_logs").insert({
    actor_user_id: entry.actorUserId ?? null,
    organization_id: entry.organizationId ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: safe,
  });
}
