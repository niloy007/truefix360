import Link from "next/link";
import {
  canSubmitVendors,
  inactiveLinkMessage,
  resolveNetworkLinkAccess,
} from "@/lib/vendor-network/access";
import { listSharedVendors } from "@/lib/vendor-network/actions";
import { TRADE_OPTIONS } from "@/lib/vendors/schema";
import { usStates } from "@/data/us-states";

function NetworkInactive({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg border border-line bg-white px-6 py-12 text-center">
      <h1 className="font-heading text-2xl font-semibold">Vendor Network</h1>
      <p className="mt-3 text-sm text-muted">{message}</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white">
        Go to TrueFix360
      </Link>
    </div>
  );
}

export default async function VendorNetworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const raw = await searchParams;
  const filters = {
    q: typeof raw.q === "string" ? raw.q : undefined,
    state: typeof raw.state === "string" ? raw.state : undefined,
    trade: typeof raw.trade === "string" ? raw.trade : undefined,
    preferred: typeof raw.preferred === "string" ? raw.preferred : undefined,
  };

  const access = await resolveNetworkLinkAccess(token);
  if (!access.ok) {
    return <NetworkInactive message={inactiveLinkMessage(access.reason)} />;
  }

  const vendors = await listSharedVendors(token, filters);
  const canAdd = canSubmitVendors(access.link.permission);
  const base = `/vendor-network/${encodeURIComponent(token)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">TrueFix360</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Vendor Network
          </h1>
          <p className="mt-2 text-sm text-muted">Authorized vendor directory · {access.link.name}</p>
        </div>
        {canAdd ? (
          <Link
            href={`${base}/submit`}
            className="inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white"
          >
            + Add Vendor
          </Link>
        ) : null}
      </div>

      <form method="get" className="grid gap-2 border border-line bg-white p-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Search vendor, ZIP, city, trade..."
          className="input-field h-10 py-0 text-sm"
        />
        <select name="state" defaultValue={filters.state ?? ""} className="input-field h-10 py-0 text-sm">
          <option value="">State</option>
          {usStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.code}
            </option>
          ))}
        </select>
        <select name="trade" defaultValue={filters.trade ?? ""} className="input-field h-10 py-0 text-sm">
          <option value="">Trade</option>
          {TRADE_OPTIONS.map((trade) => (
            <option key={trade.value} value={trade.value}>
              {trade.label}
            </option>
          ))}
        </select>
        <select name="preferred" defaultValue={filters.preferred ?? ""} className="input-field h-10 py-0 text-sm">
          <option value="">Preferred</option>
          <option value="yes">Preferred only</option>
        </select>
        <button type="submit" className="h-10 bg-ink px-4 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      {vendors.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-5 py-10 text-center">
          <p className="font-heading text-lg font-semibold">No shared vendors yet</p>
          <p className="mt-2 text-sm text-muted">
            Vendors marked visible in the Shared Network will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {vendors.map((vendor) => (
            <article key={vendor.organizationId} className="border border-line bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold">{vendor.companyName}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {[vendor.city, vendor.state].filter(Boolean).join(", ") || "Location not listed"}
                  </p>
                </div>
                {vendor.preferred ? (
                  <span className="border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                    Preferred
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm">{vendor.trades.join(" · ") || "Services not listed"}</p>
              <p className="mt-2 text-sm text-muted">
                Coverage:{" "}
                {vendor.coverageSummary ||
                  [
                    vendor.coverageCities.slice(0, 2).join(", ") || vendor.coverageStates.join(", "),
                    vendor.serviceRadiusMiles != null ? `${vendor.serviceRadiusMiles} miles` : null,
                  ]
                    .filter(Boolean)
                    .join(" + ") ||
                  "—"}
              </p>
              {vendor.tripFeeEnabled ? (
                <p className="mt-1 text-sm text-muted">
                  Trip fee: {vendor.tripFeeNotes || (vendor.tripFeeAmount != null ? `$${vendor.tripFeeAmount}` : "Yes")}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-muted">
                Emergency: {vendor.emergencyAvailable ? "Available" : "Not listed"}
              </p>
              <p className="mt-1 text-sm">
                Phone:{" "}
                {vendor.phone ? (
                  <a href={`tel:${vendor.phone}`} className="font-semibold text-brand">
                    {vendor.phone}
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <div className="mt-4">
                <Link
                  href={`${base}/vendors/${vendor.organizationId}`}
                  className="inline-flex h-10 items-center border border-line px-4 text-sm font-semibold hover:border-brand"
                >
                  View Vendor
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
