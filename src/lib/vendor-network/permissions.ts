export type NetworkPermission = "viewer" | "contributor" | "manager";

export function canSubmitVendors(permission: NetworkPermission): boolean {
  return permission === "contributor" || permission === "manager";
}

export function canManageNetworkEdits(permission: NetworkPermission): boolean {
  return permission === "manager";
}

export function inactiveLinkMessage(reason: "invalid" | "revoked" | "expired"): string {
  if (reason === "expired") return "This Vendor Network link has expired.";
  if (reason === "revoked") return "This Vendor Network link is no longer active.";
  return "This vendor-network link is no longer active.";
}
