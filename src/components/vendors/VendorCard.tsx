import Link from "next/link";
import { StatusBadge } from "@/components/admin/ui";
import { VendorRowActions } from "@/components/vendors/VendorRowActions";
import { formatVendorCoverage, truncateTrades } from "@/lib/vendors/presentation";

export type VendorCardModel = {
  id: string;
  name: string;
  openWorkOrders: number;
  profile: Record<string, unknown> | null;
  orgStatus?: string | null;
};

export function VendorCard({ vendor }: { vendor: VendorCardModel }) {
  const p = vendor.profile ?? {};
  const trades = Array.isArray(p.service_categories)
    ? (p.service_categories as string[])
    : [];
  const { shown, more } = truncateTrades(trades, 3);
  const location = [p.city, p.state].filter(Boolean).join(", ");
  const status = String(p.vendor_status ?? vendor.orgStatus ?? "active");
  const contact = (p.primary_contact_name as string) || null;
  const phone = (p.primary_phone as string) || null;
  const email = (p.primary_email as string) || null;
  const preferred = Boolean(p.preferred);
  const shared = Boolean(p.shared_network_visible);

  return (
    <article className="flex min-w-0 flex-col border border-line bg-white p-4">
      <div className="min-w-0">
        <h3 className="font-heading text-base font-semibold leading-snug text-ink">
          <Link href={`/admin/vendors/${vendor.id}`} className="hover:text-brand">
            {vendor.name}
          </Link>
          {preferred ? (
            <span className="ml-1 text-brand" title="Preferred" aria-label="Preferred">
              ★
            </span>
          ) : null}
        </h3>
        {location ? <p className="mt-0.5 text-sm text-muted">{location}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1">
          <StatusBadge value={status} />
          {shared ? (
            <span className="inline-flex items-center border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
              Shared
            </span>
          ) : null}
          {preferred ? (
            <span className="inline-flex items-center border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              Preferred
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 min-w-0 text-sm">
        <p className="truncate font-medium text-ink">{contact || "—"}</p>
        {phone ? (
          <a href={`tel:${phone}`} className="mt-0.5 block truncate text-brand hover:text-brand-hover">
            {phone}
          </a>
        ) : (
          <p className="mt-0.5 text-muted">No phone</p>
        )}
      </div>

      <div className="mt-3 min-w-0">
        {shown.length === 0 ? (
          <p className="text-xs text-muted">No trades listed</p>
        ) : (
          <ul className="space-y-0.5 text-sm text-ink">
            {shown.map((trade) => (
              <li key={trade} className="truncate">
                {trade}
              </li>
            ))}
            {more > 0 ? <li className="text-muted">+{more} more</li> : null}
          </ul>
        )}
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          <span className="text-muted">Coverage</span>
          <span className="ml-2 text-ink">{formatVendorCoverage(p)}</span>
        </p>
        <p>
          <span className="text-muted">Open Work Orders</span>
          <span className="ml-2 font-semibold text-ink">{vendor.openWorkOrders}</span>
        </p>
      </div>

      <div className="mt-auto border-t border-line pt-3">
        <VendorRowActions
          vendorId={vendor.id}
          phone={phone}
          email={email}
          preferred={preferred}
          shared={shared}
        />
      </div>
    </article>
  );
}
