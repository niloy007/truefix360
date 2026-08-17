import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: "light" | "dark";
};

export function IconCard({
  title,
  description,
  icon: Icon,
  tone = "light",
}: IconCardProps) {
  const dark = tone === "dark";

  return (
    <article className="flex gap-4">
      <span
        className={cn(
          "mt-0.5 grid size-11 shrink-0 place-items-center rounded-md",
          dark ? "bg-white/8 text-brand" : "bg-cream text-brand",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className={cn("font-heading text-lg font-semibold", dark ? "text-white" : "text-ink")}>
          {title}
        </h3>
        <p className={cn("mt-1.5 text-sm leading-6", dark ? "text-muted-dark" : "text-muted")}>
          {description}
        </p>
      </div>
    </article>
  );
}
