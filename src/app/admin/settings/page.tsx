import { PageHeader } from "@/components/admin/ui";
import { notificationStatus } from "@/config/env";

export default function AdminSettingsPage() {
  const status = notificationStatus();
  const cards = [
    { title: "Company", body: "TrueFix360 internal organization, branding, and operating defaults." },
    {
      title: "Notifications",
      body: "Operational email and WhatsApp delivery. Secret tokens are never displayed.",
      rows: [
        ["Operational email", status.email ? "Configured" : "Not configured"],
        ["WhatsApp", status.whatsapp ? "Configured" : "Not configured"],
      ],
    },
    {
      title: "Authentication",
      body: "Supabase Auth email/password and invite recovery.",
      rows: [
        ["Supabase", status.supabase ? "Connected" : "Not configured"],
        ["Auth email SMTP", status.supabase ? "Configured" : "Not configured"],
      ],
    },
    {
      title: "Integrations",
      body: "Connected backend services used by admin operations.",
      rows: [
        ["Supabase", status.supabase ? "Connected" : "Not configured"],
        ["Service role", status.serviceRole ? "Configured" : "Not configured"],
      ],
    },
    { title: "System", body: "No production secrets, API keys, or SMTP passwords are shown on this page." },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configuration status only. Secret values are never displayed." />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <section key={card.title} className="border border-line bg-white p-5">
            <h2 className="font-heading text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.body}</p>
            {card.rows ? (
              <dl className="mt-4 space-y-2 text-sm">
                {card.rows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
