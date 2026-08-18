import type { LegalTocItem } from "@/config/legal";

type LegalTableOfContentsProps = {
  items: readonly LegalTocItem[];
};

export function LegalTableOfContents({ items }: LegalTableOfContentsProps) {
  return (
    <>
      <details className="legal-toc mb-8 rounded-md border border-line bg-cream lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 font-heading text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            On this page
            <span className="text-brand" aria-hidden="true">
              +
            </span>
          </span>
        </summary>
        <nav aria-label="On this page" className="border-t border-line px-4 py-3">
          <TocList items={items} />
        </nav>
      </details>
      <aside className="legal-toc hidden lg:block">
        <div className="sticky top-28">
          <p className="font-heading text-xs font-semibold tracking-[0.16em] text-brand uppercase">
            On this page
          </p>
          <nav aria-label="On this page" className="mt-3">
            <TocList items={items} />
          </nav>
        </div>
      </aside>
    </>
  );
}

function TocList({ items }: { items: readonly LegalTocItem[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block text-sm leading-5 text-muted hover:text-ink"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}
