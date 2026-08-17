import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Request",
    body: "A client submits a property service or repair request.",
  },
  {
    number: "02",
    title: "Review",
    body: "TrueFix360 reviews the location, scope, priority, and service requirements.",
  },
  {
    number: "03",
    title: "Coordinate",
    body: "The appropriate field professional is coordinated based on trade and service coverage.",
  },
  {
    number: "04",
    title: "Complete",
    body: "The assigned field service is performed with required documentation and communication.",
  },
  {
    number: "05",
    title: "Report",
    body: "Work details and supporting documentation are returned for client review.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-space bg-white">
      <Container>
        <SectionHeading
          eyebrow="Our Process"
          title="From Request to Completion"
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {steps.map((step) => (
            <li key={step.number} className="border border-line bg-cream p-5">
              <span className="font-heading text-3xl font-bold text-brand">{step.number}</span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-muted">
          Already working with TrueFix360?{" "}
          <Link href="/login" className="font-semibold text-ink hover:text-brand">
            Client Login →
          </Link>
        </p>
      </Container>
    </section>
  );
}
