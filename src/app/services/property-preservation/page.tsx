import { CTASection } from "@/components/ui/CTASection";
import { CheckList } from "@/components/ui/CheckList";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { PageHero } from "@/components/ui/PageHero";
import { images } from "@/config/images";
import { getService } from "@/data/services";
import { pageMetadata } from "@/lib/seo";
import { ClipboardCheck, ShieldAlert, Snowflake } from "lucide-react";

const service = getService("property-preservation");

export const metadata = pageMetadata({
  title: "Property Preservation",
  description: service.description,
  path: "/services/property-preservation",
});

const conditions = [
  "Recently vacated properties",
  "Foreclosed or bank-owned assets",
  "Investor-held vacant homes",
  "Properties awaiting sale, conveyance, or the next occupant",
  "Sites needing securing, winterization, or debris removal",
];

const workflow = [
  { title: "Intake", body: "Location, occupancy, and requested preservation tasks are reviewed." },
  { title: "Dispatch", body: "A suitable field resource is coordinated for the work." },
  { title: "Field work", body: "Securing, winterization, cleaning, lawn, or related tasks are completed as scoped." },
  { title: "Documentation", body: "Photos and completion notes are returned for client review." },
];

export default function PropertyPreservationPage() {
  return (
    <>
      <PageHero
        eyebrow="Property Preservation"
        title="Protecting Vacant and At-Risk Properties"
        description={service.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Property Preservation" },
        ]}
        primaryCta={{ href: "/get-a-quote", label: "Request Preservation Service" }}
      />
      <section className="section-space bg-white">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Overview</h2>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              Preservation work is about keeping a property secure, reasonably
              maintained, and documented while it is vacant or otherwise at risk.
              TrueFix360 coordinates the field tasks commonly required between
              occupancy, sale, or conveyance.
            </p>
          </div>
          <MediaBlock
            src={images.preservation}
            variant="preservation"
            alt="Property preservation field work"
            objectFit="cover"
            objectPosition="center"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3]"
            framed
          />
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Preservation services</h2>
          <div className="mt-8">
            <CheckList items={service.items} />
          </div>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Typical property conditions</h2>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {conditions.map((item) => (
              <li key={item} className="border border-line bg-cream px-4 py-4 text-sm text-ink">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="section-space bg-ink text-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Workflow</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {workflow.map((item, index) => (
              <li key={item.title} className="border border-white/10 p-5">
                <span className="text-brand font-heading text-sm font-bold">0{index + 1}</span>
                <h3 className="mt-3 font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-dark">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={ClipboardCheck} title="Documentation" description="Completion notes and photo documentation are part of how work is returned for review." />
          <FeatureCard icon={ShieldAlert} title="Hazard reporting" description="Field observations that affect safety or next steps can be reported with the assignment." />
          <FeatureCard icon={Snowflake} title="Seasonal protection" description="Winterization and de-winterization can be coordinated when the property and climate require it." />
        </Container>
      </section>
      <CTASection
        title="Need preservation coverage in a specific market?"
        description="Share the property location and we will review local capability."
        primary={{ href: "/coverage", label: "View Coverage" }}
        secondary={{ href: "/contact", label: "Contact Us" }}
      />
      <CTASection
        tone="brand"
        title="Request property preservation support"
        description="Tell us the address, occupancy status, and the work needed."
        primary={{ href: "/get-a-quote", label: "Get a Quote" }}
        secondary={{ href: "/contact", label: "Talk to the Team" }}
      />
    </>
  );
}
