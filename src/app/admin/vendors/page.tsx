import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { ShareLinkCard } from "@/components/vendors/ShareLinkCard";
import { ShareNetworkButton } from "@/components/vendors/ShareNetworkButton";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorRowActions } from "@/components/vendors/VendorRowActions";
import { VendorToolbar } from "@/components/vendors/VendorToolbar";
import { VendorViewToggle } from "@/components/vendors/VendorViewToggle";
import { formatDate } from "@/lib/format";
import {
  approveNetworkSubmissionFormAction,
  rejectNetworkSubmissionFormAction,
} from "@/lib/vendors/actions";
import { getVendorDirectoryMetrics, listAdminVendors } from "@/lib/vendors/queries";
import { formatVendorCoverage, truncateTrades } from "@/lib/vendors/presentation";
import { recoverAdminShareUrl } from "@/lib/vendors/recover-share-url";
import { createAdminClient } from "@/lib/supabase/admin";

function tabHref(tab: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  sp.set("tab", tab);
  for (const [key, value] of Object.entries(params)) {
    if (key === "tab") continue;
    if (value) sp.set(key, value);
  }
  return `/admin/vendors?${sp.toString()}`;
}

function TradeTags({ trades }: { trades: string[] }) {
  const { shown, more } = truncateTrades(trades, 2);
  if (shown.length === 0) return <span className="text-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((trade) => (
        <span
          key={trade}
          className="inline-flex border border-line bg-cream px-1.5 py-0.5 text-[11px] font-medium text-ink"
        >
          {trade}
        </span>
      ))}
      {more > 0 ? (
        <span
          className="inline-flex border border-line px-1.5 py-0.5 text-[11px] font-medium text-muted"
          title={trades.slice(2).join(", ")}
        >
          +{more} more
        </span>
      ) : null}
    </div>
  );
}

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = {
    q: typeof raw.q === "string" ? raw.q : undefined,
    state: typeof raw.state === "string" ? raw.state : undefined,
    city: typeof raw.city === "string" ? raw.city : undefined,
    trade: typeof raw.trade === "string" ? raw.trade : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    preferred: typeof raw.preferred === "string" ? raw.preferred : undefined,
    shared: typeof raw.shared === "string" ? raw.shared : undefined,
    availability: typeof raw.availability === "string" ? raw.availability : undefined,
    tab: typeof raw.tab === "string" ? raw.tab : "all",
    view: typeof raw.view === "string" ? raw.view : undefined,
  };

  const view: "cards" | "table" = params.view === "table" ? "table" : "cards";

  const admin = createAdminClient();
  const [metrics, vendors, { data: submissions }, { data: links }] = await Promise.all([
    getVendorDirectoryMetrics(),
    listAdminVendors(params),
    admin
      .from("vendor_network_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(100),
    admin
      .from("vendor_network_links")
      .select(
        "id, name, permission, created_at, expires_at, revoked_at, last_accessed_at, created_by, encrypted_token",
      )
      .order("created_at", { ascending: false }),
  ]);

  const creatorIds = [...new Set((links ?? []).map((l) => l.created_by).filter(Boolean))] as string[];
  const { data: creatorProfiles } = creatorIds.length
    ? await admin.from("profiles").select("id, display_name, first_name, last_name").in("id", creatorIds)
    : { data: [] };

  // eslint-disable-next-line react-hooks/purity -- server page evaluates expiration at request time
  const nowMs = Date.now();

  const linkRows = (links ?? []).map((link) => {
    const profile = (creatorProfiles ?? []).find((p) => p.id === link.created_by);
    const createdByName =
      profile?.display_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      null;
    const hasEncryptedToken = Boolean(link.encrypted_token);
    return {
      id: link.id as string,
      name: link.name as string,
      permission: link.permission as string,
      createdAt: link.created_at as string,
      expiresAt: (link.expires_at as string | null) ?? null,
      revokedAt: (link.revoked_at as string | null) ?? null,
      lastAccessedAt: (link.last_accessed_at as string | null) ?? null,
      createdByName,
      hasEncryptedToken,
      shareUrl: recoverAdminShareUrl(
        {
          encrypted_token: (link.encrypted_token as string | null) ?? null,
          revoked_at: (link.revoked_at as string | null) ?? null,
          expires_at: (link.expires_at as string | null) ?? null,
        },
        nowMs,
      ),
    };
  });

  const pending = (submissions ?? []).filter((s) => s.status === "pending" || s.status === "needs_info");
  const tab = params.tab === "pending" || params.tab === "links" ? params.tab : "all";
  const filtered = Boolean(
    params.q ||
      params.state ||
      params.city ||
      params.trade ||
      params.status ||
      params.preferred ||
      params.shared ||
      params.availability,
  );

  const resultLabel = filtered
    ? `${vendors.length} ${vendors.length === 1 ? "vendor" : "vendors"} found`
    : `${vendors.length} ${vendors.length === 1 ? "vendor" : "vendors"}`;

  return (
    <div className="max-w-full min-w-0 space-y-4 overflow-x-hidden">
      <PageHeader
        title="Vendors"
        description="Manage approved contractors, service providers, coverage, availability, and assignments."
        actions={
          <>
            <Link
              href="/admin/vendors/new"
              className="inline-flex h-10 items-center bg-brand px-4 text-sm font-semibold text-white"
            >
              + Add Vendor
            </Link>
            <ShareNetworkButton links={linkRows} />
          </>
        }
      />

      <p className="text-sm text-muted">
        <span className="font-semibold text-ink">{metrics.total}</span>{" "}
        {metrics.total === 1 ? "Vendor" : "Vendors"}
        <span className="mx-2 text-muted/50">·</span>
        <span className="font-semibold text-ink">{metrics.active}</span> Active
        <span className="mx-2 text-muted/50">·</span>
        <Link href="/admin/vendors?tab=pending" className="hover:text-brand">
          <span className="font-semibold text-ink">{metrics.pendingReview}</span> Pending
        </Link>
        <span className="mx-2 text-muted/50">·</span>
        <span className="font-semibold text-ink">{metrics.preferred}</span> Preferred
        <span className="mx-2 text-muted/50">·</span>
        <span className="font-semibold text-ink">{metrics.statesCovered}</span>{" "}
        {metrics.statesCovered === 1 ? "State" : "States"}
      </p>

      <div className="flex max-w-full min-w-0 flex-wrap gap-1 border-b border-line text-sm">
        {[
          { id: "all", label: "All Vendors" },
          { id: "pending", label: `Pending Review (${pending.length})` },
          { id: "links", label: `Share Links (${linkRows.length})` },
        ].map((item) => (
          <Link
            key={item.id}
            href={tabHref(item.id, params)}
            className={
              tab === item.id
                ? "border-b-2 border-brand px-3 py-2 font-semibold text-brand"
                : "px-3 py-2 text-muted hover:text-ink"
            }
            aria-current={tab === item.id ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "all" ? (
        <>
          <VendorToolbar params={params} />

          <VendorViewToggle params={params} view={view} resultLabel={resultLabel} />

          {vendors.length === 0 ? (
            <EmptyState
              title={filtered ? "No vendors match these filters" : "Build your vendor network"}
              body={
                filtered
                  ? "Try clearing filters or adjusting your search."
                  : "Add your first approved vendor or approve an existing vendor application."
              }
              action={
                filtered ? (
                  <Link
                    href="/admin/vendors"
                    className="inline-flex h-10 items-center border border-line px-4 text-sm font-semibold"
                  >
                    Clear filters
                  </Link>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link
                      href="/admin/vendors/new"
                      className="inline-flex h-10 items-center bg-brand px-4 text-sm font-semibold text-white"
                    >
                      + Add Vendor
                    </Link>
                    <Link
                      href="/admin/vendor-applications"
                      className="inline-flex h-10 items-center border border-line px-4 text-sm font-semibold"
                    >
                      View Vendor Applications
                    </Link>
                  </div>
                )
              }
            />
          ) : (
            <>
              <div
                className={
                  view === "table"
                    ? "grid grid-cols-1 gap-4 md:hidden"
                    : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                }
              >
                {vendors.map((row) => (
                  <VendorCard
                    key={row.id}
                    vendor={{
                      id: row.id,
                      name: row.name,
                      openWorkOrders: row.openWorkOrders,
                      profile: row.profile,
                      orgStatus: row.orgStatus,
                    }}
                  />
                ))}
              </div>

              {view === "table" ? (
                <div className="hidden max-w-full min-w-0 overflow-x-auto border border-line bg-white md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 z-[5] border-b border-line bg-cream text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      <tr>
                        {["Vendor", "Contact", "Trades", "Coverage", "Status", "Open WOs", "Actions"].map(
                          (header) => (
                            <th key={header} className="whitespace-nowrap px-3 py-2">
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((row) => {
                        const p = row.profile ?? {};
                        const trades = Array.isArray(p.service_categories)
                          ? (p.service_categories as string[])
                          : [];
                        const location = [p.city, p.state].filter(Boolean).join(", ");
                        return (
                          <tr key={row.id} className="border-t border-line align-top">
                            <td className="px-3 py-2.5">
                              <Link
                                href={`/admin/vendors/${row.id}`}
                                className="font-semibold hover:text-brand"
                              >
                                {row.name}
                                {p.preferred ? (
                                  <span className="ml-1 text-brand" title="Preferred" aria-label="Preferred">
                                    ★
                                  </span>
                                ) : null}
                              </Link>
                              {location ? <p className="mt-0.5 text-xs text-muted">{location}</p> : null}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {p.shared_network_visible ? (
                                  <span className="border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
                                    Shared
                                  </span>
                                ) : null}
                                {p.preferred ? (
                                  <span className="border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                                    Preferred
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <p>{(p.primary_contact_name as string) || "—"}</p>
                              {p.primary_phone ? (
                                <a
                                  className="mt-0.5 block text-xs text-brand hover:text-brand-hover"
                                  href={`tel:${p.primary_phone}`}
                                >
                                  {String(p.primary_phone)}
                                </a>
                              ) : (
                                <p className="mt-0.5 text-xs text-muted">—</p>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <TradeTags trades={trades} />
                            </td>
                            <td className="max-w-[10rem] px-3 py-2.5 text-muted">
                              <span className="line-clamp-2">{formatVendorCoverage(p)}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <StatusBadge value={String(p.vendor_status ?? row.orgStatus)} />
                            </td>
                            <td className="px-3 py-2.5 font-semibold">{row.openWorkOrders}</td>
                            <td className="px-3 py-2.5">
                              <VendorRowActions
                                vendorId={row.id}
                                phone={(p.primary_phone as string) || null}
                                email={(p.primary_email as string) || null}
                                preferred={Boolean(p.preferred)}
                                shared={Boolean(p.shared_network_visible)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : null}

      {tab === "pending" ? (
        <div className="space-y-3">
          {(submissions ?? []).length === 0 ? (
            <div className="border border-dashed border-line bg-white px-4 py-6 text-center">
              <p className="text-sm font-semibold text-ink">No pending network submissions</p>
              <p className="mt-1 text-xs text-muted">
                Shared Vendor Network contributors will appear here for review.
              </p>
            </div>
          ) : (
            (submissions ?? []).map((submission) => (
              <article key={submission.id} className="max-w-full min-w-0 border border-line bg-white p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-semibold">{submission.company_name}</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {submission.submitted_by_name || submission.submitted_by_email || "Unknown"} ·{" "}
                      {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                  <StatusBadge value={submission.status} />
                </div>
                <p className="mt-2 text-sm">
                  {[submission.contact_name, submission.phone].filter(Boolean).join(" · ") || "—"}
                </p>
                <p className="text-xs text-muted">
                  {[submission.city, submission.state].filter(Boolean).join(", ") || "—"} ·{" "}
                  {(submission.service_categories ?? []).slice(0, 3).join(" · ") || "No trades"}
                </p>
                {submission.status === "pending" || submission.status === "needs_info" ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    <form
                      action={approveNetworkSubmissionFormAction.bind(null, submission.id)}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <label className="text-xs font-medium">
                        Status
                        <select
                          name="vendorStatus"
                          defaultValue="active"
                          className="input-field mt-1 h-9 py-0 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 pb-2 text-sm">
                        <input type="checkbox" name="preferred" value="true" />
                        Preferred
                      </label>
                      <label className="flex items-center gap-2 pb-2 text-sm">
                        <input type="checkbox" name="sharedNetworkVisible" value="true" />
                        Shared
                      </label>
                      <button type="submit" className="h-9 bg-brand px-3 text-sm font-semibold text-white">
                        Approve
                      </button>
                    </form>
                    <form
                      action={rejectNetworkSubmissionFormAction.bind(null, submission.id)}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input
                        name="rejectionReason"
                        className="input-field h-9 py-0 text-sm"
                        placeholder="Rejection reason"
                      />
                      <button
                        type="submit"
                        className="h-9 border border-red-200 px-3 text-sm font-semibold text-red-700"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "links" ? (
        <div className="max-w-full min-w-0 space-y-3">
          {linkRows.length === 0 ? (
            <div className="border border-dashed border-line bg-white px-4 py-6 text-center">
              <p className="text-sm font-semibold">No share links</p>
              <p className="mt-1 text-xs text-muted">
                Use Share Vendor Network in the page header to create an authenticated directory link.
              </p>
            </div>
          ) : (
            linkRows.map((link) => <ShareLinkCard key={link.id} link={link} nowMs={nowMs} />)
          )}
        </div>
      ) : null}
    </div>
  );
}
