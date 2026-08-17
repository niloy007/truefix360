import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { images } from "@/config/images";

const preservationItems = [
  "Securing & lock changes",
  "Property inspections",
  "Debris removal",
  "Lawn maintenance",
  "Winterization",
  "Approved repair work",
];

const maintenanceItems = [
  "Plumbing",
  "HVAC",
  "Electrical",
  "Handyman repairs",
  "Turnovers",
  "General repairs",
];

export function CoreServices() {
  return (
    <section className="section-space bg-cream">
      <Container>
        <SectionHeading
          eyebrow="What We Do"
          title="Professional Property Services From Field to Completion"
          description="TrueFix360 supports both vacant-property preservation and occupied-property maintenance through coordinated field operations."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="flex h-full flex-col border border-line bg-white">
            {/* IMAGE NEEDED
                Filename: property-preservation-service.webp
                Recommended source: 1600x1100
                Crop: approximately 3:2 / 16:11, object-fit cover
                Subject: contractor performing vacant property preservation work
            */}
            <MediaBlock
              src={images.preservation}
              variant="preservation"
              alt="Property preservation field work"
              objectFit="cover"
              objectPosition="center"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/11]"
            />
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h3 className="font-heading text-2xl font-semibold text-ink">Property Preservation</h3>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                Protecting and maintaining vacant, foreclosed, REO, and distressed properties.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {preservationItems.map((item) => (
                  <li key={item} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/services/property-preservation" arrow>
                  Explore Property Preservation
                </Button>
              </div>
            </div>
          </article>
          <article className="flex h-full flex-col border border-line bg-white">
            {/* IMAGE NEEDED
                Filename: property-maintenance-technician.webp
                Recommended source: 1600x1100
                Crop: approximately 3:2 / 16:11, object-fit cover
                Subject: technician performing occupied-property maintenance
            */}
            <MediaBlock
              src={images.maintenance}
              variant="maintenance"
              alt="Property maintenance technician"
              objectFit="cover"
              objectPosition="center"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/11]"
            />
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h3 className="font-heading text-2xl font-semibold text-ink">Property Maintenance</h3>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                Responsive repair and maintenance services for occupied residential and commercial properties.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {maintenanceItems.map((item) => (
                  <li key={item} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/services/property-maintenance" arrow>
                  Explore Property Maintenance
                </Button>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
