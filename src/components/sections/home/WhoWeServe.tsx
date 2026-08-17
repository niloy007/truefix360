import { Building2, Landmark, ShieldCheck, Warehouse } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const audiences = [
  {
    icon: Building2,
    title: "Property Managers",
    description: "Responsive maintenance support for residential and commercial properties.",
  },
  {
    icon: ShieldCheck,
    title: "Property Preservation Companies",
    description: "Field-service support for vacant, foreclosed, REO, and distressed properties.",
  },
  {
    icon: Landmark,
    title: "Asset & REO Managers",
    description: "Preservation, inspection, repair, bid, and documentation coordination.",
  },
  {
    icon: Warehouse,
    title: "Commercial & Residential Portfolios",
    description: "Service coordination across active coverage markets.",
  },
];

export function WhoWeServe() {
  return (
    <section className="section-space bg-cream">
      <Container>
        <SectionHeading
          eyebrow="Who We Serve"
          title="Built for Property Operations"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {audiences.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
