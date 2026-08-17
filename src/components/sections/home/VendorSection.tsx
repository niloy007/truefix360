import { MapPinned, NotebookPen, Settings2, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { images } from "@/config/images";

const trades = [
  "Property Preservation",
  "General Maintenance",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Handyman",
  "Landscaping",
  "Cleaning",
  "Locksmith",
  "General Field Services",
];

const benefits = [
  {
    icon: MapPinned,
    title: "Choose Your Coverage",
    description: "Tell TrueFix360 which markets you service.",
  },
  {
    icon: Settings2,
    title: "Choose Your Capabilities",
    description: "Work within the trades and service categories your company handles.",
  },
  {
    icon: NotebookPen,
    title: "Clear Requirements",
    description: "Review work requirements and service information before performing assignments.",
  },
  {
    icon: Waypoints,
    title: "Ongoing Opportunities",
    description: "Build a long-term working relationship with the TrueFix360 network.",
  },
];

export function VendorSection() {
  return (
    <section className="relative overflow-hidden bg-near-black text-white">
      <div className="grid lg:grid-cols-2">
        {/* IMAGE NEEDED
            Filename: truefix360-vendor-network.webp
            Recommended source: 1600x1200
            Crop: portrait/tall split, object-fit cover, subject centered-high
            Subject: contractor, field technician, preservation crew, or maintenance professional
        */}
        <MediaBlock
          src={images.vendorNetwork}
          variant="vendor"
          alt="Independent contractors and field technicians"
          objectFit="cover"
          objectPosition="center top"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-72 lg:min-h-full"
        />
        <div className="section-space px-5 sm:px-8 lg:px-12">
          <p className="eyebrow mb-4">TrueFix360 Vendor Network</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Skilled Contractors. Better Opportunities.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-dark sm:text-lg">
            TrueFix360 works with independent contractors and service companies
            across property preservation, maintenance, and specialty trades.
            Join our field network and receive opportunities that match your
            coverage and capabilities. Submitting an application does not
            guarantee assignments or work volume.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {trades.map((trade) => (
              <li
                key={trade}
                className="border border-white/15 px-3 py-1.5 text-xs font-medium tracking-wide text-white/85"
              >
                {trade}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                tone="dark"
              />
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/vendors/apply" arrow>
              Join Our Vendor Network
            </Button>
            <Button href="/vendors" variant="secondary">
              Learn More About Vendors
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
