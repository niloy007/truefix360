import Link from "next/link";
import { notFound } from "next/navigation";
import {
  inactiveLinkMessage,
  resolveNetworkLinkAccess,
} from "@/lib/vendor-network/access";
import { getSharedVendor } from "@/lib/vendor-network/actions";

export default async function SharedVendorDetailPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  const { token, id } = await params;
  const access = await resolveNetworkLinkAccess(token);
  if (!access.ok) {
    return (
      <div className="mx-auto max-w-lg border border-line bg-white px-6 py-12 text-center">
        <h1 className="font-heading text-2xl font-semibold">Vendor Network</h1>
        <p className="mt-3 text-sm text-muted">{inactiveLinkMessage(access.reason)}</p>
      </div>
    );
  }

  const vendor = await getSharedVendor(token, id);
  if (!vendor) notFound();
  const base = `/vendor-network/${encodeURIComponent(token)}`;

  return (
    <div className="space-y-6">
      <Link href={base} className="text-sm font-semibold text-brand hover:text-brand-hover">
        ← Back to directory
      </Link>
      <div>
        <h1 className="font-heading text-3xl font-semibold">{vendor.companyName}</h1>
        <p className="mt-2 text-sm text-muted">
          {[vendor.city, vendor.state, vendor.zip].filter(Boolean).join(", ") || "Location not listed"}
        </p>
        {vendor.preferred ? (
          <span className="mt-3 inline-flex border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
            Preferred
          </span>
        ) : null}
      </div>

      <dl className="grid gap-4 border border-line bg-white p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Contact</dt>
          <dd className="mt-1 font-medium">{vendor.contactName || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Phone</dt>
          <dd className="mt-1 font-medium">
            {vendor.phone ? <a href={`tel:${vendor.phone}`} className="text-brand">{vendor.phone}</a> : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd className="mt-1 font-medium">
            {vendor.email ? <a href={`mailto:${vendor.email}`} className="text-brand">{vendor.email}</a> : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Website</dt>
          <dd className="mt-1 font-medium">{vendor.website || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Trades</dt>
          <dd className="mt-1 font-medium">{vendor.trades.join(" · ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">States served</dt>
          <dd className="mt-1 font-medium">{vendor.coverageStates.join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Counties / cities</dt>
          <dd className="mt-1 font-medium">
            {[...vendor.coverageCounties, ...vendor.coverageCities].join(", ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">ZIP coverage</dt>
          <dd className="mt-1 font-medium">{vendor.coverageZips.join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Service radius</dt>
          <dd className="mt-1 font-medium">
            {vendor.serviceRadiusMiles != null ? `${vendor.serviceRadiusMiles} miles` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Trip fee</dt>
          <dd className="mt-1 font-medium">
            {vendor.tripFeeEnabled
              ? vendor.tripFeeNotes || (vendor.tripFeeAmount != null ? `$${vendor.tripFeeAmount}` : "Yes")
              : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Availability</dt>
          <dd className="mt-1 font-medium">
            {[
              vendor.standardAvailability,
              vendor.emergencyAvailable ? "Emergency" : null,
              vendor.afterHoursAvailable ? "After hours" : null,
              vendor.weekendAvailable ? "Weekend" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </dd>
        </div>
        {vendor.publicNotes ? (
          <div className="sm:col-span-2">
            <dt className="text-muted">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap font-medium">{vendor.publicNotes}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
