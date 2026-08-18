import type { ReactNode } from "react";
import { LegalContactCard } from "@/components/legal/LegalContactCard";
import { LegalHero } from "@/components/legal/LegalHero";
import { LegalPageNav } from "@/components/legal/LegalPageNav";
import { LegalTableOfContents } from "@/components/legal/LegalTableOfContents";
import { Container } from "@/components/ui/Container";
import type { LegalTocItem } from "@/config/legal";
import type { Crumb } from "@/components/ui/Breadcrumbs";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Crumb[];
  currentHref: string;
  toc: readonly LegalTocItem[];
  contactTitle: string;
  contactDescription: string;
  contactEmails: readonly string[];
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  crumbs,
  currentHref,
  toc,
  contactTitle,
  contactDescription,
  contactEmails,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <LegalHero eyebrow={eyebrow} title={title} description={description} crumbs={crumbs} />
      <section className="bg-white py-8 sm:py-10">
        <Container>
          <div className="lg:hidden">
            <LegalTableOfContents items={toc} />
          </div>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,54rem)_14rem] lg:justify-between">
            <article className="min-w-0 max-w-[54rem]">
              {children}
              <LegalContactCard
                title={contactTitle}
                description={contactDescription}
                emails={contactEmails}
              />
              <LegalPageNav currentHref={currentHref} />
            </article>
            <div className="hidden lg:block">
              <LegalTableOfContents items={toc} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
