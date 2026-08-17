import Link from "next/link";
import { topBarLinks } from "@/config/navigation";

export function TopBar() {
  return (
    <div className="hidden border-b border-white/10 bg-near-black text-[0.72rem] text-muted-dark lg:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-5">
          {topBarLinks.left.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="tracking-wide hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex items-center gap-5">
          {topBarLinks.right.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="tracking-wide hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
