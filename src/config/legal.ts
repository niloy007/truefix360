import { company } from "@/config/company";

/** Public-facing legal copy. Do not invent an entity name or jurisdiction here. */
export const legal = {
  brandName: company.name,
  legalName: company.legalName ?? company.name,
  lastUpdatedLabel: "August 18, 2026",
  lastUpdatedIso: "2026-08-18",
  supportEmail: "support@truefix360.com",
  officeEmail: "office@truefix360.com",
  pages: {
    privacy: { href: "/privacy", label: "Privacy Policy" },
    terms: { href: "/terms", label: "Terms of Service" },
    accessibility: { href: "/accessibility", label: "Accessibility" },
  },
} as const;

export type LegalTocItem = {
  id: string;
  label: string;
};

export const legalRelatedPages = [
  legal.pages.privacy,
  legal.pages.terms,
  legal.pages.accessibility,
] as const;
