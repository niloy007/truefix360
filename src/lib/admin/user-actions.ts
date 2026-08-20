"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/config/env";
import { type AppRole } from "@/config/platform";
import { writeAuditLog } from "@/lib/audit";
import { requireInternalStaff } from "@/lib/auth/guards";
import { humanizeKey } from "@/lib/admin/status";
import {
  canRemoveMembership,
  classifyInviteDuplicate,
  inviteDuplicateMessage,
  isAppRole,
  normalizeInviteEmail,
} from "@/lib/admin/users";
import { UserInviteEmail } from "@/emails/UserInviteEmail";
import { sendEmail } from "@/lib/notifications/email";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserActionResult = { ok: true; message: string } | { ok: false; error: string };

async function staff() {
  return requireInternalStaff();
}

function usersRedirect(notice: string, returnTo = "/admin/users"): never {
  const base = safeReturnTo(returnTo);
  const sep = base.includes("?") ? "&" : "?";
  redirect(`${base}${sep}notice=${encodeURIComponent(notice)}`);
}

function usersErrorRedirect(error: string, returnTo = "/admin/users"): never {
  const base = safeReturnTo(returnTo);
  const sep = base.includes("?") ? "&" : "?";
  redirect(`${base}${sep}error=${encodeURIComponent(error)}`);
}

function safeReturnTo(value: string): string {
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin/users";
  return value;
}

async function countActiveAdmins(admin = createAdminClient()) {
  const { count } = await admin
    .from("organization_memberships")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("status", "active");
  return count ?? 0;
}

async function getAuthEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return normalizeInviteEmail(data.user.email);
}

async function sendFreshInviteEmail(input: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  organizationName: string;
  role: AppRole;
}) {
  const admin = createAdminClient();
  const redirectTo = `${getSiteUrl().replace(/\/$/, "")}/auth/invite`;
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: input.email,
    options: {
      redirectTo,
      data: {
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
      },
    },
  });

  if (error || !data?.properties?.action_link) {
    // Fallback: inviteUserByEmail works for brand-new Auth users only.
    const invited = await admin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo,
      data: {
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
      },
    });
    if (invited.error) {
      throw new Error("A fresh invitation could not be generated.");
    }
    return { userId: invited.data.user?.id ?? null, emailedVia: "supabase" as const };
  }

  const inviteUrl = data.properties.action_link;
  const emailResult = await sendEmail({
    to: [input.email],
    subject: `You're invited to TrueFix360 — ${input.organizationName}`,
    react: UserInviteEmail({
      firstName: input.firstName,
      organizationName: input.organizationName,
      roleLabel: humanizeKey(input.role),
      inviteUrl,
    }),
  });

  if (emailResult.status === "failed") {
    throw new Error("The invitation email could not be sent.");
  }

  // If Resend is not configured, fall back to Supabase's invite email pathway
  // by attempting inviteUserByEmail (may fail when the Auth user already exists).
  if (emailResult.status === "skipped") {
    const invited = await admin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo,
      data: {
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
      },
    });
    if (invited.error) {
      throw new Error(
        "Invitation token was refreshed, but email delivery is not configured. Configure Resend or Supabase Auth email and try again.",
      );
    }
    return { userId: invited.data.user?.id ?? data.user?.id ?? null, emailedVia: "supabase" as const };
  }

  return { userId: data.user?.id ?? null, emailedVia: "resend" as const };
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalized = normalizeInviteEmail(email);
  // Admin invite volume is small; page through Auth users to resolve email ownership.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const match = (data.users ?? []).find(
      (user) => normalizeInviteEmail(user.email ?? "") === normalized,
    );
    if (match) return match;
    if ((data.users ?? []).length < 200) break;
  }
  return null;
}

