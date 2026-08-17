import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-40" />
      <Container className="relative py-24 sm:py-32">
        <p className="eyebrow mb-4">404</p>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Looks Like This Property Is Off the Map.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-dark sm:text-lg">
          The page you&apos;re looking for may have moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/" arrow>
            Return Home
          </Button>
          <Button href="/contact" variant="secondary">
            Contact Us
          </Button>
        </div>
      </Container>
    </section>
  );
}
