import { services, type ServiceSlug } from "@/data/services";
import { usStates } from "@/data/us-states";

export const MARKET_STATE_CODES = ["NC", "TX", "GA", "OH", "WA"] as const;
export type MarketStateCode = (typeof MARKET_STATE_CODES)[number];

export const COVERAGE_SERVICE_SLUGS = services.map((item) => item.slug) as ServiceSlug[];

export type PublicCoverageStatus = "covered" | "limited" | "not_established";
export type InternalCoverageStatus = "active" | "limited" | "unavailable";

export type CoverageSourceInput = {
  kind: "manual" | "vendor";
  capability?: "active" | "limited" | "unavailable" | "suspended";
  vendorStatus?: "proposed" | "active" | "suspended" | "inactive";
  verificationStatus?: "unverified" | "reviewing" | "verified" | "rejected";
  organizationActive?: boolean;
  organizationTypeVendor?: boolean;
  onboardingAccepted?: boolean;
  effective?: boolean;
};

export function isMarketState(code: string): boolean {
  return (MARKET_STATE_CODES as readonly string[]).includes(code.toUpperCase());
}

export function normalizeStateCode(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(trimmed) && usStates.some((state) => state.code === trimmed)) {
    return trimmed;
  }
  const named = usStates.find((state) => state.name.toUpperCase() === trimmed);
  return named?.code ?? null;
}

export function stateName(code: string): string {
  return usStates.find((state) => state.code === code.toUpperCase())?.name ?? code;
}

export function normalizeCountyKey(value: string): string | null {
  const key = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+(county|parish|borough)$/g, "")
    .trim();
  return key.length > 0 ? key : null;
}

export function displayCountyName(value: string): string {
  const key = normalizeCountyKey(value);
  if (!key) return value.trim();
  if (["district of columbia", "washington dc", "washington d c", "dc"].includes(key)) {
    return "District of Columbia";
  }
  return `${key.replace(/\b\w/g, (char) => char.toUpperCase())} County`;
}

export function serviceLabel(slug: string): string {
  return services.find((item) => item.slug === slug)?.name ?? slug.replaceAll("-", " ");
}

export function vendorServiceToSlug(value: string): ServiceSlug | null {
  const key = value.trim().toLowerCase();
  const map: Record<string, ServiceSlug> = {
    preservation: "property-preservation",
    "property preservation": "property-preservation",
    "property-preservation": "property-preservation",
    maintenance: "property-maintenance",
    "property maintenance": "property-maintenance",
    "property-maintenance": "property-maintenance",
    inspections: "inspections",
    inspection: "inspections",
    lawn: "exterior",
    "debris removal": "exterior",
    exterior: "exterior",
    cleaning: "property-maintenance",
    handyman: "property-maintenance",
    plumbing: "plumbing",
    hvac: "hvac",
    electrical: "electrical",
    roofing: "exterior",
    locksmith: "repairs",
    painting: "repairs",
    flooring: "repairs",
    carpentry: "repairs",
    repairs: "repairs",
    turns: "turns",
    "make ready": "turns",
  };
  return map[key] ?? (COVERAGE_SERVICE_SLUGS.includes(key as ServiceSlug) ? (key as ServiceSlug) : null);
}

export function splitList(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : value.split(/[;,\n]/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

export function vendorCoverageQualifies(source: CoverageSourceInput): boolean {
  if (source.kind !== "vendor") return false;
  return (
    source.vendorStatus === "active" &&
    source.verificationStatus === "verified" &&
    source.organizationActive !== false &&
    source.organizationTypeVendor !== false &&
    source.onboardingAccepted !== false &&
    source.effective !== false
  );
}

export function manualCoverageQualifies(source: CoverageSourceInput): boolean {
  if (source.kind !== "manual") return false;
  return source.capability === "active" || source.capability === "limited";
}

export function combineCoverageStatus(sources: CoverageSourceInput[]): InternalCoverageStatus {
  const qualified = sources.filter((source) =>
    source.kind === "manual" ? manualCoverageQualifies(source) : vendorCoverageQualifies(source),
  );
  if (qualified.some((source) => source.kind === "vendor" || source.capability === "active")) {
    return "active";
  }
  if (qualified.some((source) => source.capability === "limited")) {
    return "limited";
  }
  return "unavailable";
}

export function toPublicCoverageStatus(status: InternalCoverageStatus): PublicCoverageStatus {
  if (status === "active") return "covered";
  if (status === "limited") return "limited";
  return "not_established";
}

export function publicCoverageCopy(status: PublicCoverageStatus): { heading: string; body: string } {
  if (status === "covered") {
    return {
      heading: "Active coverage",
      body: "Great news — TrueFix360 currently has active network coverage for this service in this area.",
    };
  }
  if (status === "limited") {
    return {
      heading: "Limited coverage",
      body: "TrueFix360 has network capability in this market, but availability may depend on the requested service, schedule, or scope.",
    };
  }
  return {
    heading: "Coverage not yet established",
    body: "We don't currently show established coverage for this service in this area. Submit the request and our operations team can evaluate the location and work to source qualified local coverage.",
  };
}

export function shouldCreateGap(status: PublicCoverageStatus): boolean {
  return status === "not_established";
}

export function vendorCoverageCounts(sources: CoverageSourceInput[]): number {
  return sources.filter(vendorCoverageQualifies).length;
}
