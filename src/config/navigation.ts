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

/**
 * Public primary navigation.
 * Order: what we do → where → clients → vendors → residents → company → contact.
 * Logo links home; Home is intentionally omitted.
 */
export const primaryNav: NavItem[] = [
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
        label: "General Repairs",
        href: "/services#repairs",
        description: "Corrective repairs and handyman work.",
      },
      {
        label: "Property Inspections",
        href: "/services#inspections",
        description: "Condition and occupancy inspections.",
      },
      {
        label: "Exterior & Lawn",
        href: "/services#exterior",
        description: "Lawn care, cleanup, and exterior services.",
      },
      {
        label: "View All Services",
        href: "/services",
        description: "Full property-service overview.",
      },
    ],
  },
  { label: "Coverage", href: "/coverage" },
  {
    label: "Clients",
    href: "/partners",
    children: [
      {
        label: "Why TrueFix360",
        href: "/partners",
        description: "How property managers and partners work with us.",
      },
      {
        label: "Get a Quote",
        href: "/get-a-quote",
        description: "Request preservation or maintenance service.",
      },
      {
        label: "Client Login",
        href: "/login",
        description: "Access the client portal.",
      },
    ],
  },
  {
    label: "Vendors",
    href: "/vendors",
    children: [
      {
        label: "Become a Vendor",
        href: "/vendors",
        description: "How the TrueFix360 vendor network works.",
      },
      {
        label: "Vendor Application",
        href: "/vendors/apply",
        description: "Apply to join the field-service network.",
      },
      {
        label: "Vendor Login",
        href: "/login?type=vendor",
        description: "Access the vendor portal.",
      },
    ],
  },
  { label: "Residents", href: "/residents" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const topBar = {
  tagline: "Property Preservation & Maintenance Nationwide",
  links: [
    { label: "Client Login", href: "/login" },
    { label: "Vendor Login", href: "/login?type=vendor" },
  ],
} as const;

/** @deprecated Prefer topBar — kept for any residual imports */
export const topBarLinks = {
  left: [] as { label: string; href: string }[],
  right: topBar.links,
} as const;

export const headerActions = {
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
    { label: "Vendor Login", href: "/login?type=vendor" },
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

/** Path without hash/query for active-state checks. */
export function navPathBase(href: string): string {
  return href.split("#")[0]?.split("?")[0] || href;
}

/**
 * Whether a primary nav item should show as active for the current location.
 * Login type query distinguishes Clients vs Vendors on /login.
 */
export function isPrimaryNavActive(
  item: NavItem,
  pathname: string,
  search = "",
): boolean {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const loginType = (params.get("type") ?? "").toLowerCase();

  if (item.label === "Clients") {
    if (pathname === "/login" && loginType === "vendor") return false;
    if (pathname === "/login") return true;
    if (pathname === "/partners" || pathname.startsWith("/partners/")) return true;
    if (pathname === "/get-a-quote") return true;
    return false;
  }

  if (item.label === "Vendors") {
    if (pathname === "/login" && loginType === "vendor") return true;
    if (pathname === "/vendors" || pathname.startsWith("/vendors/")) return true;
    return false;
  }

  if (item.label === "Services") {
    return pathname === "/services" || pathname.startsWith("/services/");
  }

  if (item.label === "Coverage") {
    return pathname === "/coverage" || pathname.startsWith("/coverage/");
  }

  const base = navPathBase(item.href);
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}
