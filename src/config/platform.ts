/** Well-known TrueFix360 internal organization. Not a user identity. */
export const INTERNAL_ORGANIZATION_ID =
  "a0000000-0000-4000-8000-000000000001";

export const INTERNAL_ORGANIZATION_NAME = "TrueFix360";

export const APP_ROLES = [
  "admin",
  "staff",
  "client",
  "vendor_admin",
  "crew",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const INTERNAL_ROLES: AppRole[] = ["admin", "staff"];
export const CLIENT_ROLES: AppRole[] = ["client"];
export const VENDOR_ROLES: AppRole[] = ["vendor_admin", "crew"];

export function homePathForRole(role: AppRole): string {
  if (INTERNAL_ROLES.includes(role)) return "/admin";
  if (CLIENT_ROLES.includes(role)) return "/portal/client";
  return "/portal/vendor";
}

export const STORAGE_BUCKETS = {
  quoteAttachments: "quote-attachments",
  vendorDocuments: "vendor-documents",
  workOrderFiles: "work-order-files",
} as const;

export const MAX_PUBLIC_UPLOAD_FILES = 5;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
