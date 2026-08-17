import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { company } from "@/config/company";
import { footerNav } from "@/config/navigation";
import { currentYear, hasValue } from "@/lib/utils";

export function SiteFooter() {
  const year = currentYear();

  return (
    <footer className="bg-near-black text-muted-dark">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md">
          <Logo inverted />
          <p className="mt-5 text-sm leading-6">
            TrueFix360 provides professional property preservation and
            maintenance services through a growing U.S. field-service network.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            {hasValue(company.phone) ? (
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-brand" aria-hidden="true" />
                <a href={`tel:${company.phone}`} className="hover:text-white">
                  {company.phone}
                </a>
              </p>
            ) : null}
            {hasValue(company.generalEmail) ? (
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand" aria-hidden="true" />
                <a href={`mailto:${company.generalEmail}`} className="hover:text-white">
                  {company.generalEmail}
                </a>
              </p>
            ) : null}
          </div>
          <SocialPlaceholders />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-6">
          <FooterColumn title="Services" links={footerNav.services} />
          <FooterColumn title="Clients" links={footerNav.clients} />
          <FooterColumn title="Vendors" links={footerNav.vendors} />
          <FooterColumn title="Residents" links={footerNav.residents} />
          <FooterColumn title="Company" links={footerNav.company} />
          <FooterColumn title="Legal" links={footerNav.legal} />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} TrueFix360. All rights reserved.</p>
          <p>Property preservation and maintenance field services.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="font-heading text-sm font-semibold tracking-wide text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-sm hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialPlaceholders() {
  const items = [
    { label: "LinkedIn", href: company.socials.linkedin, icon: LinkedInMark },
    { label: "Facebook", href: company.socials.facebook, icon: FacebookMark },
    { label: "Instagram", href: company.socials.instagram, icon: InstagramMark },
  ];

  return (
    <ul className="mt-6 flex gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        if (hasValue(item.href)) {
          return (
            <li key={item.label}>
              <a
                href={item.href}
                className="grid size-9 place-items-center rounded-md border border-white/15 text-white hover:border-brand hover:text-brand"
                aria-label={item.label}
              >
                <Icon className="size-4" />
              </a>
            </li>
          );
        }
        return (
          <li key={item.label}>
            <span
              className="grid size-9 place-items-center rounded-md border border-white/10 text-white/35"
              title={`${item.label} profile will be published here`}
              aria-label={`${item.label} profile coming soon`}
            >
              <Icon className="size-4" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M6.5 9H4v11h2.5V9ZM5.25 4A1.75 1.75 0 1 0 5.26 7.5 1.75 1.75 0 0 0 5.25 4ZM20 20h-2.5v-5.6c0-1.9-.7-2.9-2-2.9-1.1 0-1.8.7-2.1 1.4-.1.3-.1.7-.1 1.1V20H11s.1-10.4 0-11H13.5v1.6c.5-.8 1.6-2 3.8-2 2.6 0 4.7 1.7 4.7 5.4V20Z" />
    </svg>
  );
}

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6L16 12h-3V10c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
