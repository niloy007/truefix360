import { redirect } from "next/navigation";
import {
  CLIENT_ROLES,
  INTERNAL_ROLES,
  VENDOR_ROLES,
  type AppRole,
} from "@/config/platform";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/config/env";
import {
  isClientRole,
  isInternalRole,
  isVendorRole,
  type Membership,
} from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type { Membership } from "@/lib/auth/roles";
export {
  isClientRole,
  isInternalRole,
  isVendorRole,
  resolveHomePath,
} from "@/lib/auth/roles";

export type AuthContext = {
  userId: string;
  email: string;
  memberships: Membership[];
};

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: "unauthenticated" | "forbidden" | "not_configured" = "forbidden",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getAuthContext(): Promise<AuthContext | null> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();
  const { data: memberships, error } = await admin
    .from("organization_memberships")
    .select("id, organization_id, role, status, organizations(name, type)")
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Unable to load account memberships.");
  }

  const mapped: Membership[] = (memberships ?? []).map((row) => {
    const org = Array.isArray(row.organizations)
      ? row.organizations[0]
      : row.organizations;
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      organizationName: (org?.name as string) ?? "Organization",
      organizationType: (org?.type as Membership["organizationType"]) ?? "client",
      role: row.role as AppRole,
      status: row.status as string,
    };
  });

  return {
    userId: user.id,
    email: user.email,
    memberships: mapped,
  };
}

export async function requireUser(): Promise<AuthContext> {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    redirect("/login?error=not_configured");
  }
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function requireRole(roles: AppRole[]): Promise<AuthContext> {
  const ctx = await requireUser();
  const ok = ctx.memberships.some(
    (item) => item.status === "active" && roles.includes(item.role),
  );
  if (!ok) redirect("/login?error=forbidden");
  return ctx;
}

export async function requireOrganizationMembership(
  organizationId: string,
  roles?: AppRole[],
): Promise<Membership> {
  const ctx = await requireUser();
  const membership = ctx.memberships.find(
    (item) =>
      item.organizationId === organizationId &&
      item.status === "active" &&
      (!roles || roles.includes(item.role)),
  );
  if (!membership) {
    throw new AuthError("You do not have access to this organization.");
  }
  return membership;
}

export async function requireInternalStaff(): Promise<AuthContext & { membership: Membership }> {
  const ctx = await requireRole(INTERNAL_ROLES);
  const membership = ctx.memberships.find(
    (item) => item.status === "active" && isInternalRole(item.role),
  );
  if (!membership) redirect("/login?error=forbidden");
  return { ...ctx, membership };
}

export async function requireClientUser(): Promise<AuthContext & { membership: Membership }> {
  const ctx = await requireRole(CLIENT_ROLES);
  const membership = ctx.memberships.find(
    (item) => item.status === "active" && isClientRole(item.role),
  );
  if (!membership) redirect("/login?error=forbidden");
  return { ...ctx, membership };
}

export async function requireVendorUser(): Promise<AuthContext & { membership: Membership }> {
  const ctx = await requireRole(VENDOR_ROLES);
  const membership = ctx.memberships.find(
    (item) => item.status === "active" && isVendorRole(item.role),
  );
  if (!membership) redirect("/login?error=forbidden");
  return { ...ctx, membership };
}

export function assertOrgAccess(
  ctx: AuthContext,
  organizationId: string,
  roles?: AppRole[],
): Membership {
  const membership = ctx.memberships.find(
    (item) =>
      item.organizationId === organizationId &&
      item.status === "active" &&
      (!roles || roles.includes(item.role)),
  );
  if (!membership) {
    throw new AuthError("You do not have access to this record.");
  }
  return membership;
}
