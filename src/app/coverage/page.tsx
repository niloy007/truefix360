import { CoverageInquiryForm } from "@/components/forms/CoverageInquiryForm";
import { UsaMap } from "@/components/sections/UsaMap";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { coverageCopy, coverageMarkets } from "@/data/coverage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Coverage",
  description:
    "TrueFix360 coordinates field services through a growing network. Request coverage information for a specific market.",
  path: "/coverage",
});

export default function CoveragePage() {
  return (
    <>
      <PageHero
        eyebrow="Coverage"
        title="Service Coverage Built Around Local Capability"
        description={coverageCopy.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Coverage" },
        ]}
        primaryCta={{ href: "#coverage-inquiry", label: "Request Coverage Information" }}
      />
      <section className="section-space bg-white">
        <Container className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              How coverage works
            </h2>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              TrueFix360 does not invent nationwide coverage. Work is coordinated
              through local field resources in active service markets. If you need
              a new area, send the location and the team will review capability.
            </p>
            <div className="mt-8 overflow-x-auto border border-line">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="bg-cream">
                  <tr>
                    <th className="px-4 py-3 font-heading">Market</th>
                    <th className="px-4 py-3 font-heading">State</th>
                    <th className="px-4 py-3 font-heading">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coverageMarkets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-muted">
                        {coverageCopy.emptyState}
                      </td>
                    </tr>
                  ) : (
                    coverageMarkets.map((market) => (
                      <tr key={market.id} className="border-t border-line">
                        <td className="px-4 py-3">{market.region ?? market.state}</td>
                        <td className="px-4 py-3">{market.stateCode}</td>
                        <td className="px-4 py-3 capitalize">{market.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <UsaMap />
        </Container>
      </section>
      <section id="coverage-inquiry" className="section-space scroll-mt-28 bg-cream">
        <Container width="narrow">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Need coverage here?
          </h2>
          <p className="mt-4 text-muted leading-7">
            Share a city, county, or state. This inquiry is validated by the
            website; production delivery is connected in a later phase.
          </p>
          <div className="mt-8 border border-line bg-white p-6 sm:p-8">
            <CoverageInquiryForm />
          </div>
        </Container>
      </section>
      <CTASection
        title="Ready to request work in an active market?"
        primary={{ href: "/get-a-quote", label: "Get a Quote" }}
        secondary={{ href: "/contact", label: "Contact Us" }}
      />
    </>
  );
}
