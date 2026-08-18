"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { ADMIN_NAV } from "@/components/admin/nav";
import { AdminSearch } from "@/components/admin/search";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AdminShellUser = {
  name: string;
  email: string;
  roleLabel: string;
};

export type AdminNotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  at: string;
};

export function AdminShell({
  user,
  badges,
  notifications,
  children,
}: {
  user: AdminShellUser;
  badges: { contacts: number; quotes: number; notifications: number };
  notifications: AdminNotificationItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const initial = user.name.trim().charAt(0).toUpperCase() || "A";

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="border-b border-white/10 px-5 py-4">
        <Link href="/admin" className="block font-heading text-sm font-extrabold tracking-[0.18em]">
          TRUEFIX360
        </Link>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-brand">Admin</p>
        <Link
          href="/admin/work-orders/new"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 bg-brand text-sm font-semibold text-white hover:bg-brand-hover"
        >
          <Plus className="size-4" />
          New Work Order
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-10 items-center gap-2 px-3 text-sm font-medium",
                      isActive(item.href)
                        ? "bg-white/10 text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 ? (
                      <span className="bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center bg-brand text-sm font-bold">{initial}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-white/60">{user.roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-cream text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">{sidebar}</aside>
      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div className="relative h-full w-[min(86vw,280px)]">{sidebar}</div>
        </div>
      ) : null}
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center border border-line lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Welcome back, {user.name.split(" ")[0]}</p>
              <div className="mt-2">
                <AdminSearch />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  className="relative grid size-10 place-items-center border border-line"
                  onClick={() => {
                    setNotifyOpen((value) => !value);
                    setUserOpen(false);
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                  {badges.notifications > 0 ? (
                    <span className="absolute -right-1 -top-1 bg-brand px-1.5 text-[10px] font-bold text-white">
                      {badges.notifications}
                    </span>
                  ) : null}
                </button>
                {notifyOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-80 border border-line bg-white shadow-lg">
                    <p className="border-b border-line px-3 py-2 text-sm font-semibold">Notifications</p>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-muted">No recent notification activity.</p>
                    ) : (
                      notifications.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="block border-b border-line px-3 py-2 text-sm hover:bg-cream"
                          onClick={() => setNotifyOpen(false)}
                        >
                          <span className="font-semibold text-ink">{item.title}</span>
                          <span className="mt-0.5 block text-xs text-muted">{item.subtitle}</span>
                          <span className="mt-0.5 block text-xs text-muted">{formatRelativeTime(item.at)}</span>
                        </Link>
                      ))
                    )}
                    <Link href="/admin/notifications" className="block px-3 py-2 text-sm font-semibold text-brand">
                      View all notifications
                    </Link>
                  </div>
                ) : null}
              </div>
              <Link
                href="/admin/work-orders/new"
                className="hidden h-10 items-center bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-hover sm:inline-flex"
              >
                New Work Order
              </Link>
              <div className="relative">
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 border border-line px-3 text-sm font-semibold"
                  onClick={() => {
                    setUserOpen((value) => !value);
                    setNotifyOpen(false);
                  }}
                  aria-haspopup="menu"
                >
                  {initial}
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </button>
                {userOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-48 border border-line bg-white shadow-lg">
                    <p className="border-b border-line px-3 py-2 text-xs text-muted">{user.email}</p>
                    <Link
                      href="/admin/users"
                      className="block px-3 py-2 text-sm hover:bg-cream"
                      onClick={() => setUserOpen(false)}
                    >
                      My Account
                    </Link>
                    <form action={signOutAction}>
                      <button type="submit" className="block w-full px-3 py-2 text-left text-sm hover:bg-cream">
                        Sign Out
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
