import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckList({
  items,
  tone = "light",
}: {
  items: readonly string[];
  tone?: "light" | "dark";
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-brand text-white">
            <Check className="size-3.5" aria-hidden="true" />
          </span>
          <span className={cn("text-sm sm:text-[0.95rem]", tone === "dark" ? "text-muted-dark" : "text-ink")}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
