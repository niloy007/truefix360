import { VendorApplyForm } from "@/components/forms/VendorApplyForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Vendor Application",
  description:
    "Apply to join the TrueFix360 vendor network. Submitting an application does not guarantee assignments or work volume.",
  path: "/vendors/apply",
});

export default function VendorApplyPage() {
  return (
    <>
      <PageHero
        eyebrow="Vendor Application"
        title="Apply to the TrueFix360 Network"
        description="Complete the sections below. Sensitive tax data is not collected on this public form. Submitting an application does not guarantee assignments or work volume."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Vendors", href: "/vendors" },
          { label: "Apply" },
        ]}
      />
      <section className="section-space bg-cream">
        <Container>
          <div className="border border-line bg-white p-5 sm:p-8 lg:p-10">
            <VendorApplyForm />
          </div>
        </Container>
      </section>
    </>
  );
}
