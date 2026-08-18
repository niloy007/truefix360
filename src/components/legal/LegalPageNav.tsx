import Link from "next/link";
import { legal } from "@/config/legal";

type LegalPageNavProps = {
  currentHref: string;
};

const relatedPages = [
  legal.pages.privacy,
  legal.pages.terms,
  legal.pages.accessibility,
] as const;

export function LegalPageNav({ currentHref }: LegalPageNavProps) {
  return (
    <nav aria-label="Related legal pages" className="legal-related mt-8 border-t border-line pt-8">
      <p className="font-heading text-xs font-semibold tracking-[0.16em] text-brand uppercase">
        Related pages
      </p>
      <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
        {relatedPages.map((page) => (
          <li key={page.href}>
            {page.href === currentHref ? (
              <span className="text-sm font-semibold text-ink" aria-current="page">
                {page.label}
              </span>
            ) : (
              <Link href={page.href} className="text-sm font-medium text-muted hover:text-brand">
                {page.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
