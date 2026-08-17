"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/data/faqs";
import { cn } from "@/lib/utils";

export function FAQAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <AccordionItem key={item.question} item={item} />
      ))}
    </div>
  );
}

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div>
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="font-heading text-base font-semibold text-ink sm:text-lg">
            {item.question}
          </span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-brand transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5"
      >
        <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
          {item.answer}
        </p>
        {item.links && item.links.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-4">
            {item.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-semibold text-ink hover:text-brand"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
