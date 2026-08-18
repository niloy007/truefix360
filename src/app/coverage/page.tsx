import Link from "next/link";
import { CoverageChecker } from "@/components/coverage/CoverageChecker";
import { USCoverageMap } from "@/components/coverage/USCoverageMap";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { stateName } from "@/lib/coverage/logic";
import { getPublicMarketCards } from "@/lib/coverage/service";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Service Coverage",
  description:
    "Check TrueFix360 property preservation and property maintenance service coverage across active and growing markets including North Carolina, Texas, Georgia, Ohio, and Washington.",
  path: "/coverage",
});

export default async function CoveragePage() {
  const cards = await getPublicMarketCards();

  return (
    <>
      <PageHero
        eyebrow="TrueFix360 Service Network"
        title="Find Coverage Where You Need It"
        description="TrueFix360 maintains an active and growing property-service network across North Carolina, Texas, Georgia, Ohio, and Washington. Coverage varies by county and service category."
        crumbs={[{ label: "Home", href: "/" }, { label: "Coverage" }]}
        primaryCta={{ href: "#coverage-checker", label: "Check Coverage" }}
        secondaryCta={{ href: "/coverage/request", label: "Request Coverage" }}
      />
      <section className="section-space bg-white">
        <Container className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Active and growing markets</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Highlighted states are TrueFix360 active or growing markets. That does not mean every county or every service in those states is currently covered.
            </p>
            <div className="mt-8">
              <USCoverageMap variant="coverage" />
            </div>
          </div>
          <div id="coverage-checker">
            <CoverageChecker />
          </div>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Market states</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
              <Link
                key={card.state_code}
                href={`/coverage?state=${card.state_code}#coverage-checker`}
                className="border border-line bg-white p-5 hover:border-brand"
              >
                <p className="font-heading text-lg font-semibold">{card.state_name || stateName(card.state_code)}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">Active / growing market</p>
                <p className="mt-3 text-sm text-muted">
                  {card.verifiedCounties > 0
                    ? `${card.verifiedCounties} verified ${card.verifiedCounties === 1 ? "county" : "counties"} · ${card.serviceCategories} service ${card.serviceCategories === 1 ? "category" : "categories"}`
                    : "Coverage varies by county and service."}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <section className="section-space bg-white">
        <Container width="narrow" className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">Don&apos;t see your area?</h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Our field network continues to expand. Tell us where you need service and what type of work is required. TrueFix360 will review the request and determine whether qualified local coverage can be sourced.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/coverage/request" className="inline-flex h-12 items-center bg-brand px-5 text-sm font-semibold text-white">Request Coverage</Link>
            <Link href="/contact" className="inline-flex h-12 items-center border border-ink px-5 text-sm font-semibold">Contact Our Team</Link>
          </div>
        </Container>
      </section>
      <CTASection
        title="Need work in an established market?"
        primary={{ href: "/get-a-quote", label: "Get a Quote" }}
        secondary={{ href: "/contact", label: "Contact Us" }}
      />
    </>
  );
}
