import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LegalSectionProps = {
  id: string;
  title: string;
  number?: string;
  children: ReactNode;
};

export function LegalSection({ id, title, number, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-3 font-heading text-2xl font-semibold tracking-tight text-ink">
        {number ? (
          <span className="shrink-0 text-xs font-bold tracking-[0.14em] text-brand" aria-hidden="true">
            {number}
          </span>
        ) : null}
        <span>{title}</span>
      </h2>
      <div className="legal-copy mt-4 space-y-4 text-[1.0625rem] leading-[1.75] text-muted">
        {children}
      </div>
    </section>
  );
}

export function LegalList({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2 pl-5", className)}>
      {items.map((item, index) => (
        <li key={index} className="list-disc marker:text-brand">
          {item}
        </li>
      ))}
    </ul>
  );
}
