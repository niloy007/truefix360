import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homepageFaqs } from "@/data/faqs";

export function FaqSection() {
  return (
    <section className="section-space bg-cream">
      <Container width="narrow">
        <SectionHeading
          eyebrow="FAQ"
          title="Common Questions"
          description="A starting set of answers. More detail lives on the FAQ page."
        />
        <div className="mt-10">
          <FAQAccordion items={homepageFaqs} />
        </div>
        <p className="mt-6 text-sm text-muted">
          Need more detail?{" "}
          <Link href="/faq" className="font-semibold text-ink hover:text-brand">
            View the full FAQ
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
