export type SocialLinks = {
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
};

export type CompanyConfig = {
  name: string;
  shortName: string;
  legalName: string | null;
  domain: string;
  url: string;
  phone: string | null;
  generalEmail: string | null;
  salesEmail: string | null;
  vendorEmail: string | null;
  residentEmail: string | null;
  address: string | null;
  businessHours: string | null;
  socials: SocialLinks;
};

export const company: CompanyConfig = {
  name: "TrueFix360",
  shortName: "TrueFix360",
  legalName: null,
  domain: "truefix360.com",
  url: "https://truefix360.com",
  phone: null,
  generalEmail: null,
  salesEmail: null,
  vendorEmail: null,
  residentEmail: null,
  address: null,
  businessHours: null,
  socials: {
    linkedin: null,
    facebook: null,
    instagram: null,
    x: null,
  },
};

export const brandAssets = {
  logo: "/brand/truefix360-logo.png",
} as const;
