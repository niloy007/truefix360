export type NavChild = {
  label: string;
  href: string;
  description?: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Property Preservation",
        href: "/services/property-preservation",
        description: "Vacant and at-risk property protection.",
      },
      {
        label: "Property Maintenance",
        href: "/services/property-maintenance",
        description: "Occupied property maintenance support.",
      },
      {
        label: "All Services",
        href: "/services",
        description: "Full property-service overview.",
      },
    ],
  },
  { label: "Coverage", href: "/coverage" },
  { label: "Partners", href: "/partners" },
  { label: "Residents", href: "/residents" },
  {
    label: "Vendors",
    href: "/vendors",
    children: [
      {
        label: "Vendor Network",
        href: "/vendors",
        description: "How the vendor network operates.",
      },
      {
        label: "Apply to Join",
        href: "/vendors/apply",
        description: "Apply to work with TrueFix360.",
      },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export const topBarLinks = {
  left: [
    { label: "Property Preservation", href: "/services/property-preservation" },
    { label: "Property Maintenance", href: "/services/property-maintenance" },
    { label: "Service Coverage", href: "/coverage" },
  ],
  right: [
    { label: "Client Login", href: "/login" },
    { label: "Vendor Application", href: "/vendors/apply" },
  ],
} as const;

export const headerActions = {
  login: { label: "Client Login", href: "/login" },
  quote: { label: "Get a Quote", href: "/get-a-quote" },
} as const;

export const footerNav = {
  services: [
    { label: "Property Preservation", href: "/services/property-preservation" },
    { label: "Property Maintenance", href: "/services/property-maintenance" },
    { label: "Coverage", href: "/coverage" },
  ],
  clients: [
    { label: "Request Service", href: "/get-a-quote" },
    { label: "Client Login", href: "/login" },
    { label: "Partners", href: "/partners" },
  ],
  vendors: [
    { label: "Vendor Network", href: "/vendors" },
    { label: "Apply to Join", href: "/vendors/apply" },
  ],
  residents: [
    { label: "Resident Services", href: "/residents" },
    { label: "Request Repair Quote", href: "/get-a-quote" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const;
