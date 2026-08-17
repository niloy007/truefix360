import Link from "next/link";
import { ArrowRight, CircleUser, Hammer, House, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const paths = [
  {
    featured: true,
    eyebrow: "Property Services",
    title: "I Need Property Services",
    description:
      "Request professional property preservation or maintenance service for a property or portfolio.",
    href: "/get-a-quote",
    cta: "Request Service",
    icon: House,
  },
  {
    featured: false,
    eyebrow: "Existing Clients",
    title: "Manage My Service Requests",
    description:
      "Access your TrueFix360 client account. Portal capabilities depend on the access provisioned for your account.",
    href: "/login",
    cta: "Client Login",
    icon: CircleUser,
  },
  {
    featured: false,
    eyebrow: "Contractors",
    title: "Join Our Vendor Network",
    description:
      "Contractors and field-service companies can apply to work with TrueFix360 across supported service markets.",
    href: "/vendors/apply",
    cta: "Become a Vendor",
    icon: Hammer,
  },
  {
    featured: false,
    eyebrow: "Residents",
    title: "I Need a Repair",
    description:
      "Residents and property owners can request maintenance or repair service and provide information about the issue.",
    href: "/get-a-quote",
    cta: "Request a Repair Quote",
    icon: Wrench,
  },
];

export function VisitorPaths() {
  return (
    <section className="section-space bg-white">
      <Container>
        <SectionHeading
          title="How Can We Help?"
          description="Choose the path that best matches what you need from TrueFix360."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paths.map((path) => (
            <Link
              key={path.title}
              href={path.href}
              className={cn(
                "group flex h-full flex-col border p-6 transition-transform duration-200 hover:-translate-y-1",
                path.featured
                  ? "orange-edge border-brand/40 bg-cream md:col-span-2 xl:col-span-1"
                  : "border-line bg-white hover:border-brand/50",
              )}
            >
              <path.icon className="size-8 text-brand" aria-hidden="true" />
              <p className="eyebrow mt-5">{path.eyebrow}</p>
              <h3 className="mt-3 font-heading text-xl font-semibold text-ink">{path.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{path.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                {path.cta}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
