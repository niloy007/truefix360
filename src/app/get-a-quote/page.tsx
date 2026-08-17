import { QuoteForm } from "@/components/forms/QuoteForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Get a Quote",
  description:
    "Request property preservation, maintenance, inspection, repair, or turn services from TrueFix360.",
  path: "/get-a-quote",
});

export default function GetAQuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Get a Quote"
        title="Request Service or Pricing Review"
        description="Submitting a request does not constitute acceptance of work or final pricing. Include the property location and a clear description of the work."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Get a Quote" },
        ]}
      />
      <section className="section-space bg-cream">
        <Container width="narrow">
          <div className="border border-line bg-white p-5 sm:p-8">
            <QuoteForm />
          </div>
        </Container>
      </section>
    </>
  );
}
