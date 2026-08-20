import { inviteUserAction } from "@/lib/admin/actions";
import { PageHeader, StatusBadge, AdminTable } from "@/components/admin/ui";
import { UserMembershipActions } from "@/components/admin/UserMembershipActions";
import { requireInternalStaff } from "@/lib/auth/guards";
import { canRemoveMembership } from "@/lib/admin/users";
import { formatDate, formatDateTime } from "@/lib/format";
import { humanizeKey } from "@/lib/admin/status";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const ctx = await requireInternalStaff();
  const params = await searchParams;
  const admin = createAdminClient();

  const [{ data: memberships }, { data: orgs }, { count: activeAdminCount }] = await Promise.all([
    admin
      .from("organization_memberships")
      .select(
        "id, role, status, user_id, organization_id, created_at, organizations(name, type), profiles(display_name, first_name, last_name, first_login_at, last_login_at)",
      )
      .order("created_at", { ascending: false })
      .limit(150),
    admin.from("organizations").select("id, name, type").eq("status", "active").order("name"),
    admin
      .from("organization_memberships")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("status", "active"),
  ]);

  const userIds = [...new Set((memberships ?? []).map((row) => row.user_id as string))];
  const emailByUserId = new Map<string, string>();
  await Promise.all(
    userIds.map(async (userId) => {
      const { data } = await admin.auth.admin.getUserById(userId);
      if (data.user?.email) emailByUserId.set(userId, data.user.email);
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Invite staff, clients, and vendors. Access is controlled by organization membership and role."
      />

      {params.notice ? (
        <p role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {params.notice}
        </p>
      ) : null}
      {params.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {params.error}
        </p>
      ) : null}

      <form action={inviteUserAction} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Invite user</h2>
        <input type="hidden" name="returnTo" value="/admin/users" />
        <select name="organizationId" required className="input-field">
          <option value="">Organization</option>
          {(orgs ?? []).map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.type})
            </option>
          ))}
        </select>
        <select name="role" required className="input-field" defaultValue="staff">
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="client">Client</option>
          <option value="vendor_admin">Vendor admin</option>
          <option value="crew">Crew</option>
        </select>
        <input name="firstName" className="input-field" placeholder="First name" />
        <input name="lastName" className="input-field" placeholder="Last name" />
        <input name="email" type="email" required className="input-field" placeholder="Email" />
        <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">
          Send invitation
        </button>
      </form>

      <div className="hidden md:block">
        <AdminTable
          headers={[
            "Name",
            "Email",
            "Organization",
            "Role",
            "Status",
            "Invited",
            "Activated",
            "Last sign-in",
            "Actions",
          ]}
        >
          {(memberships ?? []).map((row) => {
            const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            const displayName =
              profile?.display_name ||
              [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
              "User";
            const email = emailByUserId.get(row.user_id as string) ?? "—";
            const isCurrentUser = row.user_id === ctx.userId;
            const removal = canRemoveMembership({
              actorUserId: ctx.userId,
              targetUserId: row.user_id as string,
              targetRole: row.role as string,
              targetStatus: row.status as string,
              activeAdminCount: activeAdminCount ?? 0,
            });

            return (
              <tr key={row.id} className="border-t border-line align-top">
                <td className="px-3 py-3 font-semibold">
                  {displayName}
                  {isCurrentUser ? <span className="ml-2 text-xs font-normal text-muted">(you)</span> : null}
                </td>
                <td className="px-3 py-3">{email}</td>
                <td className="px-3 py-3">{org?.name ?? "—"}</td>
                <td className="px-3 py-3">{humanizeKey(row.role)}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={row.status} />
                </td>
                <td className="px-3 py-3 text-muted">{formatDate(row.created_at)}</td>
                <td className="px-3 py-3 text-muted">
                  {profile?.first_login_at ? formatDate(profile.first_login_at) : "—"}
                </td>
                <td className="px-3 py-3 text-muted">
                  {profile?.last_login_at ? formatDateTime(profile.last_login_at) : "—"}
                </td>
                <td className="px-3 py-3">
                  {row.status === "disabled" ? (
                    <span className="text-xs text-muted">Removed</span>
                  ) : (
                    <UserMembershipActions
                      membershipId={row.id}
                      userId={row.user_id}
                      displayName={displayName}
                      status={row.status}
                      role={row.role}
                      isCurrentUser={isCurrentUser}
                      canRemove={removal.ok}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      <div className="grid gap-3 md:hidden">
        {(memberships ?? []).map((row) => {
          const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          const displayName =
            profile?.display_name ||
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
            "User";
          const email = emailByUserId.get(row.user_id as string) ?? "—";
          const isCurrentUser = row.user_id === ctx.userId;
          const removal = canRemoveMembership({
            actorUserId: ctx.userId,
            targetUserId: row.user_id as string,
            targetRole: row.role as string,
            targetStatus: row.status as string,
            activeAdminCount: activeAdminCount ?? 0,
          });

          return (
            <article key={row.id} className="border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-heading text-lg font-semibold">{displayName}</p>
                  <p className="text-sm text-muted">{email}</p>
                </div>
                <StatusBadge value={row.status} />
              </div>
              <p className="mt-2 text-sm">
                {org?.name ?? "—"} · {humanizeKey(row.role)}
              </p>
              <p className="mt-1 text-xs text-muted">
                Invited {formatDate(row.created_at)}
                {profile?.first_login_at ? ` · Activated ${formatDate(profile.first_login_at)}` : ""}
              </p>
              {row.status !== "disabled" ? (
                <div className="mt-3">
                  <UserMembershipActions
                    membershipId={row.id}
                    userId={row.user_id}
                    displayName={displayName}
                    status={row.status}
                    role={row.role}
                    isCurrentUser={isCurrentUser}
                    canRemove={removal.ok}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
