import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS = 8;

export async function enforceRateLimit(kind: string, identity: string): Promise<void> {
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS).toISOString();
  const bucketKey = createHash("sha256").update(`${kind}:${identity.toLowerCase()}`).digest("hex");
  const admin = createAdminClient();

  const { data } = await admin
    .from("form_rate_limits")
    .select("hit_count")
    .eq("bucket_key", bucketKey)
    .eq("window_start", windowStart)
    .maybeSingle();

  if ((data?.hit_count ?? 0) >= MAX_HITS) {
    throw new RateLimitError();
  }

  if (data) {
    await admin
      .from("form_rate_limits")
      .update({ hit_count: data.hit_count + 1 })
      .eq("bucket_key", bucketKey)
      .eq("window_start", windowStart);
    return;
  }

  await admin.from("form_rate_limits").insert({
    bucket_key: bucketKey,
    window_start: windowStart,
    hit_count: 1,
  });
}

export class RateLimitError extends Error {
  constructor() {
    super("Please wait before submitting again.");
    this.name = "RateLimitError";
  }
}

export async function findIdempotent(key: string | null) {
  if (!key) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("form_idempotency")
    .select("entity_type, entity_id")
    .eq("key", key)
    .maybeSingle();
  return data;
}

export async function saveIdempotent(key: string | null, entityType: string, entityId: string) {
  if (!key) return;
  const admin = createAdminClient();
  await admin.from("form_idempotency").upsert({
    key,
    entity_type: entityType,
    entity_id: entityId,
  });
}

export { isHoneypotTriggered } from "@/lib/forms/spam";
