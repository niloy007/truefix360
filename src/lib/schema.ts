import { company } from "@/config/company";
import { site } from "@/config/site";
import { hasValue } from "@/lib/utils";

export function organizationJsonLd(): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.url,
    description: site.description,
    logo: `${company.url}/brand/truefix360-logo.png`,
  };

  if (hasValue(company.legalName)) {
    data.legalName = company.legalName;
  }

  const emails = [
    company.generalEmail,
    company.salesEmail,
    company.vendorEmail,
    company.residentEmail,
  ].filter(hasValue);

  if (emails.length > 0) {
    data.email = emails[0];
  }

  if (hasValue(company.phone)) {
    data.telephone = company.phone;
  }

  if (hasValue(company.address)) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: company.address,
    };
  }

  const sameAs = Object.values(company.socials).filter(hasValue);
  if (sameAs.length > 0) {
    data.sameAs = sameAs;
  }

  return data;
}
