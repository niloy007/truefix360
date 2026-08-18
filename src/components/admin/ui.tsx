import Link from "next/link";
import { cn } from "@/lib/utils";
import { humanizeKey, priorityTone, statusTone } from "@/lib/admin/status";

const TONE_CLASS = {
  neutral: "border-line bg-cream text-ink",
  orange: "border-brand/30 bg-brand/10 text-brand",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  red: "border-red-200 bg-red-50 text-red-800",
} as const;

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE_CLASS[statusTone(value)],
      )}
    >
      {label ?? humanizeKey(value)}
    </span>
  );
}

export function PriorityBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted">—</span>;
  const tone = priorityTone(value);
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE_CLASS[tone],
      )}
    >
      {humanizeKey(value)}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
}) {
  const content = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </>
  );
  const className = "border border-line bg-white p-4 transition hover:border-brand/40";
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-line bg-white px-5 py-10 text-center">
      <p className="font-heading text-lg font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <form className="flex flex-wrap gap-2 border border-line bg-white p-3" method="get">
      {children}
    </form>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("input-field h-10 py-0 text-sm", props.className)} />;
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("input-field h-10 py-0 text-sm", props.className)} />;
}

export function Pagination({
  page,
  pageSize,
  total,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <p>
        Showing {start}–{end} of {total}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={makeHref(page - 1)} className="border border-line px-3 py-1.5 text-ink hover:border-brand">
            Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={makeHref(page + 1)} className="border border-line px-3 py-1.5 text-ink hover:border-brand">
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-cream text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap px-3 py-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AlertBar({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="border border-red-200 bg-red-50">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-start gap-2 border-b border-red-200 px-4 py-3 text-sm text-red-800 last:border-b-0 hover:bg-red-100"
        >
          <span aria-hidden="true">!</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export function InternalOnly({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line bg-cream/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">Internal only</p>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}
