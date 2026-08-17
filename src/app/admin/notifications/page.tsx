import { retryNotificationAction } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/app/AppShell";

export default async function AdminNotificationsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("notification_deliveries")
    .select("*")
    .order("attempted_at", { ascending: false })
    .limit(100);
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Notifications</h1>
      <div className="overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Recipient</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Retry</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2">{row.event_type}</td>
                <td className="px-3 py-2">{row.provider}</td>
                <td className="px-3 py-2">{row.recipient}</td>
                <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
                <td className="px-3 py-2">{formatDateTime(row.attempted_at)}</td>
                <td className="px-3 py-2">{row.provider_message_id ?? "—"}</td>
                <td className="px-3 py-2">
                  {row.status === "failed" ? (
                    <form action={async () => {
                      "use server";
                      await retryNotificationAction(row.id);
                    }}>
                      <button type="submit" className="font-semibold text-brand">Retry</button>
                    </form>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
