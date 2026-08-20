import "server-only";

import { getVendorNetworkTokenEncryptionKey } from "@/config/server-env";
import {
  decryptShareTokenWithKey,
  encryptShareTokenWithKey,
} from "@/lib/vendor-network/token-crypto-core";

function requireKey(): string {
  const raw = getVendorNetworkTokenEncryptionKey();
  if (!raw) {
    throw new Error(
      "VENDOR_NETWORK_TOKEN_ENCRYPTION_KEY is not configured. Add a 32+ character secret to encrypt share tokens.",
    );
  }
  return raw;
}

/** Format: base64url(iv).base64url(ciphertext).base64url(tag) */
export function encryptShareToken(rawToken: string): string {
  return encryptShareTokenWithKey(rawToken, requireKey());
}

export function decryptShareToken(payload: string): string {
  return decryptShareTokenWithKey(payload, requireKey());
}

export function isVendorNetworkEncryptionConfigured(): boolean {
  return Boolean(getVendorNetworkTokenEncryptionKey());
}
