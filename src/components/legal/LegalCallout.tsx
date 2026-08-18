import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LegalCalloutProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function LegalCallout({ title, children, className }: LegalCalloutProps) {
  return (
    <aside
      className={cn(
        "border-l-2 border-brand bg-cream px-5 py-4",
        className,
      )}
    >
      <p className="font-heading text-xs font-semibold tracking-[0.16em] text-brand uppercase">
        {title}
      </p>
      <div className="mt-3 space-y-2 text-[0.98rem] leading-7 text-ink">{children}</div>
    </aside>
  );
}
