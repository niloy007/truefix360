import { notificationStatus } from "@/config/env";

export default function AdminSettingsPage() {
  const status = notificationStatus();
  const rows = [
    ["Supabase", status.supabase ? "Connected" : "Not configured"],
    ["Service role", status.serviceRole ? "Configured" : "Not configured"],
    ["Email notifications", status.email ? "Configured" : "Not configured"],
    ["WhatsApp notifications", status.whatsapp ? "Configured" : "Not configured"],
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Settings</h1>
      <p className="text-sm text-muted">Configuration status only. Secret values are never displayed.</p>
      <dl className="divide-y divide-line border border-line bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr]">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