export async function inviteUser(
  organizationId: string,
  email: string,
  role: AppRole,
  firstName: string,
  lastName: string,
  invitedBy?: string | null,
) {
  const admin = createAdminClient();
  const normalized = normalizeInviteEmail(email);

  const [{ data: pendingInvites }, { data: org }, existingAuthUser] = await Promise.all([
    admin
      .from("invitations")
      .select("id, email, status")
      .eq("email", normalized)
      .eq("status", "pending"),
    admin.from("organizations").select("id, name").eq("id", organizationId).maybeSingle(),
    findAuthUserByEmail(normalized),
  ]);

  if (!org) throw new Error("Organization not found.");

  let membershipStatus: string | null = null;
  if (existingAuthUser) {
    const { data: memberships } = await admin
      .from("organization_memberships")
      .select("status")
      .eq("user_id", existingAuthUser.id)
      .in("status", ["active", "invited"]);
    if ((memberships ?? []).some((row) => row.status === "active")) {
      membershipStatus = "active";
    } else if ((memberships ?? []).some((row) => row.status === "invited")) {
      membershipStatus = "invited";
    }
  }

  const duplicate = classifyInviteDuplicate({
    email: normalized,
    memberships: membershipStatus
      ? [{ status: membershipStatus, email: normalized }]
      : [],
    pendingInvitations: (pendingInvites ?? []).map((row) => ({
      email: row.email as string,
      status: row.status as string,
    })),
  });
  const duplicateMessage = inviteDuplicateMessage(duplicate);
  if (duplicateMessage) {
    throw new Error(duplicateMessage);
  }

  await admin.from("invitations").insert({
    email: normalized,
    organization_id: organizationId,
    role,
    status: "pending",
    invited_by: invitedBy ?? null,
  });

  const { data, error } = await admin.auth.admin.inviteUserByEmail(normalized, {
    redirectTo: `${getSiteUrl().replace(/\/$/, "")}/auth/invite`,
    data: { first_name: firstName, last_name: lastName },
  });
  if (error) throw new Error("The invitation could not be sent.");
  if (data.user) {
    await admin.from("organization_memberships").upsert(
      {
        organization_id: organizationId,
        user_id: data.user.id,
        role,
        status: "invited",
      },
      { onConflict: "organization_id,user_id,role" },
    );
  }
}

export async function inviteUserAction(formData: FormData) {
  const ctx = await staff();
  const email = normalizeInviteEmail(String(formData.get("email") ?? ""));
  const organizationId = String(formData.get("organizationId") ?? "");
  const roleRaw = String(formData.get("role") ?? "");
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/admin/users");
  if (!email || !organizationId || !roleRaw) {
    usersErrorRedirect("Email, organization, and role are required.", returnTo);
  }
  if (!isAppRole(roleRaw)) {
    usersErrorRedirect("Invalid role.", returnTo);
  }
  const role: AppRole = roleRaw;
  try {
    await inviteUser(organizationId, email, role, firstName, lastName, ctx.userId);
  } catch (error) {
    usersErrorRedirect(error instanceof Error ? error.message : "Invitation failed.", returnTo);
  }
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId,
    action: "user.invited",
    entityType: "invitations",
    metadata: { email, role },
  });
  revalidatePath("/admin/users");
  revalidatePath(returnTo);
  usersRedirect("Invitation sent successfully.", returnTo);
}

