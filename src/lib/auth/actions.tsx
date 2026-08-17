"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getPasswordRecoveryRedirectTo,
  getSiteUrl,
  isFirstUseAlertsEnabled,
  isSupabaseConfigured,
} from "@/config/env";
import { writeAuditLog } from "@/lib/audit";
import { getAuthContext, resolveHomePath } from "@/lib/auth/guards";
import { validateNewPassword } from "@/lib/auth/password";
import { InternalGenericNotification } from "@/emails/InternalGenericNotification";
import { formatDateTime } from "@/lib/format";
import { notify } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Sign-in is not configured yet." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "The email or password is incorrect." };
  }

  await recordLoginActivity();
  const ctx = await getAuthContext();
  const destination =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : ctx
        ? resolveHomePath(ctx.memberships)
        : "/login";
  redirect(destination);
}

export async function requestPasswordResetAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Password reset is not configured yet." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Email is required." };
  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordRecoveryRedirectTo(),
  });
  return { ok: true as const };
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { error: invalid };
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "The password could not be updated. Try the reset link again." };
  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    // Password is already saved; send the user to sign in either way.
  }
  redirect("/login?passwordReset=success");
}

export async function completeInvitePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { error: invalid };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return {
      error: "This invitation session is missing or has expired. Open the invite email again.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "The password could not be saved. Try the invite link again or contact TrueFix360." };
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    await admin
      .from("organization_memberships")
      .update({ status: "active" })
      .eq("user_id", user.id)
      .eq("status", "invited");
    await admin
      .from("invitations")
      .update({ status: "accepted", accepted_at: now })
      .eq("email", user.email)
      .eq("status", "pending");
  } catch {
    // Password is saved; membership lookup below decides where to send the user.
  }

  try {
    await recordLoginActivity();
  } catch {
    // Login activity is secondary to password creation.
  }

  let ctx = null;
  try {
    ctx = await getAuthContext();
  } catch {
    ctx = null;
  }

  if (!ctx) {
    redirect("/login");
  }

  const destination = resolveHomePath(ctx.memberships);
  if (destination === "/login") {
    return {
      error:
        "Your password was saved, but this account does not have an active organization yet. Contact TrueFix360.",
    };
  }
  redirect(destination);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

async function recordLoginActivity() {
  const ctx = await getAuthContext();
  if (!ctx) return;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("first_login_at, display_name, first_name, last_name")
    .eq("id", ctx.userId)
    .maybeSingle();

  const now = new Date().toISOString();
  const isFirst = !profile?.first_login_at;
  await admin
    .from("profiles")
    .update({
      last_login_at: now,
      first_login_at: profile?.first_login_at ?? now,
    })
    .eq("id", ctx.userId);

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: isFirst ? "auth.first_login" : "auth.login",
    entityType: "profiles",
    entityId: ctx.userId,
    metadata: { email: ctx.email },
  });

  if (isFirst && isFirstUseAlertsEnabled()) {
    const membership = ctx.memberships.find((item) => item.status === "active");
    if (membership && membership.organizationType !== "internal") {
      await notify({
        event: "auth.first_login",
        entityType: "profiles",
        entityId: ctx.userId,
        adminPath: "/admin/users",
        officeEmail: {
          subject: `First login: ${ctx.email}`,
          react: (
            <InternalGenericNotification
              title="First portal login"
              preview="An invited user signed in for the first time."
              adminUrl={`${getSiteUrl()}/admin/users`}
              rows={[
                { label: "Name", value: profile?.display_name ?? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() },
                { label: "Email", value: ctx.email },
                { label: "Organization", value: membership.organizationName },
                { label: "Role", value: membership.role },
                { label: "Time", value: formatDateTime(now) },
              ]}
            />
          ),
        },
      });
    }
  }
}
