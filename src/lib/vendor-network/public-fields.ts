/** Explicit projection for Shared Vendor Network — never include confidential fields. */

export const SHARED_VENDOR_SELECT = [
  "organization_id",
  "legal_name",
  "primary_contact_name",
  "primary_phone",
  "primary_email",
  "website",
  "city",
  "state",
  "zip",
  "service_categories",
  "coverage_states",
  "coverage_counties",
  "coverage_cities",
  "coverage_zips",
  "service_radius_miles",
  "home_zip",
  "trip_fee_enabled",
  "trip_fee_amount",
  "trip_fee_notes",
  "standard_availability",
  "emergency_available",
  "after_hours_available",
  "weekend_available",
  "preferred",
  "public_notes",
  "coverage",
  "shared_network_visible",
  "organizations!inner(id, name, status, type)",
].join(", ");

export type SharedVendorPublic = {
  organizationId: string;
  companyName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  trades: string[];
  coverageStates: string[];
  coverageCounties: string[];
  coverageCities: string[];
  coverageZips: string[];
  serviceRadiusMiles: number | null;
  homeZip: string | null;
  tripFeeEnabled: boolean;
  tripFeeAmount: number | null;
  tripFeeNotes: string | null;
  standardAvailability: string | null;
  emergencyAvailable: boolean;
  afterHoursAvailable: boolean;
  weekendAvailable: boolean;
  preferred: boolean;
  publicNotes: string | null;
  coverageSummary: string | null;
};

type OrgNested = { id?: string; name?: string; status?: string; type?: string } | null;

export function mapSharedVendor(row: Record<string, unknown>): SharedVendorPublic | null {
  const orgRaw = row.organizations as OrgNested | OrgNested[] | undefined;
  const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
  if (!org?.id || org.type !== "vendor") return null;
  if (row.shared_network_visible === false) return null;

  return {
    organizationId: String(row.organization_id ?? org.id),
    companyName: String(org.name ?? row.legal_name ?? "Vendor"),
    contactName: (row.primary_contact_name as string | null) ?? null,
    phone: (row.primary_phone as string | null) ?? null,
    email: (row.primary_email as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    zip: (row.zip as string | null) ?? null,
    trades: Array.isArray(row.service_categories) ? (row.service_categories as string[]) : [],
    coverageStates: Array.isArray(row.coverage_states) ? (row.coverage_states as string[]) : [],
    coverageCounties: Array.isArray(row.coverage_counties) ? (row.coverage_counties as string[]) : [],
    coverageCities: Array.isArray(row.coverage_cities) ? (row.coverage_cities as string[]) : [],
    coverageZips: Array.isArray(row.coverage_zips) ? (row.coverage_zips as string[]) : [],
    serviceRadiusMiles:
      row.service_radius_miles == null ? null : Number(row.service_radius_miles),
    homeZip: (row.home_zip as string | null) ?? null,
    tripFeeEnabled: Boolean(row.trip_fee_enabled),
    tripFeeAmount: row.trip_fee_amount == null ? null : Number(row.trip_fee_amount),
    tripFeeNotes: (row.trip_fee_notes as string | null) ?? null,
    standardAvailability: (row.standard_availability as string | null) ?? null,
    emergencyAvailable: Boolean(row.emergency_available),
    afterHoursAvailable: Boolean(row.after_hours_available),
    weekendAvailable: Boolean(row.weekend_available),
    preferred: Boolean(row.preferred),
    publicNotes: (row.public_notes as string | null) ?? null,
    coverageSummary: (row.coverage as string | null) ?? null,
  };
}

/** Fields that must never appear in shared-network API responses. */
export const SHARED_VENDOR_EXCLUDED_FIELDS = [
  "internal_notes",
  "w9_status",
  "license_number",
  "license_state",
  "license_expires_on",
  "insurance_status",
  "insurance_expires_on",
  "workers_comp_status",
  "created_by",
  "source_submission_id",
  "phone_normalized",
  "email_normalized",
] as const;

export function assertNoSensitiveSharedFields(payload: Record<string, unknown>): boolean {
  return SHARED_VENDOR_EXCLUDED_FIELDS.every((field) => !(field in payload));
}
