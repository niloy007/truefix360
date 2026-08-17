export const MIN_PASSWORD_LENGTH = 10;

export const AUTH_LINK_ERROR_KINDS = [
  "expired",
  "used",
  "invalid",
  "missing",
  "not_configured",
] as const;

export type AuthLinkErrorKind = (typeof AUTH_LINK_ERROR_KINDS)[number];

export function validateNewPassword(
  password: string,
  confirm: string,
): string | null {
  if (!password) return "Create a password to continue.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function classifyAuthLinkError(
  error?: string | null,
  errorCode?: string | null,
): AuthLinkErrorKind | null {
  const key = `${errorCode ?? ""} ${error ?? ""}`.trim().toLowerCase();
  if (!key) return null;
  if (AUTH_LINK_ERROR_KINDS.includes(key as AuthLinkErrorKind)) {
    return key as AuthLinkErrorKind;
  }
  if (key.includes("expired") || key.includes("otp_expired")) return "expired";
  if (
    key.includes("already") ||
    key.includes("user_already_exists") ||
    key.includes("user_already_registered")
  ) {
    return "used";
  }
  if (
    key.includes("access_denied") ||
    key.includes("invalid") ||
    key.includes("not found") ||
    key.includes("otp_disabled")
  ) {
    return "invalid";
  }
  return "invalid";
}

export function parseAuthLinkErrorParam(
  value?: string | null,
): AuthLinkErrorKind | null {
  if (!value) return null;
  if (AUTH_LINK_ERROR_KINDS.includes(value as AuthLinkErrorKind)) {
    return value as AuthLinkErrorKind;
  }
  return classifyAuthLinkError(value);
}

export function inviteLinkErrorMessage(kind: AuthLinkErrorKind | null): string | null {
  if (!kind) return null;
  switch (kind) {
    case "expired":
      return "This invitation has expired. Ask TrueFix360 to send a new invite.";
    case "used":
      return "This invitation has already been used. Sign in with your password.";
    case "missing":
      return "This invitation session is missing or has expired. Open the invite email again.";
    case "not_configured":
      return "Portal invitations are not configured yet. Contact TrueFix360.";
    default:
      return "This invitation link is invalid. Ask TrueFix360 to send a new invite.";
  }
}

export function resetLinkErrorMessage(kind: AuthLinkErrorKind | null): string | null {
  if (!kind) return null;
  switch (kind) {
    case "expired":
      return "This reset link has expired. Request a new one.";
    case "used":
      return "This reset link has already been used. Request a new one if you still need to change your password.";
    case "missing":
      return "This reset session is missing or has expired. Request a new reset link.";
    case "not_configured":
      return "Password reset is not configured yet.";
    default:
      return "This reset link is invalid. Request a new one.";
  }
}

export const ALLOWED_AUTH_CALLBACK_NEXT = ["/reset-password", "/auth/invite"] as const;

export function safeAuthNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  const path = next.split("?")[0].split("#")[0];
  if ((ALLOWED_AUTH_CALLBACK_NEXT as readonly string[]).includes(path)) return path;
  return fallback;
}
