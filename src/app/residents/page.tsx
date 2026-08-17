import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PageHero } from "@/components/ui/PageHero";
import { company } from "@/config/company";
import { hasValue } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { Calendar, DoorOpen, PawPrint, Phone, Shield, Wrench } from "lucide-react";

export const metadata = pageMetadata({
  title: "Residents",
  description:
    "Information for residents whose property manager or owner has requested maintenance through TrueFix360.",
  path: "/residents",
});

export default function ResidentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Residents"
        title="We're Here to Make Property Service Easier"
        description="If your property manager or the property owner requested maintenance, TrueFix360 may contact you about scheduling and access. TrueFix360 does not own or manage your lease."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Residents" },
        ]}
        primaryCta={{ href: "/resident-experience", label: "Resident Experience" }}
        secondaryCta={{ href: "/contact?topic=resident", label: "Contact Resident Support" }}
      />
      <section className="section-space bg-white">
        <Container>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Why TrueFix360 may contact you
          </h2>
          <p className="mt-5 max-w-3xl text-muted leading-7">
            Property managers and owners sometimes ask TrueFix360 to complete
            repairs or maintenance at an occupied property. Contact is typically
            about appointment time, access, pets, parking, or the work itself.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Calendar} title="Scheduling" description="You may receive a call, text, or email to confirm a service window." />
            <FeatureCard icon={DoorOpen} title="Technician access" description="Someone 18 or older may need to be present, or access instructions may be arranged through the property contact." />
            <FeatureCard icon={PawPrint} title="Pets" description="Please secure pets before the technician arrives unless the appointment notes say otherwise." />
            <FeatureCard icon={Wrench} title="Appointment expectations" description="The technician should complete the requested work area and treat the property with care." />
            <FeatureCard icon={Phone} title="Rescheduling" description="Use the contact method in your appointment message, or Resident Support if a channel has been published." />
            <FeatureCard icon={Shield} title="Safety" description="You should never be asked for rent payment, lease changes, or unusual personal financial information by a technician." />
          </div>
        </Container>
      </section>
      <section className="section-space bg-cream">
        <Container className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Parking and access</h2>
            <p className="mt-4 text-muted leading-7">
              Share gate codes, parking limits, or building access notes when you
              confirm the appointment. If you cannot provide access, tell the
              scheduler as early as practical.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">After service</h2>
            <p className="mt-4 text-muted leading-7">
              If something was left incomplete or a new issue appeared, report it
              through your property manager or the property contact who requested
              the work. TrueFix360 can also be contacted if you were given a
              TrueFix360 support channel for that visit.
            </p>
          </div>
        </Container>
      </section>
      <section className="border-t border-line bg-white py-12">
        <Container>
          {hasValue(company.residentEmail) ? (
            <Button href={`mailto:${company.residentEmail}`} arrow>
              Email Resident Support
            </Button>
          ) : (
            <p className="text-sm text-muted">
              A dedicated resident support email will appear here once it is
              published in company configuration. Until then, use the contact
              form and choose Resident Question.
            </p>
          )}
        </Container>
      </section>
      <CTASection
        title="Need help with an appointment?"
        primary={{ href: "/contact?topic=resident", label: "Contact Resident Support" }}
        secondary={{ href: "/resident-experience", label: "How Appointments Work" }}
      />
    </>
  );
}
