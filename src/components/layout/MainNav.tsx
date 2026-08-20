"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import {
  headerActions,
  isPrimaryNavActive,
  primaryNav,
  type NavItem,
} from "@/config/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-6 lg:h-[4.25rem] lg:gap-6 lg:px-8">
        <Logo inverted className="shrink-0" />

        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 xl:flex"
        >
          {primaryNav.map((item) => (
            <NavLink key={item.label} item={item} pathname={pathname} search={search} />
          ))}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center xl:flex">
          <Button href={headerActions.quote.href} size="sm">
            {headerActions.quote.label}
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2 xl:hidden">
          <Button href={headerActions.quote.href} size="sm" className="hidden sm:inline-flex">
            {headerActions.quote.label}
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md border border-white/15 text-white"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}

function NavLink({
  item,
  pathname,
  search,
}: {
  item: NavItem;
  pathname: string;
  search: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = isPrimaryNavActive(item, pathname, search);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "px-2.5 py-2 text-[0.9rem] font-medium text-white/80 transition-colors hover:text-white",
          active && "text-white",
        )}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-2 text-[0.9rem] font-medium text-white/80 hover:text-white",
          (active || open) && "text-white",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      <div
        id={menuId}
        hidden={!open}
        role="menu"
        className="absolute top-full left-0 z-50 max-h-[min(24rem,70vh)] min-w-64 max-w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border border-white/10 bg-near-black py-2 shadow-xl"
      >
        {item.children.map((child) => (
          <Link
            key={`${child.label}-${child.href}`}
            role="menuitem"
            href={child.href}
            className="block px-4 py-2.5 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            <span className="block text-sm font-medium text-white">{child.label}</span>
            {child.description ? (
              <span className="mt-0.5 block text-xs text-muted-dark">{child.description}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
