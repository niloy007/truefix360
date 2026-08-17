import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function PartnersSection() {
  return (
    <section className="section-space bg-white">
      <Container className="max-w-3xl">
        <p className="eyebrow mb-4">Partners</p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Supporting Property Operations From Field to Completion
        </h2>
        <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
          TrueFix360 supports organizations that need responsive field
          coordination, clear communication, and documented property-service
          results.
        </p>
        <div className="mt-8">
          <Button href="/partners" arrow>
            Work With TrueFix360
          </Button>
        </div>
      </Container>
    </section>
  );
}
