import Link from "next/link";
import { EmptyState, StatusBadge } from "@/components/app/AppShell";
import { formatDateTime } from "@/lib/format";

type Row = {
  id: string;
  href: string;
  title: string;
  meta: string;
  status: string;
  createdAt?: string;
};

export function RecordList({
  title,
  description,
  rows,
  empty,
}: {
  title: string;
  description: string;
  rows: Row[];
  empty: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Nothing here yet" body={empty} />
      ) : (
        <div className="divide-y divide-line overflow-x-auto border border-line bg-white">
          {rows.map((row) => (
            <Link key={row.id} href={row.href} className="grid gap-2 px-4 py-3 text-sm hover:bg-cream sm:grid-cols-[1fr_auto_auto]">
              <span className="font-medium text-ink">{row.title}</span>
              <span className="text-muted">{row.meta}{row.createdAt ? ` · ${formatDateTime(row.createdAt)}` : ""}</span>
              <StatusBadge value={row.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DetailList({ rows }: { rows: Array<[string, string | number | null | undefined]> }) {
  return (
    <dl className="divide-y divide-line border border-line bg-white">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr]">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="text-sm text-ink whitespace-pre-wrap">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
