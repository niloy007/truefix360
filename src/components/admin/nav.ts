import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  MapPinned,
  RadioTower,
  ScrollText,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "contacts" | "quotes" | "notifications" | "vendors";
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/service-requests", label: "Service Requests", icon: ClipboardList },
      { href: "/admin/work-orders", label: "Work Orders", icon: Wrench },
      { href: "/admin/dispatch", label: "Dispatch", icon: RadioTower },
      { href: "/admin/estimates", label: "Estimates", icon: FileText },
    ],
  },
  {
    label: "Relationships",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Building2 },
      { href: "/admin/properties", label: "Properties", icon: MapPinned },
      { href: "/admin/vendors", label: "Vendors", icon: Users, badgeKey: "vendors" },
      { href: "/admin/vendor-applications", label: "Vendor Applications", icon: ShieldCheck },
      { href: "/admin/coverage", label: "Coverage", icon: MapPinned },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/contacts", label: "Contacts", icon: Inbox, badgeKey: "contacts" },
      { href: "/admin/quotes", label: "Quote Requests", icon: FileText, badgeKey: "quotes" },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/users", label: "Users", icon: UserRound },
      { href: "/admin/files", label: "Files", icon: FolderOpen },
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];
