import { APP_ROLES, type AppRole } from "@/config/platform";

export type MembershipStatus = "invited" | "active" | "disabled";

export function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as readonly string[]).includes(value);
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type InviteDuplicateKind = "active" | "pending" | null;

export function classifyInviteDuplicate(input: {
  email: string;
  memberships: Array<{ status: string; email?: string | null }>;
  pendingInvitations: Array<{ email: string; status: string }>;
}): InviteDuplicateKind {
  const email = normalizeInviteEmail(input.email);
  const hasActive = input.memberships.some(
    (row) =>
      normalizeInviteEmail(row.email ?? "") === email && row.status === "active",
  );
  if (hasActive) return "active";

  const hasPendingMembership = input.memberships.some(
    (row) =>
      normalizeInviteEmail(row.email ?? "") === email && row.status === "invited",
  );
  const hasPendingInvite = input.pendingInvitations.some(
    (row) => normalizeInviteEmail(row.email) === email && row.status === "pending",
  );
  if (hasPendingMembership || hasPendingInvite) return "pending";
  return null;
}

export function inviteDuplicateMessage(kind: InviteDuplicateKind): string | null {
  if (kind === "active") return "This email already belongs to an active user.";
  if (kind === "pending") {
    return "This user already has a pending invitation. You can resend it from the user list.";
  }
  return null;
}

/** Prevent removing the last active platform admin (TrueFix360 internal admin role). */
export function wouldRemoveLastActiveAdmin(input: {
  targetRole: string;
  targetStatus: string;
  activeAdminCount: number;
}): boolean {
  if (input.targetRole !== "admin") return false;
  if (input.targetStatus !== "active") return false;
  return input.activeAdminCount <= 1;
}

export function canRemoveMembership(input: {
  actorUserId: string;
  targetUserId: string;
  targetRole: string;
  targetStatus: string;
  activeAdminCount: number;
}): { ok: true } | { ok: false; error: string } {
  if (input.actorUserId === input.targetUserId) {
    return { ok: false, error: "You cannot remove your own account." };
  }
  if (
    wouldRemoveLastActiveAdmin({
      targetRole: input.targetRole,
      targetStatus: input.targetStatus,
      activeAdminCount: input.activeAdminCount,
    })
  ) {
    return { ok: false, error: "At least one active administrator must remain." };
  }
  return { ok: true };
}

export function safeLoginNextPath(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}
