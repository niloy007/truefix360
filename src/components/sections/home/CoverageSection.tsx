import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { USCoverageMap } from "@/components/coverage/USCoverageMap";

export function CoverageSection() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-30" />
      <Container className="relative grid items-center gap-12 section-space lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Active & Growing Service Network</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            North Carolina · Texas · Georgia · Ohio · Washington
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-dark sm:text-lg">
            TrueFix360 maintains an active and growing field-service network in these markets.
            Coverage varies by county and service category.
          </p>
          <p className="mt-4 text-sm leading-6 text-white/85">
            Highlighted states are strategic markets, not a claim that every county or every
            service is currently covered.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/coverage" arrow>
              View Coverage
            </Button>
            <Button href="/coverage/request" variant="secondary">
              Need Another Area?
            </Button>
          </div>
        </div>
        <div className="min-w-0">
          <USCoverageMap variant="homepage" />
        </div>
      </Container>
    </section>
  );
}
