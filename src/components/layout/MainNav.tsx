"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { headerActions, primaryNav, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:h-[5rem] lg:px-8">
        <Logo inverted />
        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button href={headerActions.login.href} variant="ghost" className="text-white hover:text-brand">
            {headerActions.login.label}
          </Button>
          <Button href={headerActions.quote.href} size="sm">
            {headerActions.quote.label}
          </Button>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-md border border-white/15 text-white xl:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "px-2.5 py-2 text-[0.92rem] font-medium text-white/80 transition-colors hover:text-white",
          active && "text-white",
        )}
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
          "inline-flex items-center gap-1 px-2.5 py-2 text-[0.92rem] font-medium text-white/80 hover:text-white",
          (active || open) && "text-white",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute top-full left-0 z-50 min-w-72 border border-white/10 bg-near-black py-2 shadow-xl"
      >
        <Link
          href={item.href}
          className="block px-4 py-2 text-sm font-semibold text-brand hover:bg-white/5"
        >
          View all {item.label.toLowerCase()}
        </Link>
        {item.children.map((child) => (
          <Link
            key={child.href}
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
