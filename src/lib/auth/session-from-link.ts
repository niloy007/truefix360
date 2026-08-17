import "server-only";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  classifyAuthLinkError,
  safeAuthNextPath,
  type AuthLinkErrorKind,
} from "@/lib/auth/password";

const OTP_TYPES: EmailOtpType[] = [
  "invite",
  "recovery",
  "email",
  "magiclink",
  "signup",
  "email_change",
];

function isOtpType(value: string): value is EmailOtpType {
  return OTP_TYPES.includes(value as EmailOtpType);
}

export type SessionFromLinkResult =
  | { ok: true }
  | { ok: false; kind: AuthLinkErrorKind };

export async function establishSessionFromCallbackSearch(
  params: URLSearchParams,
): Promise<SessionFromLinkResult> {
  const providerKind = classifyAuthLinkError(
    params.get("error"),
    params.get("error_code"),
  );
  if (params.get("error") || params.get("error_code")) {
    return { ok: false, kind: providerKind ?? "invalid" };
  }

  const supabase = await createServerSupabaseClient();
  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return {
        ok: false,
        kind: classifyAuthLinkError(error.message, error.code) ?? "invalid",
      };
    }
    return { ok: true };
  }

  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  if (tokenHash && type && isOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      return {
        ok: false,
        kind: classifyAuthLinkError(error.message, error.code) ?? "invalid",
      };
    }
    return { ok: true };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return { ok: true };

  return { ok: false, kind: "missing" };
}

export function callbackDestination(params: URLSearchParams, fallback: string): string {
  return safeAuthNextPath(params.get("next"), fallback);
}

export function callbackFailurePath(next: string): string {
  if (next.startsWith("/auth/invite")) return "/auth/invite";
  if (next.startsWith("/reset-password")) return "/reset-password";
  return "/login";
}
