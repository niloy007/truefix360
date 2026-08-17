import { ClientPortalSection } from "@/components/sections/home/ClientPortalSection";
import { CoreServices } from "@/components/sections/home/CoreServices";
import { CoverageSection } from "@/components/sections/home/CoverageSection";
import { FaqSection } from "@/components/sections/home/FaqSection";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { HowItWorks } from "@/components/sections/home/HowItWorks";
import { PartnersSection } from "@/components/sections/home/PartnersSection";
import { ResidentSection } from "@/components/sections/home/ResidentSection";
import { VendorSection } from "@/components/sections/home/VendorSection";
import { VisitorPaths } from "@/components/sections/home/VisitorPaths";
import { WhoWeServe } from "@/components/sections/home/WhoWeServe";
import { WhySection } from "@/components/sections/home/WhySection";
import { CTASection } from "@/components/ui/CTASection";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <VisitorPaths />
      <CoreServices />
      <CoverageSection />
      <ClientPortalSection />
      <WhoWeServe />
      <HowItWorks />
      <WhySection />
      <VendorSection />
      <ResidentSection />
      <PartnersSection />
      <FaqSection />
      <CTASection
        eyebrow="Let's Get to Work"
        title="Have a Property That Needs Attention?"
        description="From preservation and maintenance to individual repair requests, tell us what you need and where you need it."
        primary={{ href: "/get-a-quote", label: "Request Service" }}
        secondary={{ href: "/login", label: "Client Login" }}
        tertiary={{
          href: "/vendors/apply",
          label: "Contractor? Join the TrueFix360 Vendor Network →",
        }}
        tone="brand"
      />
    </>
  );
}
