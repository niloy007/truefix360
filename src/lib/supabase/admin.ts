import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseUrl } from "@/config/public-env";
import { getServiceRoleKey } from "@/config/server-env";

export function createAdminClient() {
  const url = getPublicSupabaseUrl();
  const key = getServiceRoleKey();
  if (!url || !key) {
    throw new Error("Supabase service role is not configured.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
