import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { getService, overviewCategories } from "@/data/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Property preservation, maintenance, repairs, inspections, exterior services, and turns coordinated by TrueFix360.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="One Network. Multiple Property Service Needs."
        description="TrueFix360 coordinates preservation and maintenance work across vacant and occupied properties, with trade support as the assignment requires."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services" },
        ]}
        primaryCta={{ href: "/get-a-quote", label: "Request Service" }}
      />
      <section className="section-space bg-white">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overviewCategories.map((slug) => {
              const service = getService(slug);
              return (
                <div key={service.slug} id={service.slug === "property-preservation" ? undefined : service.slug}>
                  <ServiceCard
                    href={service.href}
                    title={service.name}
                    summary={service.description}
                    icon={service.icon}
                    tone="light"
                  />
                </div>
              );
            })}
          </div>
        </Container>
      </section>
      {overviewCategories.map((slug) => {
        const service = getService(slug);
        const id =
          slug === "property-preservation"
            ? "preservation"
            : slug === "property-maintenance"
              ? "maintenance"
              : slug;
        return (
          <section
            key={slug}
            id={id}
            className="scroll-mt-28 border-t border-line bg-cream py-16"
          >
            <Container className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
              <div>
                <p className="eyebrow mb-3">{service.shortName}</p>
                <h2 className="font-heading text-3xl font-semibold tracking-tight">{service.name}</h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{service.description}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {service.items.map((item) => (
                    <li key={item} className="text-sm text-ink">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Button href={service.href} arrow>
                View {service.shortName}
              </Button>
            </Container>
          </section>
        );
      })}
      <CTASection
        title="Need a category that is not listed?"
        description="Tell us the property type, occupancy, and work required. We will review how it can be coordinated."
        primary={{ href: "/get-a-quote", label: "Get a Quote" }}
        secondary={{ href: "/contact", label: "Contact Us" }}
      />
    </>
  );
}
