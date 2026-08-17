"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { headerActions, primaryNav, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <div
      id="mobile-navigation"
      hidden={!open}
      className="xl:hidden"
    >
      <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-near-black px-5 py-5">
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <MobileItem item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <Button href={headerActions.login.href} variant="secondary" onClick={onClose}>
            {headerActions.login.label}
          </Button>
          <Button href={headerActions.quote.href} onClick={onClose}>
            {headerActions.quote.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block py-3 text-base font-medium text-white"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-left text-base font-medium text-white"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {item.label}
        <ChevronDown className={cn("size-4 text-brand transition-transform", open && "rotate-180")} />
      </button>
      <div hidden={!open} className="mb-2 space-y-1 border-l border-brand/40 pl-4">
        <Link href={item.href} onClick={onNavigate} className="block py-2 text-sm text-brand">
          Overview
        </Link>
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            onClick={onNavigate}
            className="block py-2 text-sm text-muted-dark hover:text-white"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
