import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export type AppNavItem = {
  href: string;
  label: string;
};

export function AppShell({
  title,
  email,
  items,
  children,
}: {
  title: string;
  email: string;
  items: AppNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-cream text-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/10 bg-ink text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/" className="font-heading text-sm font-extrabold tracking-[0.18em]">
            TRUEFIX360
          </Link>
          <span className="text-[0.65rem] uppercase tracking-[0.16em] text-brand lg:mt-2 lg:block">
            {title}
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:pb-6" aria-label="Portal">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center px-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
          <p className="text-sm text-muted">{email}</p>
          <form action={signOutAction}>
            <button type="submit" className="text-sm font-semibold text-ink hover:text-brand">
              Sign out
            </button>
          </form>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex border border-line bg-cream px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-line bg-white px-5 py-10 text-center">
      <p className="font-heading text-lg font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
