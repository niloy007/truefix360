import { countyBelongsToState, getCountiesByState } from "@/data/us-counties";
import { usStates } from "@/data/us-states";
import {
  displayCountyName,
  normalizeCountyKey,
  normalizeStateCode,
  stateName,
  vendorServiceToSlug as mapVendorService,
} from "@/lib/coverage/logic";

export { stateName };

export const COVERAGE_PAYLOAD_VERSION = 1 as const;
export const MAX_TRAVEL_RADIUS_MILES = 500;
export const MIN_CITY_TAG_LENGTH = 2;
export const MAX_CITY_TAG_LENGTH = 80;

export const TRAVEL_RADIUS_PRESETS = ["25", "50", "75", "100", "150", "200", "custom"] as const;
export type TravelRadiusPreset = (typeof TRAVEL_RADIUS_PRESETS)[number];

export const BUSINESS_HOURS_PRESETS = [
  { value: "mon-fri-8-5", label: "Monday–Friday, 8:00 AM–5:00 PM" },
  { value: "mon-fri-9-5", label: "Monday–Friday, 9:00 AM–5:00 PM" },
  { value: "mon-sat", label: "Monday–Saturday" },
  { value: "seven-days", label: "7 Days a Week" },
  { value: "24-7", label: "24/7 Availability" },
  { value: "custom", label: "Custom Hours" },
] as const;
export type BusinessHoursPreset = (typeof BUSINESS_HOURS_PRESETS)[number]["value"];

export const YES_NO_DEPENDS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "depends", label: "Depends on distance / job" },
] as const;

export const EMERGENCY_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "limited", label: "Limited / Call first" },
] as const;

export const WEEKEND_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "by-appointment", label: "By Appointment" },
] as const;

export type CoverageGroup = {
  state: string;
  allCounties: boolean;
  counties: string[];
  cities: string[];
  nearbyAreas: boolean;
};

export type CoveragePayload = {
  v: typeof COVERAGE_PAYLOAD_VERSION;
  groups: CoverageGroup[];
};

export type VendorCoverageFormValues = {
  coverageStates: string[];
  coverageGroups: CoverageGroup[];
  travelRadiusPreset: string;
  travelRadiusCustom?: string;
  willingToTravel: string;
  tripCharge: string;
  businessHoursPreset: string;
  businessHoursCustom?: string;
  emergencyAvailability: string;
  weekendAvailability: string;
};

export const VALID_STATE_CODES = new Set(usStates.map((state) => state.code));

export function emptyCoverageGroup(state: string): CoverageGroup {
  return {
    state: state.toUpperCase(),
    allCounties: false,
    counties: [],
    cities: [],
    nearbyAreas: false,
  };
}

export function stateHasChildCoverage(group: CoverageGroup | undefined): boolean {
  if (!group) return false;
  return group.allCounties || group.counties.length > 0 || group.cities.length > 0 || group.nearbyAreas;
}

export function titleCaseCity(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b([a-z])/g, (char) => char.toUpperCase());
}

export function normalizeCityTags(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const city = titleCaseCity(value);
    if (city.length < MIN_CITY_TAG_LENGTH || city.length > MAX_CITY_TAG_LENGTH) continue;
    const key = city.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(city);
  }
  return result;
}

export function uniqueCanonicalCounties(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const name = displayCountyName(value);
    const key = normalizeCountyKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

export function uniqueStateCodes(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const code = normalizeStateCode(value);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    result.push(code);
  }
  return result;
}

export function syncCoverageGroups(states: string[], groups: CoverageGroup[]): CoverageGroup[] {
  const codes = uniqueStateCodes(states);
  return codes.map((state) => groups.find((group) => group.state === state) ?? emptyCoverageGroup(state));
}

