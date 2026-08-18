import { CoverageRequestForm } from "@/components/forms/CoverageRequestForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Request Coverage",
  description: "Ask TrueFix360 to review service coverage for a county and service category.",
  path: "/coverage/request",
});

export default async function CoverageRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; county?: string; service?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Coverage Review"
        title="Request Coverage Review"
        description="Share the location and service needed. Operations will evaluate whether qualified local coverage can be sourced. Submitting a request does not guarantee a crew."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Coverage", href: "/coverage" },
          { label: "Request" },
        ]}
      />
      <section className="section-space bg-cream">
        <Container width="narrow">
          <div className="border border-line bg-white p-6 sm:p-8">
            <CoverageRequestForm
              defaults={{
                state: params.state,
                county: params.county,
                serviceCategory: params.service,
              }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
