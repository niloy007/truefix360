import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type CTASectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  tertiary?: { href: string; label: string };
  tone?: "dark" | "brand";
};

export function CTASection({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  tertiary,
  tone = "dark",
}: CTASectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        tone === "brand" ? "bg-brand text-white" : "bg-ink text-white",
      )}
    >
      {tone === "dark" ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-brand/25 to-transparent" />
      ) : null}
      <Container className="relative section-space">
        {eyebrow ? <p className="eyebrow mb-4 text-white">{eyebrow}</p> : null}
        <h2 className="max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            href={primary.href}
            variant={tone === "brand" ? "dark" : "primary"}
            arrow
          >
            {primary.label}
          </Button>
          {secondary ? (
            <Button href={secondary.href} variant="secondary">
              {secondary.label}
            </Button>
          ) : null}
        </div>
        {tertiary ? (
          <p className="mt-6">
            <Link
              href={tertiary.href}
              className="text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline"
            >
              {tertiary.label}
            </Link>
          </p>
        ) : null}
      </Container>
    </section>
  );
}
