import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  href: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  tone?: "dark" | "light";
};

export function ServiceCard({
  href,
  title,
  summary,
  icon: Icon,
  tone = "dark",
}: ServiceCardProps) {
  const dark = tone === "dark";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col border p-6 transition-transform duration-200 hover:-translate-y-1",
        dark
          ? "border-white/10 bg-white/3 hover:border-brand/70"
          : "border-line bg-white hover:border-brand/70",
      )}
    >
      <span className="absolute top-0 left-0 h-full w-1 bg-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <span
        className={cn(
          "mb-5 grid size-11 place-items-center rounded-md",
          dark ? "bg-white/8 text-brand" : "bg-cream text-brand",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3
        className={cn(
          "font-heading text-xl font-semibold",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h3>
      <p className={cn("mt-3 flex-1 text-sm leading-6", dark ? "text-muted-dark" : "text-muted")}>
        {summary}
      </p>
      <span
        className={cn(
          "mt-5 inline-flex items-center gap-2 text-sm font-semibold",
          dark ? "text-white" : "text-ink",
        )}
      >
        Learn more
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
