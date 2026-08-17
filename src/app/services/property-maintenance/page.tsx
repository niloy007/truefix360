import { CTASection } from "@/components/ui/CTASection";
import { CheckList } from "@/components/ui/CheckList";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { PageHero } from "@/components/ui/PageHero";
import { images } from "@/config/images";
import { getService } from "@/data/services";
import { pageMetadata } from "@/lib/seo";
import { CalendarClock, Home, PhoneCall, Users } from "lucide-react";

const service = getService("property-maintenance");

export const metadata = pageMetadata({
  title: "Property Maintenance",
  description: service.description,
  path: "/services/property-maintenance",
});

const examples = [
  "A leak, fixture issue, or drain backup",
  "No heat or cooling concern requiring HVAC coordination",
  "Outlet, lighting, or switch repair",
  "Door, lock, or hardware failure",
  "Drywall, paint, or flooring repair",
  "Appliance-related service coordination",
  "Turn / make-ready between occupants",
  "Preventive or recurring maintenance",
];

export default function PropertyMaintenancePage() {
  return (
    <>
      <PageHero
        eyebrow="Property Maintenance"
        title="Occupied Property Maintenance, Coordinated"
        description={service.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Property Maintenance" },
        ]}
        primaryCta={{ href: "/get-a-quote", label: "Request Maintenance" }}
      />
      <section className="section-space bg-white">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <MediaBlock
            src={images.maintenance}
            variant="maintenance"
            alt="Property maintenance technician"
            objectFit="cover"
            objectPosition="center"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3]"
            framed
          />
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Service grid
            </h2>
            <p className="mt-5 text-muted leading-7">
              Maintenance support covers day-to-day repairs and coordination
              across common trades. Exact capability depends on the market and
              the assigned field resource.
            </p>
            <div className="mt-8">
              <CheckList items={service.items} />
            </div>
          </div>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Typical maintenance requests</h2>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {examples.map((item) => (
              <li key={item} className="border border-line bg-white px-4 py-4 text-sm text-ink">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Occupied-property workflow</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { title: "Client request", body: "The property manager or owner submits the work needed." },
              { title: "Resident coordination", body: "If access is required, appointment details are communicated." },
              { title: "Field visit", body: "The assigned professional completes the scoped work." },
              { title: "Close-out", body: "Completion details are returned for the client’s review." },
            ].map((item, index) => (
              <li key={item.title} className="border border-line p-5">
                <span className="font-heading text-sm font-bold text-brand">0{index + 1}</span>
                <h3 className="mt-3 font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={Users}
            title="Resident experience"
            description="Occupied work should be scheduled clearly, completed respectfully, and kept as low-disruption as practical. See the Resident Experience page for details."
          />
          <FeatureCard
            icon={PhoneCall}
            title="Emergency / on-demand"
            description="Urgent work can be coordinated when a client requests it and a suitable field resource is available. Timing depends on location, trade, and demand."
          />
          <FeatureCard
            icon={CalendarClock}
            title="Preventive maintenance"
            description="Recurring work can be coordinated where the property and client process support it."
          />
          <FeatureCard
            icon={Home}
            title="Turns"
            description="Make-ready work between occupants can include repair, cleanup, and readiness tasks."
          />
        </Container>
      </section>
      <CTASection
        title="Request property maintenance support"
        description="Include occupancy status, access notes, and the issue you need addressed."
        primary={{ href: "/get-a-quote", label: "Get a Quote" }}
        secondary={{ href: "/resident-experience", label: "Resident Experience" }}
      />
    </>
  );
}
