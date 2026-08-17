export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (value || "https://truefix360.com").replace(/\/$/, "");
}

export function getPasswordRecoveryRedirectTo(): string {
  return `${getSiteUrl()}/auth/callback?next=/reset-password`;
}

export function getPublicSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getPublicSupabasePublishableKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
}

export function isBrowserSupabaseConfigured(): boolean {
  return Boolean(getPublicSupabaseUrl() && getPublicSupabasePublishableKey());
}

export function getBrowserSupabaseConfigStatus(): "configured" | "missing" {
  return isBrowserSupabaseConfigured() ? "configured" : "missing";
}
