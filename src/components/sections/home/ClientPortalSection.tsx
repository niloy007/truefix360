import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const features = [
  { title: "Track Service Requests", body: "See submitted requests and current status." },
  { title: "Monitor Work Orders", body: "Follow assigned work from start to finish." },
  { title: "Review Estimates", body: "Review and respond to estimates in one place." },
  { title: "Photos & Documents", body: "Access photos and completion files." },
  { title: "Property Records", body: "Keep property documentation together." },
  { title: "Service Status", body: "Stay current as work moves through the field." },
];

export function ClientPortalSection() {
  return (
    <section className="section-space bg-white">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Client Portal</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Stay Connected From Request to Completion
          </h2>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
            TrueFix360 clients can securely track service requests, monitor work orders, review
            estimates, access property documentation, and follow service progress from one place.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="border border-line bg-cream px-4 py-3">
                <p className="font-heading text-sm font-semibold text-ink">{feature.title}</p>
                <p className="mt-1 text-sm leading-5 text-muted">{feature.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/login" arrow>
              Client Login
            </Button>
            <Button href="/partners" variant="outline">
              Partner With TrueFix360
            </Button>
          </div>
        </div>
        <PortalPreview />
      </Container>
    </section>
  );
}

function PortalPreview() {
  const modules = [
    { title: "Service Requests", body: "Track submitted requests" },
    { title: "Work Orders", body: "Follow job progress" },
    { title: "Estimates", body: "Review and approve" },
    { title: "Documentation", body: "Photos and completion files" },
  ];

  return (
    <div className="border border-line bg-cream p-4 sm:p-6">
      <div className="border border-line bg-ink p-5 text-white">
        <p className="font-heading text-xs font-semibold tracking-[0.16em] text-brand">
          TRUEFIX360 CLIENT PORTAL
        </p>
        <p className="mt-2 text-sm text-muted-dark">
          A secure place to follow work from request through completion.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {modules.map((item) => (
            <div key={item.title} className="border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-dark">{item.body}</p>
            </div>
          ))}
        </div>
        <ol className="mt-5 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-dark">
          <li className="text-white">REQUEST</li>
          <li aria-hidden="true">→</li>
          <li>ASSIGNED</li>
          <li aria-hidden="true">→</li>
          <li>SERVICE</li>
          <li aria-hidden="true">→</li>
          <li className="text-brand">COMPLETE</li>
        </ol>
      </div>
    </div>
  );
}
