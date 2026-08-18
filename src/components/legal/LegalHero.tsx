import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { legal } from "@/config/legal";

type LegalHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Crumb[];
};

export function LegalHero({ eyebrow, title, description, crumbs }: LegalHeroProps) {
  return (
    <header className="legal-hero relative overflow-hidden bg-ink text-white">
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-brand/12 to-transparent" />
      <div className="absolute bottom-0 left-0 h-1 w-36 bg-brand" />
      <Container className="relative py-8 sm:py-10">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-7 text-muted-dark">{description}</p>
        <p className="mt-5 text-sm text-white/70">
          Last updated:{" "}
          <time dateTime={legal.lastUpdatedIso}>{legal.lastUpdatedLabel}</time>
        </p>
      </Container>
    </header>
  );
}
