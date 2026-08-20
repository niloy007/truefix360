"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  headerActions,
  isPrimaryNavActive,
  primaryNav,
  type NavItem,
} from "@/config/navigation";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div id="mobile-navigation" hidden={!open} className="xl:hidden">
      <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-near-black px-5 py-5">
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {primaryNav.map((item) => (
              <li key={item.label}>
                <MobileItem
                  item={item}
                  onNavigate={onClose}
                  active={isPrimaryNavActive(item, pathname, search)}
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6">
          <Button href={headerActions.quote.href} className="w-full" onClick={onClose}>
            {headerActions.quote.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileItem({
  item,
  onNavigate,
  active,
}: {
  item: NavItem;
  onNavigate: () => void;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "block py-3 text-base font-medium text-white/85 hover:text-white",
          active && "text-white",
        )}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between py-3 text-left text-base font-medium text-white/85 hover:text-white",
          (active || open) && "text-white",
        )}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {item.label}
        <ChevronDown
          className={cn("size-4 text-brand transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <div hidden={!open} className="mb-2 space-y-1 border-l border-brand/40 pl-4">
        {item.children.map((child) => (
          <Link
            key={`${child.label}-${child.href}`}
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
