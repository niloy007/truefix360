import { createBrowserClient } from "@supabase/ssr";
import { isBrowserSupabaseConfigured } from "@/config/public-env";

export function createBrowserSupabaseClient() {
  if (!isBrowserSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
