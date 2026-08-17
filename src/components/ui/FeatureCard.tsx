import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
  tone?: "light" | "dark";
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  className,
  tone = "light",
}: FeatureCardProps) {
  const dark = tone === "dark";

  return (
    <article
      className={cn(
        "border p-6 transition-transform duration-200 hover:-translate-y-0.5",
        dark ? "border-white/10 bg-white/4" : "border-line bg-white",
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "mb-4 grid size-10 place-items-center rounded-md",
            dark ? "bg-white/8 text-brand" : "bg-cream text-brand",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className={cn("font-heading text-lg font-semibold", dark ? "text-white" : "text-ink")}>
        {title}
      </h3>
      <p className={cn("mt-2 text-sm leading-6", dark ? "text-muted-dark" : "text-muted")}>
        {description}
      </p>
    </article>
  );
}
