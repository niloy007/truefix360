import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { images } from "@/config/images";

const categories = [
  "Plumbing",
  "HVAC",
  "Electrical",
  "General Repair",
  "Handyman",
  "Exterior Maintenance",
];

export function ResidentSection() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow mb-4">For Residents & Property Owners</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Need Something Fixed?
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            Tell TrueFix360 what is happening at the property and request repair
            or maintenance support. Include the location, issue details, and
            available photos to help our team review the request.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {categories.map((item) => (
              <li key={item} className="border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/get-a-quote" arrow>
              Request a Repair Quote
            </Button>
            <Button href="/residents" variant="outline">
              Resident Information
            </Button>
          </div>
        </div>
        {/* IMAGE NEEDED
            Filename: resident-repair-service.webp
            Recommended source: 1600x1100
            Crop: approximately 3:2, object-fit cover
            Subject: respectful occupied-home repair visit
        */}
        <MediaBlock
          src={images.residentService}
          variant="resident"
          alt="Occupied property repair visit"
          objectFit="cover"
          objectPosition="center"
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="aspect-[16/11] max-h-72"
        />
      </Container>
    </section>
  );
}
