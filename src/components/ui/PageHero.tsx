import { Button } from "@/components/ui/Button";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  compact?: boolean;
};

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  primaryCta,
  secondaryCta,
  compact = false,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-brand/15 to-transparent" />
      <div className="absolute bottom-0 left-0 h-1 w-40 bg-brand" />
      <Container className={cn("relative py-16 sm:py-20", compact && "py-12 sm:py-16")}>
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-dark sm:text-lg">
            {description}
          </p>
        ) : null}
        {primaryCta || secondaryCta ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {primaryCta ? (
              <Button href={primaryCta.href} arrow>
                {primaryCta.label}
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button href={secondaryCta.href} variant="secondary">
                {secondaryCta.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
