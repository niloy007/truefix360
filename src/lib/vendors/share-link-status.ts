export function shareLinkStatus(
  link: { revokedAt: string | null; expiresAt: string | null },
  nowMs: number,
): "active" | "revoked" | "expired" {
  if (link.revokedAt) return "revoked";
  if (link.expiresAt && new Date(link.expiresAt).getTime() <= nowMs) return "expired";
  return "active";
}
