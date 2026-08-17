import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function ClientPortalSection() {
  return (
    <section className="section-space bg-white">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Client Portal</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Stay Connected to Your Service Requests
          </h2>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
            Existing TrueFix360 clients can access the client portal when an
            account has been provisioned. This website currently provides the
            branded sign-in entry point. A full request-tracking dashboard is
            not connected yet.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/login" arrow>
              Client Login
            </Button>
            <Button href="/get-a-quote" variant="outline">
              Request Service
            </Button>
          </div>
        </div>
        <PortalPreview />
      </Container>
    </section>
  );
}

function PortalPreview() {
  return (
    <div className="border border-line bg-cream p-4 sm:p-6">
      {/* IMAGE NEEDED
          Filename: truefix360-client-portal.webp
          Recommended source: 1600x1000
          Crop: landscape ~8:5, object-fit cover / contain in frame
          Subject: polished screenshot of the ACTUAL client portal once it exists.
          Do not invent dashboard metrics, names, or work-order numbers.
      */}
      <div className="border border-line bg-ink p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-heading text-xs font-semibold tracking-wide text-white">
            TrueFix360 Client Portal
          </span>
          <span className="text-[0.65rem] uppercase tracking-wider text-muted-dark">
            Entry point
          </span>
        </div>
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div className="space-y-2">
            <div className="h-2 bg-white/15" />
            <div className="h-2 w-3/4 bg-white/10" />
            <div className="h-2 w-2/3 bg-white/10" />
            <div className="h-2 w-4/5 bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-10 border border-white/10 bg-white/5" />
            <div className="h-10 border border-white/10 bg-white/5" />
            <div className="h-10 border border-white/10 bg-white/5" />
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-dark">
          Visual placeholder only. No live account data is displayed.
        </p>
      </div>
      <p className="mt-3 text-sm text-muted">
        Need access?{" "}
        <Link href="/contact" className="font-semibold text-ink hover:text-brand">
          Contact TrueFix360
        </Link>
      </p>
    </div>
  );
}
