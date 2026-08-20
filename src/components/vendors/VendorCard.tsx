import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/admin/ui";
import { VendorRowActions } from "@/components/vendors/VendorRowActions";
import {
  formatVendorCoverageParts,
  truncateTrades,
  vendorInitials,
} from "@/lib/vendors/presentation";

export type VendorCardModel = {
  id: string;
  name: string;
  openWorkOrders: number;
  profile: Record<string, unknown> | null;
  orgStatus?: string | null;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>
  );
}

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
  const initials = vendorInitials(vendor.name);
  const coverage = formatVendorCoverageParts(p);
  const remainingTrades = more > 0 ? trades.slice(shown.length).join(", ") : "";

  return (
    <article className="group flex min-h-[22rem] min-w-0 flex-col rounded-md border border-line bg-white p-4 shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-brand/40 hover:shadow-md">
      <div className="flex min-w-0 gap-3">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-md bg-ink text-sm font-bold tracking-wide text-white"
          aria-hidden="true"
          data-vendor-avatar="initials"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[1.05rem] font-semibold leading-snug text-ink">
            <Link href={`/admin/vendors/${vendor.id}`} className="break-words hover:text-brand">
              {vendor.name}
            </Link>
          </h3>
          {location ? <p className="mt-0.5 text-sm text-muted">{location}</p> : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge value={status} />
            {shared ? (
              <span className="inline-flex items-center border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
                Shared
              </span>
            ) : null}
            {preferred ? (
              <span className="inline-flex items-center gap-0.5 border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                <span aria-hidden="true">★</span> Preferred
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <SectionLabel>Contact</SectionLabel>
        <p className="mt-1 text-sm font-medium text-ink">{contact || "—"}</p>
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="mt-0.5 block text-sm text-brand hover:text-brand-hover"
          >
            {phone}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-muted">No phone on file</p>
        )}
      </div>

      <div className="mt-4 min-w-0">
        <SectionLabel>Trades</SectionLabel>
        {shown.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted">No trades listed</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {shown.map((trade) => (
              <span
                key={trade}
                className="inline-flex max-w-full items-center border border-line bg-cream px-2 py-0.5 text-xs font-medium text-ink"
              >
                <span className="truncate">{trade}</span>
              </span>
            ))}
            {more > 0 ? (
              <span
                className="inline-flex items-center border border-dashed border-line px-2 py-0.5 text-xs font-medium text-muted"
                title={remainingTrades}
              >
                +{more} more
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 min-w-0">
        <SectionLabel>Coverage</SectionLabel>
        <p className="mt-1 text-sm text-ink">{coverage.primary}</p>
        {coverage.secondary ? (
          <p className="mt-0.5 text-xs text-muted">{coverage.secondary}</p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">Open Work Orders</span>
        <span className="font-heading text-lg font-semibold tabular-nums text-ink">
          {vendor.openWorkOrders}
        </span>
      </div>

      <div className="mt-auto border-t border-line pt-3">
        <VendorRowActions
          vendorId={vendor.id}
          phone={phone}
          email={email}
          preferred={preferred}
          shared={shared}
          variant="card"
        />
      </div>
    </article>
  );
}
