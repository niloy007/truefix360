import { AppShell } from "@/components/app/AppShell";
import { requireInternalStaff } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/quotes", label: "Quote Requests" },
  { href: "/admin/service-requests", label: "Service Requests" },
  { href: "/admin/work-orders", label: "Work Orders" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/vendor-applications", label: "Vendor Applications" },
  { href: "/admin/estimates", label: "Estimates" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireInternalStaff();
  return (
    <AppShell title="Admin" email={ctx.email} items={items}>
      {children}
    </AppShell>
  );
}
