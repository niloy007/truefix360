import "server-only";

import { getSiteUrl } from "@/config/env";
import { getVendorNetworkTokenEncryptionKey } from "@/config/server-env";
import { decryptShareTokenWithKey } from "@/lib/vendor-network/token-crypto-core";
import { buildVendorNetworkUrl } from "@/lib/vendor-network/tokens";
import { shareLinkStatus } from "@/lib/vendors/share-link-status";

/**
 * Admin-only recovery of a Vendor Network share URL from encrypted_token.
 * Returns null for legacy hash-only rows, revoked/expired links, or decrypt failures.
 * Never logs the raw token.
 */
export function recoverAdminShareUrl(
  link: {
    encrypted_token?: string | null;
    revoked_at?: string | null;
    expires_at?: string | null;
  },
  nowMs: number,
): string | null {
  const status = shareLinkStatus(
    {
      revokedAt: link.revoked_at ?? null,
      expiresAt: link.expires_at ?? null,
    },
    nowMs,
  );
  if (status !== "active") return null;
  if (!link.encrypted_token) return null;
  const secret = getVendorNetworkTokenEncryptionKey();
  if (!secret) return null;
  try {
    const raw = decryptShareTokenWithKey(link.encrypted_token, secret);
    return buildVendorNetworkUrl(getSiteUrl(), raw);
  } catch {
    return null;
  }
}
