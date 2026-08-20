import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";

export function deriveVendorNetworkKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

/** Format: base64url(iv).base64url(ciphertext).base64url(tag) */
export function encryptShareTokenWithKey(rawToken: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, deriveVendorNetworkKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(rawToken, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, encrypted, tag].map((buf) => buf.toString("base64url")).join(".");
}

export function decryptShareTokenWithKey(payload: string, secret: string): string {
  const parts = payload.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted share token payload.");
  }
  const [ivB64, dataB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const decipher = createDecipheriv(ALGO, deriveVendorNetworkKey(secret), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