export function sanitizeCoverageGroup(group: CoverageGroup): CoverageGroup {
  const state = normalizeStateCode(group.state) ?? group.state.toUpperCase();
  const allCounties = Boolean(group.allCounties);
  const counties = allCounties
    ? []
    : uniqueCanonicalCounties(group.counties).filter((county) => {
        const available = getCountiesByState(state);
        return available.length === 0 || available.includes(county) || countyBelongsToState(state, county);
      });
  return {
    state,
    allCounties,
    counties,
    cities: normalizeCityTags(group.cities),
    nearbyAreas: Boolean(group.nearbyAreas),
  };
}

export function parseTravelRadiusMiles(
  preset: string,
  custom: string,
): { miles: number | null; error?: string } {
  if (!preset) return { miles: null, error: "Travel radius is required." };
  if (preset !== "custom") {
    const miles = Number.parseInt(preset, 10);
    if (!Number.isFinite(miles) || miles <= 0) return { miles: null, error: "Travel radius is required." };
    return { miles };
  }
  const miles = Number.parseInt(String(custom).trim(), 10);
  if (!Number.isFinite(miles) || miles <= 0) {
    return { miles: null, error: "Enter a custom travel radius greater than 0." };
  }
  if (miles > MAX_TRAVEL_RADIUS_MILES) {
    return { miles: null, error: `Custom travel radius must be ${MAX_TRAVEL_RADIUS_MILES} miles or less.` };
  }
  return { miles };
}

export function formatBusinessHours(preset: string, custom: string): string {
  if (preset === "custom") return custom.trim();
  return BUSINESS_HOURS_PRESETS.find((item) => item.value === preset)?.label ?? preset;
}

export function formatChoiceLabel(
  value: string,
  options: ReadonlyArray<{ value: string; label: string }>,
): string {
  return options.find((item) => item.value === value)?.label ?? value;
}

export function serializeCoveragePayload(groups: CoverageGroup[]): string {
  const payload: CoveragePayload = {
    v: COVERAGE_PAYLOAD_VERSION,
    groups: syncCoverageGroups(
      groups.map((group) => group.state),
      groups.map(sanitizeCoverageGroup),
    ),
  };
  return JSON.stringify(payload);
}

export function parseCoveragePayload(statesCovered: string, countiesCities: string): CoverageGroup[] {
  const trimmed = countiesCities.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as CoveragePayload;
      if (parsed?.v === 1 && Array.isArray(parsed.groups)) {
        return syncCoverageGroups(
          parsed.groups.map((group) => group.state),
          parsed.groups.map((group) => sanitizeCoverageGroup(group)),
        );
      }
    } catch {
      // Fall through to legacy text parsing.
    }
  }
  const states = uniqueStateCodes(splitLegacyList(statesCovered));
  const leftover = splitLegacyList(countiesCities);
  if (states.length === 0) return [];
  if (states.length === 1) {
    return [
      {
        state: states[0],
        allCounties: false,
        counties: uniqueCanonicalCounties(leftover),
        cities: [],
        nearbyAreas: false,
      },
    ];
  }
  return states.map((state) => emptyCoverageGroup(state));
}

