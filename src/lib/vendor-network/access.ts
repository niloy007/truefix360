import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/vendor-network/tokens";
import type { NetworkPermission } from "@/lib/vendor-network/permissions";

export type { NetworkPermission } from "@/lib/vendor-network/permissions";
export {
  canManageNetworkEdits,
  canSubmitVendors,
  inactiveLinkMessage,
} from "@/lib/vendor-network/permissions";

export type NetworkLinkAccess =
  | {
      ok: true;
      link: {
        id: string;
        name: string;
        permission: NetworkPermission;
        expiresAt: string | null;
        createdAt: string;
      };
    }
  | {
      ok: false;
      reason: "invalid" | "revoked" | "expired";
    };

export async function resolveNetworkLinkAccess(rawToken: string): Promise<NetworkLinkAccess> {
  const token = (rawToken ?? "").trim();
  if (!token || token.length < 16) {
    return { ok: false, reason: "invalid" };
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(token);
  const { data: link } = await admin
    .from("vendor_network_links")
    .select("id, name, permission, expires_at, revoked_at, created_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!link) {
    return { ok: false, reason: "invalid" };
  }
  if (link.revoked_at) {
    return { ok: false, reason: "revoked" };
  }
  if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  // Best-effort last access stamp; never block access on failure.
  void Promise.resolve(
    admin
      .from("vendor_network_links")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", link.id),
  );

  return {
    ok: true,
    link: {
      id: link.id as string,
      name: link.name as string,
      permission: link.permission as NetworkPermission,
      expiresAt: (link.expires_at as string | null) ?? null,
      createdAt: link.created_at as string,
    },
  };
}
