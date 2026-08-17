import { describe, expect, it } from "vitest";
import {
  getBrowserSupabaseConfigStatus,
  getPasswordRecoveryRedirectTo,
  getSiteUrl,
  isBrowserSupabaseConfigured,
} from "@/config/public-env";

describe("public env config", () => {
  it("detects browser Supabase config from static NEXT_PUBLIC variables", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    expect(isBrowserSupabaseConfigured()).toBe(true);
    expect(getBrowserSupabaseConfigStatus()).toBe("configured");
  });

  it("reports missing browser config when public keys are absent", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(isBrowserSupabaseConfigured()).toBe(false);
    expect(getBrowserSupabaseConfigStatus()).toBe("missing");
  });

  it("does not require the service role key for browser config", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(isBrowserSupabaseConfigured()).toBe(true);
  });

  it("builds recovery redirectTo from NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(getPasswordRecoveryRedirectTo()).toBe(
      "http://localhost:3000/auth/callback?next=/reset-password",
    );
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
