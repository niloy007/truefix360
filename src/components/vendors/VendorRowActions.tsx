"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  setVendorPreferredAction,
  setVendorSharedVisibilityAction,
} from "@/lib/vendors/actions";

type VendorRowActionsProps = {
  vendorId: string;
  phone?: string | null;
  email?: string | null;
  preferred?: boolean;
  shared?: boolean;
  /** Card footer uses stronger primary action labels. */
  variant?: "table" | "card";
};

export function VendorRowActions({
  vendorId,
  phone,
  email,
  preferred = false,
  shared = false,
  variant = "table",
}: VendorRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function runToggle(kind: "preferred" | "shared") {
    setError(null);
    startTransition(async () => {
      const result =
        kind === "preferred"
          ? await setVendorPreferredAction(vendorId, !preferred)
          : await setVendorSharedVisibilityAction(vendorId, !shared);
      if (!result.ok) setError(result.error);
      else setOpen(false);
    });
  }

  const isCard = variant === "card";

  return (
    <div
      ref={rootRef}
      className={
        isCard
          ? "relative flex max-w-full min-w-0 flex-wrap items-center gap-2"
          : "relative flex max-w-full min-w-0 flex-wrap items-center gap-1.5"
      }
    >
      <Link
        href={`/admin/vendors/${vendorId}`}
        className={
          isCard
            ? "inline-flex h-9 flex-1 items-center justify-center bg-ink px-3 text-xs font-semibold text-white hover:bg-near-black sm:flex-none"
            : "inline-flex h-8 items-center border border-line px-2.5 text-xs font-semibold hover:border-brand"
        }
      >
        {isCard ? "View Vendor" : "View"}
      </Link>
      <Link
        href={`/admin/dispatch?vendor=${vendorId}`}
        className={
          isCard
            ? "inline-flex h-9 items-center justify-center border border-line px-3 text-xs font-semibold hover:border-brand"
            : "inline-flex h-8 items-center border border-line px-2.5 text-xs font-semibold hover:border-brand"
        }
      >
        Assign
      </Link>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More vendor actions"
        onClick={() => setOpen((v) => !v)}
        className={
          isCard
            ? "ml-auto inline-flex h-9 w-9 items-center justify-center border border-line text-sm font-semibold hover:border-brand"
            : "inline-flex h-8 w-8 items-center justify-center border border-line text-sm font-semibold hover:border-brand"
        }
      >
        ⋯
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 bottom-full z-30 mb-1 min-w-[12rem] max-w-[calc(100vw-2rem)] border border-line bg-white py-1 shadow-md sm:bottom-auto sm:top-full sm:mb-0 sm:mt-1"
        >
          <Link
            role="menuitem"
            href={`/admin/vendors/${vendorId}/edit`}
            className="block px-3 py-2 text-sm hover:bg-cream"
            onClick={() => setOpen(false)}
          >
            Edit
          </Link>
          {phone ? (
            <a
              role="menuitem"
              href={`tel:${phone}`}
              className="block px-3 py-2 text-sm hover:bg-cream"
              onClick={() => setOpen(false)}
            >
              Call
            </a>
          ) : null}
          {email ? (
            <a
              role="menuitem"
              href={`mailto:${email}`}
              className="block px-3 py-2 text-sm hover:bg-cream"
              onClick={() => setOpen(false)}
            >
              Email
            </a>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-cream disabled:opacity-60"
            onClick={() => runToggle("shared")}
          >
            {shared ? "Hide from Shared Network" : "Show in Shared Network"}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-cream disabled:opacity-60"
            onClick={() => runToggle("preferred")}
          >
            {preferred ? "Unmark Preferred" : "Mark Preferred"}
          </button>
          {error ? <p className="px-3 py-2 text-xs text-red-700">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
