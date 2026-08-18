import { AdminShell } from "@/components/admin/shell";
import { requireInternalStaff } from "@/lib/auth/guards";
import { getInboxBadges } from "@/lib/admin/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { humanizeKey } from "@/lib/admin/status";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireInternalStaff();
  const admin = createAdminClient();
  const [{ data: profile }, badges, { data: notifications }] = await Promise.all([
    admin
      .from("profiles")
      .select("display_name, first_name, last_name")
      .eq("id", ctx.userId)
      .maybeSingle(),
    getInboxBadges(),
    admin
      .from("notification_deliveries")
      .select("id, event_type, status, recipient, attempted_at")
      .order("attempted_at", { ascending: false })
      .limit(6),
  ]);

  const name =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    ctx.email.split("@")[0];

  return (
    <AdminShell
      user={{
        name,
        email: ctx.email,
        roleLabel: humanizeKey(ctx.membership.role),
      }}
      badges={badges}
      notifications={(notifications ?? []).map((row) => ({
        id: row.id,
        title: humanizeKey(row.event_type),
        subtitle: `${row.recipient} · ${humanizeKey(row.status)}`,
        href: "/admin/notifications",
        at: row.attempted_at,
      }))}
    >
      {children}
    </AdminShell>
  );
}
