/**
 * Production photography lives in /public/images.
 * Import this config at call sites — do not duplicate file paths.
 *
 * Wired now: hero, preservation, maintenance, vendorNetwork,
 * residentService, about, og.
 *
 * Not wired: coverage (SVG USA map remains), clientPortal (no portal UI yet).
 */
export const images = {
  hero: "/images/truefix360-field-service-hero.webp",
  preservation: "/images/property-preservation-service.webp",
  maintenance: "/images/property-maintenance-technician.webp",
  coverage: "/images/truefix360-us-service-coverage.webp",
  clientPortal: "/images/truefix360-client-portal.webp",
  vendorNetwork: "/images/truefix360-vendor-network.webp",
  residentService: "/images/resident-repair-service.webp",
  about: "/images/about-truefix360.webp",
  og: "/images/og-truefix360.jpg",
} as const;

export const ogImage = {
  url: images.og,
  width: 1200,
  height: 630,
  alt: "TrueFix360",
} as const;

export type ImageKey = keyof typeof images;
