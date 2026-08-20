import { createHash, randomBytes } from "node:crypto";

export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function buildVendorNetworkPath(rawToken: string): string {
  return `/vendor-network/${encodeURIComponent(rawToken)}`;
}

export function buildVendorNetworkUrl(siteUrl: string, rawToken: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${buildVendorNetworkPath(rawToken)}`;
}
