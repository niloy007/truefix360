"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function AdminTabs({
  tabs,
}: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={cn(
              "shrink-0 px-3 py-2 text-sm font-semibold",
              active === tab.id ? "border-b-2 border-brand text-ink" : "text-muted hover:text-ink",
            )}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {tabs.find((tab) => tab.id === active)?.content}
      </div>
    </div>
  );
}
