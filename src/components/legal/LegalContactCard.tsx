type LegalContactCardProps = {
  title: string;
  description: string;
  emails: readonly string[];
};

export function LegalContactCard({ title, description, emails }: LegalContactCardProps) {
  return (
    <section className="mt-4 border border-line bg-cream p-6 sm:p-8">
      <p className="eyebrow">Contact</p>
      <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-xl text-[1.05rem] leading-7 text-muted">{description}</p>
      <ul className="mt-5 space-y-2">
        {emails.map((email) => (
          <li key={email}>
            <a
              href={`mailto:${email}`}
              className="break-all font-medium text-ink underline decoration-brand/40 underline-offset-4 hover:text-brand"
            >
              {email}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
