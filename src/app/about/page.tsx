import { CTASection } from "@/components/ui/CTASection";
import { CheckList } from "@/components/ui/CheckList";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { PageHero } from "@/components/ui/PageHero";
import { images } from "@/config/images";
import { pageMetadata } from "@/lib/seo";
import { ClipboardCheck, Handshake, MessageSquare, ShieldCheck, Wrench } from "lucide-react";

export const metadata = pageMetadata({
  title: "About",
  description:
    "TrueFix360 coordinates property preservation, maintenance, and field services without the runaround.",
  path: "/about",
});

const values = [
  { title: "Accountability", description: "Work is coordinated with a clear owner and a defined outcome." },
  { title: "Responsiveness", description: "Requests are reviewed and moved forward without unnecessary delay." },
  { title: "Quality", description: "Field work should match the scope and be documented." },
  { title: "Communication", description: "Clients, vendors, and residents get practical updates when they are part of the job." },
  { title: "Practical Solutions", description: "The goal is completed work that fits real property conditions." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About TrueFix360"
        title="Property Service Without the Runaround"
        description="TrueFix360 exists to coordinate preservation and maintenance work with clarity — from the first request through field completion."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
      />
      <section className="section-space bg-white">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Who We Are</p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              A field-service partner for property operations
            </h2>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              TrueFix360 is a property services company. We coordinate
              preservation, maintenance, repairs, inspections, turns, securing,
              debris removal, lawn and exterior work, winterization, plumbing,
              electrical, HVAC coordination, general maintenance, and emergency
              service coordination through a vendor and contractor network.
            </p>
          </div>
          <MediaBlock
            src={images.about}
            variant="about"
            alt="TrueFix360 property services"
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
          <p className="eyebrow mb-4">What We Do</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Preservation + Maintenance
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
            Some properties are vacant and need protection. Others are occupied
            and need repairs that keep them livable and operational. TrueFix360
            is structured around both realities.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <FeatureCard
              icon={ShieldCheck}
              title="Property Preservation"
              description="Securing, winterization, debris, lawn, inspections, and related vacant-property work."
            />
            <FeatureCard
              icon={Wrench}
              title="Property Maintenance"
              description="Recurring and on-demand maintenance for occupied residential and commercial properties."
            />
          </div>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Our Approach</p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Why field coordination matters
            </h2>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              Property work fails when intake, dispatch, field execution, and
              documentation are treated as separate problems. TrueFix360 is
              built to keep those pieces connected.
            </p>
          </div>
          <CheckList
            items={[
              "Clear request intake",
              "Local field resource coordination",
              "Scope-aware execution",
              "Completion records",
              "Resident communication when occupied work requires it",
            ]}
          />
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container>
          <p className="eyebrow mb-4">How We Work</p>
          <h2 className="mb-8 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Core values
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <FeatureCard key={value.title} title={value.title} description={value.description} />
            ))}
          </div>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container className="grid gap-8 md:grid-cols-2">
          <article>
            <Handshake className="size-8 text-brand" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-2xl font-semibold">Clients we support</h2>
            <p className="mt-3 text-muted leading-7">
              Institutional clients, property managers, asset managers, investors,
              landlords, preservation companies, maintenance clients, and
              commercial operators. Resident communication is provided where
              occupied work requires it.
            </p>
          </article>
          <article>
            <ClipboardCheck className="size-8 text-brand" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-2xl font-semibold">Vendor network</h2>
            <p className="mt-3 text-muted leading-7">
              Independent contractors and service companies complete much of the
              field work. TrueFix360 coordinates requirements, coverage, and
              follow-through. Application does not guarantee assignments.
            </p>
          </article>
        </Container>
      </section>
      <section className="border-t border-line bg-cream py-12">
        <Container className="flex items-start gap-4">
          <MessageSquare className="mt-1 size-6 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted">
            Company founding dates, employee counts, certifications, and project
            totals are not published here because they have not been confirmed
            for this website.
          </p>
        </Container>
      </section>
      <CTASection
        title="Talk with the TrueFix360 team"
        description="Share a property need, a partnership question, or a coverage inquiry."
        primary={{ href: "/contact", label: "Contact Us" }}
        secondary={{ href: "/get-a-quote", label: "Get a Quote" }}
      />
    </>
  );
}
