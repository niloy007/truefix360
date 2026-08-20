import Link from "next/link";
import { topBar } from "@/config/navigation";

export function TopBar() {
  return (
    <div className="hidden border-b border-white/10 bg-near-black text-[0.7rem] text-muted-dark lg:block">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <p className="truncate tracking-wide text-muted-dark/90">{topBar.tagline}</p>
        <ul className="flex shrink-0 items-center gap-1">
          {topBar.links.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 ? (
                <span className="px-1 text-white/20" aria-hidden="true">
                  |
                </span>
              ) : null}
              <Link
                href={item.href}
                className="tracking-wide text-muted-dark transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
