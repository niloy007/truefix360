import Link from "next/link";
import { House, MapPinned, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaBlock } from "@/components/ui/MediaBlock";
import { images } from "@/config/images";

const capabilities = [
  { icon: ShieldCheck, label: "Property Preservation" },
  { icon: Wrench, label: "Property Maintenance" },
  { icon: MapPinned, label: "U.S. Field Coverage" },
  { icon: House, label: "Client Service Tracking" },
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0">
        {/* IMAGE NEEDED
            Filename: truefix360-field-service-hero.webp
            Recommended source: 1920x1080
            Crop: landscape, object-fit cover, subject right-weighted
            Subject: technician inspecting a property or contractor performing maintenance
            Avoid: boardroom, handshake, call center, generic real-estate agent imagery
        */}
        <MediaBlock
          src={images.hero}
          variant="hero"
          alt=""
          objectFit="cover"
          objectPosition="right center"
          sizes="100vw"
          priority
          className="h-full min-h-[36rem] opacity-55"
        />
        <div className="absolute inset-0 bg-linear-to-r from-near-black via-ink/88 to-ink/50" />
      </div>
      <Container className="relative grid min-h-[34rem] items-center py-16 lg:min-h-[40rem] lg:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6 text-white/90">
            Property Preservation • Property Maintenance
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Preservation. Maintenance. One Reliable Field Network.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-dark sm:text-lg">
            TrueFix360 provides professional property preservation and
            maintenance services through a growing U.S. field-service network.
            We coordinate field operations, communication, documentation,
            repair requests, and property services from assignment through
            completion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/get-a-quote" arrow>
              Request Service
            </Button>
            <Button href="/services" variant="secondary">
              Explore Our Services
            </Button>
          </div>
          <div className="mt-6 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
            <Link href="/login" className="font-semibold text-white/85 hover:text-white">
              Already a client? Client Login →
            </Link>
            <Link href="/vendors/apply" className="font-semibold text-white/85 hover:text-white">
              Contractor? Join Our Vendor Network →
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {capabilities.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium tracking-wide text-white/85 sm:text-sm"
              >
                <item.icon
                  className="size-4 shrink-0 text-brand"
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="absolute bottom-0 left-0 h-1.5 w-48 bg-brand" />
    </section>
  );
}
