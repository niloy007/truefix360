import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PageHero } from "@/components/ui/PageHero";
import { faqCategories } from "@/data/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers about TrueFix360 services, coverage, clients, vendors, residents, and quotes.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions About TrueFix360"
        description="Organized by services, coverage, clients, vendors, residents, and quotes."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ" },
        ]}
      />
      <section className="section-space bg-white">
        <Container className="space-y-14">
          {faqCategories.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-28">
              <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight">
                {category.title}
              </h2>
              <FAQAccordion items={category.items} />
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
