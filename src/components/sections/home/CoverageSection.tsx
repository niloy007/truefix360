import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { UsaMap } from "@/components/sections/UsaMap";
import { coverageCopy } from "@/data/coverage";

export function CoverageSection() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-30" />
      <Container className="relative grid items-center gap-12 section-space lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Service Coverage</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {coverageCopy.heading}
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-dark sm:text-lg">
            {coverageCopy.summary}
          </p>
          <p className="mt-4 text-sm leading-6 text-muted-dark sm:text-base">
            {coverageCopy.availability}
          </p>
          <p className="mt-4 text-sm leading-6 text-white/85">{coverageCopy.inquiryNote}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/coverage" arrow>
              Explore Our Coverage
            </Button>
            <Button href="/contact?topic=coverage" variant="secondary">
              Request Coverage Information
            </Button>
          </div>
        </div>
        <UsaMap />
      </Container>
    </section>
  );
}
