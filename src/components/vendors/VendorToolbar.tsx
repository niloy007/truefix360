"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { usStates } from "@/data/us-states";
import { TRADE_OPTIONS } from "@/lib/vendors/schema";
import {
  buildVendorFilterHref,
  type VendorFilterParams,
} from "@/lib/vendors/filter-href";
import { cn } from "@/lib/utils";

export type { VendorFilterParams };
export { buildVendorFilterHref };

function HiddenPreserved({ params }: { params: VendorFilterParams }) {
  return (
    <>
      <input type="hidden" name="tab" value="all" />
      {params.view ? <input type="hidden" name="view" value={params.view} /> : null}
    </>
  );
}

const selectClass =
  "input-field box-border h-10 max-w-full shrink-0 py-0 text-sm !w-[9.5rem] sm:!w-[10.5rem]";
const stateSelectClass =
  "input-field box-border h-10 max-w-full shrink-0 py-0 text-sm !w-[8.75rem]";
const statusSelectClass =
  "input-field box-border h-10 max-w-full shrink-0 py-0 text-sm !w-[8.75rem]";

export function VendorToolbar({ params }: { params: VendorFilterParams }) {
  const router = useRouter();
  const moreId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const moreRef = useRef<HTMLDivElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const secondaryCount = [params.city, params.preferred, params.shared, params.availability].filter(
    Boolean,
  ).length;

  const chips = useMemo(() => {
    const items: Array<{ key: keyof VendorFilterParams; label: string }> = [];
    if (params.state) items.push({ key: "state", label: params.state });
    if (params.trade) items.push({ key: "trade", label: params.trade });
    if (params.status) items.push({ key: "status", label: params.status.replaceAll("_", " ") });
    if (params.city) items.push({ key: "city", label: params.city });
    if (params.preferred === "yes") items.push({ key: "preferred", label: "Preferred" });
    if (params.preferred === "no") items.push({ key: "preferred", label: "Not preferred" });
    if (params.shared === "yes") items.push({ key: "shared", label: "Shared" });
    if (params.shared === "no") items.push({ key: "shared", label: "Not shared" });
    if (params.availability === "emergency") items.push({ key: "availability", label: "Emergency" });
    if (params.availability === "after_hours") {
      items.push({ key: "availability", label: "After hours" });
    }
    if (params.availability === "weekend") items.push({ key: "availability", label: "Weekend" });
    return items;
  }, [params]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (moreRef.current?.contains(target) || moreBtnRef.current?.contains(target)) return;
      setMoreOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!moreOpen || !moreBtnRef.current) {
      setPopoverPos(null);
      return;
    }
    function place() {
      const rect = moreBtnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(288, window.innerWidth - 16);
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      const top = Math.min(rect.bottom + 4, window.innerHeight - 16);
      setPopoverPos({ top, left });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [moreOpen]);

  function clearKey(key: keyof VendorFilterParams) {
    router.push(buildVendorFilterHref({ ...params, [key]: undefined }));
  }

  const clearHref = buildVendorFilterHref({
    tab: "all",
    view: params.view,
  });
  const hasFilters = Boolean(
    params.q ||
      params.state ||
      params.trade ||
      params.status ||
      params.city ||
      params.preferred ||
      params.shared ||
      params.availability,
  );

  const morePopover =
    mounted && moreOpen && popoverPos
      ? createPortal(
          <div
            ref={moreRef}
            role="dialog"
            aria-labelledby={moreId}
            style={{
              top: popoverPos.top,
              left: popoverPos.left,
              width: Math.min(
                288,
                typeof window !== "undefined" ? window.innerWidth - 16 : 288,
              ),
            }}
            className="fixed z-[60] max-h-[min(24rem,70vh)] overflow-y-auto border border-line bg-white p-3 shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">More filters</p>
            <form method="get" className="mt-3 grid gap-2" onSubmit={() => setMoreOpen(false)}>
              <HiddenPreserved params={params} />
              <input type="hidden" name="q" value={params.q ?? ""} />
              <input type="hidden" name="state" value={params.state ?? ""} />
              <input type="hidden" name="trade" value={params.trade ?? ""} />
              <input type="hidden" name="status" value={params.status ?? ""} />
              <label className="text-xs font-medium">
                City / market
                <input
                  name="city"
                  defaultValue={params.city}
                  className="input-field mt-1 h-9 !w-full py-0 text-sm"
                  placeholder="City"
                />
              </label>
              <label className="text-xs font-medium">
                Preferred
                <select
                  name="preferred"
                  defaultValue={params.preferred ?? ""}
                  className="input-field mt-1 h-9 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="yes">Preferred only</option>
                  <option value="no">Not preferred</option>
                </select>
              </label>
              <label className="text-xs font-medium">
                Shared network
                <select
                  name="shared"
                  defaultValue={params.shared ?? ""}
                  className="input-field mt-1 h-9 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="yes">Visible in network</option>
                  <option value="no">Hidden from network</option>
                </select>
              </label>
              <label className="text-xs font-medium">
                Availability
                <select
                  name="availability"
                  defaultValue={params.availability ?? ""}
                  className="input-field mt-1 h-9 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="emergency">Emergency</option>
                  <option value="after_hours">After hours</option>
                  <option value="weekend">Weekend</option>
                </select>
              </label>
              <div className="mt-1 flex gap-2">
                <button type="submit" className="h-9 flex-1 bg-ink text-xs font-semibold text-white">
                  Apply Filters
                </button>
                <Link
                  href={clearHref}
                  className="inline-flex h-9 items-center border border-line px-3 text-xs font-semibold"
                  onClick={() => setMoreOpen(false)}
                >
                  Clear
                </Link>
              </div>
            </form>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="sticky top-[5.25rem] z-10 max-w-full min-w-0 space-y-2 overflow-visible border border-line bg-white/95 p-3 shadow-sm backdrop-blur">
      <form method="get" className="hidden max-w-full min-w-0 md:block">
        <HiddenPreserved params={params} />
        {params.city ? <input type="hidden" name="city" value={params.city} /> : null}
        {params.preferred ? <input type="hidden" name="preferred" value={params.preferred} /> : null}
        {params.shared ? <input type="hidden" name="shared" value={params.shared} /> : null}
        {params.availability ? (
          <input type="hidden" name="availability" value={params.availability} />
        ) : null}

        <div className="flex max-w-full min-w-0 flex-col gap-2 xl:flex-row xl:items-center">
          <label className="sr-only" htmlFor="vendor-search">
            Search vendors
          </label>
          <input
            id="vendor-search"
            name="q"
            defaultValue={params.q}
            placeholder="Search vendor, contact, phone, city, ZIP, trade…"
            className="input-field box-border h-10 w-full min-w-0 flex-1 py-0 text-sm !max-w-full"
          />

          <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="vendor-state">
              State
            </label>
            <select
              id="vendor-state"
              name="state"
              defaultValue={params.state ?? ""}
              className={stateSelectClass}
            >
              <option value="">State</option>
              {usStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="vendor-trade">
              Trade
            </label>
            <select id="vendor-trade" name="trade" defaultValue={params.trade ?? ""} className={selectClass}>
              <option value="">Trade</option>
              {TRADE_OPTIONS.map((trade) => (
                <option key={trade.value} value={trade.value}>
                  {trade.label}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="vendor-status">
              Status
            </label>
            <select
              id="vendor-status"
              name="status"
              defaultValue={params.status ?? ""}
              className={statusSelectClass}
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="do_not_use">Do Not Use</option>
            </select>

            <button
              ref={moreBtnRef}
              type="button"
              id={moreId}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "inline-flex h-10 items-center whitespace-nowrap border border-line px-3 text-sm font-semibold",
                secondaryCount > 0 ? "border-brand text-brand" : "hover:border-brand",
              )}
            >
              More Filters{secondaryCount > 0 ? ` (${secondaryCount})` : ""}
            </button>

            {hasFilters ? (
              <Link
                href={clearHref}
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap border border-line px-3 text-sm font-semibold hover:border-brand"
              >
                Clear
              </Link>
            ) : null}

            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center bg-ink px-3 text-sm font-semibold text-white"
            >
              Search
            </button>
          </div>
        </div>
      </form>
      {morePopover}

      <form method="get" className="grid max-w-full min-w-0 gap-2 md:hidden">
        <HiddenPreserved params={params} />
        {params.state ? <input type="hidden" name="state" value={params.state} /> : null}
        {params.trade ? <input type="hidden" name="trade" value={params.trade} /> : null}
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        {params.city ? <input type="hidden" name="city" value={params.city} /> : null}
        {params.preferred ? <input type="hidden" name="preferred" value={params.preferred} /> : null}
        {params.shared ? <input type="hidden" name="shared" value={params.shared} /> : null}
        {params.availability ? (
          <input type="hidden" name="availability" value={params.availability} />
        ) : null}
        <div className="flex max-w-full min-w-0 gap-2">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search vendors…"
            className="input-field h-10 min-w-0 flex-1 py-0 text-sm !w-full"
            aria-label="Search vendors"
          />
          <button
            type="button"
            className={cn(
              "h-10 shrink-0 border border-line px-3 text-sm font-semibold",
              chips.length ? "border-brand text-brand" : "",
            )}
            onClick={() => setMobileOpen(true)}
          >
            Filters{chips.length ? ` (${chips.length})` : ""}
          </button>
        </div>
      </form>

      {chips.length > 0 ? (
        <div className="flex max-w-full min-w-0 flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={`${chip.key}-${chip.label}`}
              type="button"
              onClick={() => clearKey(chip.key)}
              className="inline-flex max-w-full items-center gap-1 border border-line bg-cream px-2 py-0.5 text-xs font-semibold hover:border-brand"
            >
              <span className="truncate">{chip.label}</span>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove {chip.label} filter</span>
            </button>
          ))}
          <Link href={clearHref} className="ml-1 text-xs font-semibold text-brand hover:text-brand-hover">
            Clear all
          </Link>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] max-w-full overflow-y-auto border-t border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Filters</h2>
              <button type="button" className="text-sm font-semibold" onClick={() => setMobileOpen(false)}>
                Close
              </button>
            </div>
            <form method="get" className="grid gap-3">
              <HiddenPreserved params={params} />
              <input type="hidden" name="q" value={params.q ?? ""} />
              <label className="text-sm font-medium">
                State
                <select
                  name="state"
                  defaultValue={params.state ?? ""}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  {usStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                City / Market
                <input
                  name="city"
                  defaultValue={params.city}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                />
              </label>
              <label className="text-sm font-medium">
                Trade
                <select
                  name="trade"
                  defaultValue={params.trade ?? ""}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  {TRADE_OPTIONS.map((trade) => (
                    <option key={trade.value} value={trade.value}>
                      {trade.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Status
                <select
                  name="status"
                  defaultValue={params.status ?? ""}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="do_not_use">Do Not Use</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Preferred
                <select
                  name="preferred"
                  defaultValue={params.preferred ?? ""}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="yes">Preferred only</option>
                  <option value="no">Not preferred</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Shared
                <select
                  name="shared"
                  defaultValue={params.shared ?? ""}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="yes">Visible in network</option>
                  <option value="no">Hidden from network</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Availability
                <select
                  name="availability"
                  defaultValue={params.availability ?? ""}
                  className="input-field mt-1 h-10 !w-full py-0 text-sm"
                >
                  <option value="">Any</option>
                  <option value="emergency">Emergency</option>
                  <option value="after_hours">After hours</option>
                  <option value="weekend">Weekend</option>
                </select>
              </label>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="h-11 flex-1 bg-brand text-sm font-semibold text-white">
                  Apply Filters
                </button>
                <Link
                  href={clearHref}
                  className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold"
                >
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
