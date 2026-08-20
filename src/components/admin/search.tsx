"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchAdminAction } from "@/lib/admin/search";
import type { AdminSearchHit } from "@/lib/admin/queries";

export function AdminSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AdminSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    const timer = window.setTimeout(() => {
      void searchAdminAction(term).then((results) => {
        setHits(results);
        setOpen(true);
        setActive(0);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const visibleHits = query.trim().length < 2 ? [] : hits;

  function go(hit: AdminSearchHit) {
    setOpen(false);
    setQuery("");
    router.push(hit.href);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <label className="sr-only" htmlFor="admin-search">
        Search work order, address, client, vendor
      </label>
      {/*
        Icon is absolutely positioned. `.input-field` sets a shorthand `padding`
        that would otherwise override Tailwind pl-* utilities — use !pl-* so text
        never sits under the icon.
      */}
      <Search
        className="pointer-events-none absolute top-1/2 left-3 z-[1] size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id="admin-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => visibleHits.length > 0 && setOpen(true)}
        onKeyDown={(event) => {
          if (!open) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(visibleHits.length - 1, index + 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(0, index - 1));
          } else if (event.key === "Enter" && visibleHits[active]) {
            event.preventDefault();
            go(visibleHits[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Search work order, address, client, vendor..."
        className="input-field box-border h-10 !py-0 !pr-3 !pl-10 text-sm"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
      />
      {open && visibleHits.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-80 w-full overflow-auto border border-line bg-white shadow-lg"
        >
          {visibleHits.map((hit, index) => (
            <li key={`${hit.type}-${hit.id}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                onClick={() => go(hit)}
                className={`block w-full px-3 py-2 text-left text-sm ${index === active ? "bg-cream" : "hover:bg-cream"}`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">{hit.type}</span>
                <span className="mt-0.5 block font-semibold text-ink">{hit.title}</span>
                <span className="block text-xs text-muted">{hit.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
