import { AppShell } from "@/components/app/AppShell";
import { requireClientUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

const items = [
  { href: "/portal/client", label: "Dashboard" },
  { href: "/portal/client/requests", label: "Service Requests" },
  { href: "/portal/client/work-orders", label: "Work Orders" },
  { href: "/portal/client/properties", label: "Properties" },
  { href: "/portal/client/estimates", label: "Estimates" },
  { href: "/portal/client/files", label: "Files" },
  { href: "/portal/client/account", label: "Account" },
];

export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireClientUser();
  return (
    <AppShell title="Client Portal" email={ctx.email} items={items}>
      {children}
    </AppShell>
  );
}
