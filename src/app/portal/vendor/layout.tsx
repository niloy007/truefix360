import { AppShell } from "@/components/app/AppShell";
import { requireVendorUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

const items = [
  { href: "/portal/vendor", label: "Dashboard" },
  { href: "/portal/vendor/assignments", label: "Assignments" },
  { href: "/portal/vendor/schedule", label: "Schedule" },
  { href: "/portal/vendor/estimates", label: "Estimates" },
  { href: "/portal/vendor/completed", label: "Completed Jobs" },
  { href: "/portal/vendor/documents", label: "Documents" },
  { href: "/portal/vendor/coverage", label: "Coverage" },
  { href: "/portal/vendor/company", label: "Company" },
  { href: "/portal/vendor/account", label: "Account" },
];

export default async function VendorPortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireVendorUser();
  return (
    <AppShell title="Vendor Portal" email={ctx.email} items={items}>
      {children}
    </AppShell>
  );
}
