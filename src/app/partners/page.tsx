import { CTASection } from "@/components/ui/CTASection";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";
import {
  Building2,
  ClipboardCheck,
  Handshake,
  MapPinned,
  MessageSquare,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const metadata = pageMetadata({
  title: "Partners",
  description:
    "TrueFix360 is a field service partner for property managers, asset managers, investors, landlords, and preservation teams.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="A Field Service Partner Built for Property Operations"
        description="TrueFix360 supports teams that need preservation, maintenance, and related field work coordinated with clear communication."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Partners" },
        ]}
        primaryCta={{ href: "/contact", label: "Talk to Our Team" }}
      />
      <section className="section-space bg-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Who we support</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Property preservation companies",
              "Property management companies",
              "Asset managers",
              "REO / default servicing teams",
              "Investors",
              "Landlords",
              "Commercial property operators",
            ].map((title) => (
              <FeatureCard key={title} title={title} description="Service coordination aligned to the property’s occupancy and the work required." />
            ))}
          </div>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Why partner with us</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <FeatureCard icon={ShieldCheck} title="Preservation support" description="Vacant and at-risk property work including securing, winterization, debris, lawn, and inspections." />
            <FeatureCard icon={Wrench} title="Maintenance support" description="Occupied-property repairs and recurring maintenance through coordinated field resources." />
            <FeatureCard icon={MessageSquare} title="Communication" description="Intake, status, and completion details intended to keep property teams informed." />
            <FeatureCard icon={Handshake} title="Vendor coordination" description="Independent contractors and service companies complete field work under coordinated requirements." />
            <FeatureCard icon={MapPinned} title="Coverage expansion" description="The network continues to expand across active service markets. New areas can be reviewed on request." />
            <FeatureCard icon={ClipboardCheck} title="Documentation" description="Completion records and photo documentation are part of how work is returned." />
          </div>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container className="max-w-3xl">
          <Building2 className="size-8 text-brand" aria-hidden="true" />
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
            What partners can expect
          </h2>
          <p className="mt-5 text-muted leading-7">
            Responsiveness, communication, documentation, service coordination,
            field execution, and scalable vendor coverage. Client logos and
            testimonials are not shown because they have not been provided for
            this website.
          </p>
        </Container>
      </section>
      <CTASection
        title="Talk to our team"
        description="Share portfolio type, typical work, and the markets you need."
        primary={{ href: "/contact", label: "Talk to Our Team" }}
        secondary={{ href: "/get-a-quote", label: "Get a Quote" }}
      />
    </>
  );
}
