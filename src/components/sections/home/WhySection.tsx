import { ClipboardCheck, FileText, MapPinned, Network, ShieldCheck, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Preservation + Maintenance",
    body: "Support for both vacant-property preservation and occupied-property maintenance.",
  },
  {
    icon: Network,
    title: "Field Coordination",
    body: "Centralized coordination between service requests and field professionals.",
  },
  {
    icon: ClipboardCheck,
    title: "Documentation",
    body: "Field photos and service information help document work performed.",
  },
  {
    icon: FileText,
    title: "Client Visibility",
    body: "Available service information can be kept organized through client-facing workflows.",
  },
  {
    icon: Wrench,
    title: "Estimate Support",
    body: "Field findings can support repair recommendations and estimates when additional work is identified.",
  },
  {
    icon: MapPinned,
    title: "Expanding Coverage",
    body: "A growing field network supports service expansion into additional U.S. markets.",
  },
];

export function WhySection() {
  return (
    <section className="section-space bg-cream">
      <Container>
        <SectionHeading
          eyebrow="Why TrueFix360"
          title="Field Operations Built Around Accountability"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <article key={reason.title} className="border border-line bg-white p-6">
              <reason.icon
                className="size-8 shrink-0 text-brand"
                width={32}
                height={32}
                aria-hidden="true"
              />
              <h3 className="mt-5 font-heading text-xl font-semibold text-ink">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{reason.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
