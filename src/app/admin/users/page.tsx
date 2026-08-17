import { inviteUserAction } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("organization_memberships")
    .select("id, role, status, user_id, organization_id, organizations(name, type), profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  const { data: orgs } = await admin.from("organizations").select("id, name, type").eq("status", "active");
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold">Users</h1>
      <form action={inviteUserAction} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Invite user</h2>
        <select name="organizationId" required className="input-field">
          <option value="">Organization</option>
          {(orgs ?? []).map((org) => (
            <option key={org.id} value={org.id}>{org.name} ({org.type})</option>
          ))}
        </select>
        <select name="role" required className="input-field">
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="client">Client</option>
          <option value="vendor_admin">Vendor admin</option>
          <option value="crew">Crew</option>
        </select>
        <input name="firstName" className="input-field" placeholder="First name" />
        <input name="lastName" className="input-field" placeholder="Last name" />
        <input name="email" type="email" required className="input-field" placeholder="Email" />
        <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">Send invitation</button>
      </form>
      <div className="divide-y divide-line border border-line bg-white">
        {(memberships ?? []).map((row) => {
          const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          return (
            <div key={row.id} className="px-4 py-3 text-sm">
              {profile?.display_name ?? row.user_id} · {org?.name} · {row.role} · {row.status}
            </div>
          );
        })}
      </div>
    </div>
  );
}