function splitLegacyList(value: string): string[] {
  return value
    .split(/[;,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatCoverageSummary(groups: CoverageGroup[]): string {
  if (groups.length === 0) return "—";
  return groups
    .map((group) => {
      if (group.allCounties) return `${group.state} (all counties)`;
      const count = group.counties.length;
      return `${group.state} (${count} ${count === 1 ? "county" : "counties"})`;
    })
    .join(", ");
}

export function formatCoverageForStaff(groups: CoverageGroup[]): string {
  if (groups.length === 0) return "";
  return groups
    .map((group) => {
      const heading = stateName(group.state).toUpperCase();
      const counties = group.allCounties
        ? "All counties claimed (unverified statewide claim — not published as public coverage)"
        : group.counties.join("\n") || "—";
      const cities = group.cities.join(", ") || "—";
      const nearby = group.nearbyAreas ? "Yes" : "No";
      return [
        heading,
        `Counties\n${counties}`,
        `Cities / Service Areas\n${cities}`,
        `Additional Nearby Areas\n${nearby}`,
      ].join("\n\n");
    })
    .join("\n\n");
}

export type ProposedCoverageRow = {
  vendor_organization_id: string;
  vendor_profile_id: string | null;
  vendor_application_id: string;
  state_code: string;
  county_name: string;
  normalized_county_name: string;
  service_category: string;
  status: "proposed";
  verification_status: "unverified";
  travel_radius_miles: number | null;
};

export function buildProposedCoverageRows(input: {
  applicationId: string;
  organizationId: string;
  profileId?: string | null;
  groups: CoverageGroup[];
  services: string[] | null;
  travelRadiusMiles: number | null;
}): ProposedCoverageRow[] {
  const services = (input.services ?? [])
    .map((value) => mapVendorService(value))
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
  if (services.length === 0) return [];

  const rows: ProposedCoverageRow[] = [];
  for (const group of input.groups) {
    const state = normalizeStateCode(group.state);
    if (!state) continue;
    if (group.allCounties) continue;
    for (const county of uniqueCanonicalCounties(group.counties)) {
      const key = normalizeCountyKey(county);
      if (!key) continue;
      for (const service of services) {
        rows.push({
          vendor_organization_id: input.organizationId,
          vendor_profile_id: input.profileId ?? null,
          vendor_application_id: input.applicationId,
          state_code: state,
          county_name: displayCountyName(county),
          normalized_county_name: key,
          service_category: service,
          status: "proposed",
          verification_status: "unverified",
          travel_radius_miles: input.travelRadiusMiles,
        });
      }
    }
  }
  return rows;
}

export const VENDOR_APPLICATION_LIST_COLUMNS =
  "id, reference_number, company_name, first_name, last_name, city, state, services, states_covered, counties_cities, status, created_at";

export function buildVendorApplicationStorage(values: VendorCoverageFormValues): {
  states_covered: string;
  counties_cities: string;
  travel_radius: string;
  willing_to_travel: string;
  trip_charge_required: string;
  normal_hours: string;
  emergency_availability: string;
  weekend_availability: string;
} {
  const groups = syncCoverageGroups(values.coverageStates, values.coverageGroups).map(sanitizeCoverageGroup);
  const radius = parseTravelRadiusMiles(values.travelRadiusPreset, values.travelRadiusCustom ?? "");
  return {
    states_covered: groups.map((group) => group.state).join(", "),
    counties_cities: serializeCoveragePayload(groups),
    travel_radius: radius.miles ? String(radius.miles) : "",
    willing_to_travel: values.willingToTravel,
    trip_charge_required: values.tripCharge,
    normal_hours: formatBusinessHours(values.businessHoursPreset, values.businessHoursCustom ?? ""),
    emergency_availability: values.emergencyAvailability,
    weekend_availability: values.weekendAvailability,
  };
}

export function coverageValidationMessages(values: {
  coverageStates: string[];
  coverageGroups: CoverageGroup[];
}): { coverageStates?: string; coverageGroups?: string } {
  const states = uniqueStateCodes(values.coverageStates);
  if (states.length === 0) {
    return { coverageStates: "Select at least one state." };
  }
  const groups = syncCoverageGroups(states, values.coverageGroups);
  for (const group of groups) {
    if (group.allCounties) continue;
    for (const county of group.counties) {
      if (getCountiesByState(group.state).length > 0 && !countyBelongsToState(group.state, county)) {
        return {
          coverageGroups: `${displayCountyName(county)} is not a valid county in ${stateName(group.state)}.`,
        };
      }
    }
  }
  const sanitized = groups.map(sanitizeCoverageGroup);
  for (const group of sanitized) {
    if (!group.allCounties && group.counties.length === 0) {
      return {
        coverageGroups: `Select at least one county for ${stateName(group.state)}, or claim all counties in that state.`,
      };
    }
  }
  return {};
}
