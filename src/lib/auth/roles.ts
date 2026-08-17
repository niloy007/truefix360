import {
  CLIENT_ROLES,
  INTERNAL_ROLES,
  VENDOR_ROLES,
  homePathForRole,
  type AppRole,
} from "@/config/platform";

export type Membership = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationType: "internal" | "client" | "vendor";
  role: AppRole;
  status: string;
};

export function isInternalRole(role: AppRole): boolean {
  return INTERNAL_ROLES.includes(role);
}

export function isClientRole(role: AppRole): boolean {
  return CLIENT_ROLES.includes(role);
}

export function isVendorRole(role: AppRole): boolean {
  return VENDOR_ROLES.includes(role);
}

export function resolveHomePath(memberships: Membership[]): string {
  const active = memberships.filter((item) => item.status === "active");
  const internal = active.find((item) => isInternalRole(item.role));
  if (internal) return homePathForRole(internal.role);
  const types = new Set(active.map((item) => item.organizationType));
  if (types.size > 1) return "/portal/select";
  const first = active[0];
  if (!first) return "/login";
  return homePathForRole(first.role);
}
