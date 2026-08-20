"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buildVendorFilterHref, type VendorFilterParams } from "@/lib/vendors/filter-href";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "truefix360.admin.vendors.view";

export function VendorViewToggle({
  params,
  view,
  resultLabel,
}: {
  params: VendorFilterParams;
  view: "cards" | "table";
  resultLabel: string;
}) {
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const cardsHref = buildVendorFilterHref({ ...params, tab: "all", view: "cards" });
  const tableHref = buildVendorFilterHref({ ...params, tab: "all", view: "table" });

  return (
    <div className="flex max-w-full min-w-0 flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">{resultLabel}</p>
      <div className="inline-flex border border-line" role="group" aria-label="Vendor list view">
        <Link
          href={cardsHref}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold",
            view === "cards" ? "bg-ink text-white" : "bg-white text-ink hover:bg-cream",
          )}
          aria-current={view === "cards" ? "page" : undefined}
        >
          <span aria-hidden="true">▦</span> Cards
        </Link>
        <Link
          href={tableHref}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 border-l border-line px-2.5 text-xs font-semibold",
            view === "table" ? "bg-ink text-white" : "bg-white text-ink hover:bg-cream",
          )}
          aria-current={view === "table" ? "page" : undefined}
        >
          <span aria-hidden="true">≡</span> Table
        </Link>
      </div>
    </div>
  );
}

export function readStoredVendorView(): "cards" | "table" | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "cards" || value === "table") return value;
  } catch {
    /* ignore */
  }
  return null;
}
