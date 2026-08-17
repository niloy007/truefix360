import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getPublicSupabasePublishableKey,
  getPublicSupabaseUrl,
  isBrowserSupabaseConfigured,
} from "@/config/public-env";

export async function createServerSupabaseClient() {
  if (!isBrowserSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const url = getPublicSupabaseUrl();
  const key = getPublicSupabasePublishableKey();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always persist cookies; proxy.ts handles refresh.
        }
      },
    },
  });
}