export async function resendInvitationAction(membershipId: string): Promise<UserActionResult> {
  const ctx = await staff();
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("organization_memberships")
    .select("id, role, status, user_id, organization_id, organizations(name), profiles(first_name, last_name, display_name, first_login_at)")
    .eq("id", membershipId)
    .maybeSingle();

  if (!membership) return { ok: false, error: "User membership not found." };
  if (membership.status !== "invited") {
    return { ok: false, error: "Only pending invitations can be resent." };
  }

  const email = await getAuthEmail(membership.user_id as string);
  if (!email) return { ok: false, error: "Unable to resolve this user's email." };

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations;
  const profile = Array.isArray(membership.profiles)
    ? membership.profiles[0]
    : membership.profiles;

  try {
    await sendFreshInviteEmail({
      email,
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      organizationName: (org?.name as string) ?? "TrueFix360",
      role: membership.role as AppRole,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invitation could not be resent.",
    };
  }

  await admin
    .from("invitations")
    .update({ status: "pending", updated_at: new Date().toISOString() })
    .eq("email", email)
    .eq("organization_id", membership.organization_id)
    .eq("role", membership.role)
    .eq("status", "pending");

  // Ensure a pending invitation row exists even if the original was accepted/expired incorrectly.
  const { data: existingInvite } = await admin
    .from("invitations")
    .select("id")
    .eq("email", email)
    .eq("organization_id", membership.organization_id)
    .eq("role", membership.role)
    .eq("status", "pending")
    .maybeSingle();
  if (!existingInvite) {
    await admin.from("invitations").insert({
      email,
      organization_id: membership.organization_id,
      role: membership.role,
      status: "pending",
      invited_by: ctx.userId,
    });
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: membership.organization_id as string,
    action: "user.invite_resent",
    entityType: "organization_memberships",
    entityId: membershipId,
    metadata: { email, role: membership.role },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "Invitation resent successfully." };
}

export async function cancelInvitationAction(membershipId: string): Promise<UserActionResult> {
  const ctx = await staff();
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("organization_memberships")
    .select("id, role, status, user_id, organization_id")
    .eq("id", membershipId)
    .maybeSingle();

  if (!membership) return { ok: false, error: "User membership not found." };
  if (membership.status !== "invited") {
    return { ok: false, error: "Only invited users can have invitations cancelled." };
  }
  if (membership.user_id === ctx.userId) {
    return { ok: false, error: "You cannot remove your own account." };
  }

  const email = await getAuthEmail(membership.user_id as string);
  if (email) {
    await admin
      .from("invitations")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("email", email)
      .eq("organization_id", membership.organization_id)
      .eq("status", "pending");
  }

  await admin.from("organization_memberships").delete().eq("id", membershipId);

  const { data: remaining } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("user_id", membership.user_id)
    .limit(1);

  const { data: profile } = await admin
    .from("profiles")
    .select("first_login_at")
    .eq("id", membership.user_id)
    .maybeSingle();

  // Safe cleanup for never-activated invite-only Auth users.
  if ((remaining ?? []).length === 0 && !profile?.first_login_at) {
    await admin.auth.admin.deleteUser(membership.user_id as string);
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: membership.organization_id as string,
    action: "user.invite_cancelled",
    entityType: "organization_memberships",
    entityId: membershipId,
    metadata: { email, role: membership.role },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "Invitation cancelled." };
}

export async function removeUserAccessAction(membershipId: string): Promise<UserActionResult> {
  const ctx = await staff();
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("organization_memberships")
    .select("id, role, status, user_id, organization_id")
    .eq("id", membershipId)
    .maybeSingle();

  if (!membership) return { ok: false, error: "User membership not found." };
  if (membership.status === "invited") {
    return cancelInvitationAction(membershipId);
  }
  if (membership.status === "disabled") {
    return { ok: false, error: "This user access is already removed." };
  }

  const activeAdminCount = await countActiveAdmins(admin);
  const guard = canRemoveMembership({
    actorUserId: ctx.userId,
    targetUserId: membership.user_id as string,
    targetRole: membership.role as string,
    targetStatus: membership.status as string,
    activeAdminCount,
  });
  if (!guard.ok) return { ok: false, error: guard.error };

  await admin
    .from("organization_memberships")
    .update({ status: "disabled" })
    .eq("id", membershipId);

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: membership.organization_id as string,
    action: "user.access_removed",
    entityType: "organization_memberships",
    entityId: membershipId,
    metadata: { role: membership.role, userId: membership.user_id },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "User access removed." };
}

export async function changeUserRoleAction(
  membershipId: string,
  formData: FormData,
): Promise<UserActionResult> {
  const ctx = await staff();
  const roleRaw = String(formData.get("role") ?? "");
  if (!isAppRole(roleRaw)) {
    return { ok: false, error: "Invalid role." };
  }

  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("organization_memberships")
    .select("id, role, status, user_id, organization_id")
    .eq("id", membershipId)
    .maybeSingle();
  if (!membership) return { ok: false, error: "User membership not found." };

  if (membership.role === "admin" && roleRaw !== "admin" && membership.status === "active") {
    const activeAdminCount = await countActiveAdmins(admin);
    if (activeAdminCount <= 1) {
      return { ok: false, error: "At least one active administrator must remain." };
    }
  }

  const { error } = await admin
    .from("organization_memberships")
    .update({ role: roleRaw })
    .eq("id", membershipId);
  if (error) {
    return { ok: false, error: "Role could not be updated. The user may already have that role." };
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: membership.organization_id as string,
    action: "user.role_changed",
    entityType: "organization_memberships",
    entityId: membershipId,
    metadata: { from: membership.role, to: roleRaw },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "Role updated." };
}
