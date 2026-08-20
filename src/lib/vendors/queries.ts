import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findDuplicateCandidates,
  normalizeEmail,
  normalizePhone,
  type DuplicateCandidate,
  type ExistingVendorForMatch,
} from "@/lib/vendors/duplicates";
import {
  coverageSummaryFromParts,
  emptyToNull,
  type AdminVendorFormValues,
} from "@/lib/vendors/schema";

export function orgStatusFromVendorStatus(
  vendorStatus: AdminVendorFormValues["vendorStatus"],
): "active" | "inactive" | "suspended" {
  if (vendorStatus === "do_not_use") return "suspended";
  if (vendorStatus === "inactive" || vendorStatus === "pending") return "inactive";
  return "active";
}

export function profilePayloadFromForm(
  values: AdminVendorFormValues,
  extras: {
    source: "manual" | "vendor_application" | "shared_network";
    createdBy?: string | null;
    sourceSubmissionId?: string | null;
  },
) {
  const phoneNormalized = normalizePhone(values.phone) || null;
  const emailNormalized = normalizeEmail(values.email) || null;
  return {
    legal_name: values.companyName,
    primary_contact_name: emptyToNull(values.contactName),
    primary_phone: values.phone,
    alternate_phone: emptyToNull(values.alternatePhone),
    primary_email: emptyToNull(values.email),
    website: emptyToNull(values.website),
    address: emptyToNull(values.address),
    city: emptyToNull(values.city),
    state: emptyToNull(values.state),
    zip: emptyToNull(values.zip),
    service_categories: values.services,
    coverage_states: values.coverageStates,
    coverage_counties: values.coverageCounties,
    coverage_cities: values.coverageCities,
    coverage_zips: values.coverageZips,
    service_radius_miles: values.serviceRadiusMiles ?? null,
    home_zip: emptyToNull(values.homeZip),
    trip_fee_enabled: values.tripFeeEnabled,
    trip_fee_amount: values.tripFeeEnabled ? (values.tripFeeAmount ?? null) : null,
    trip_fee_notes: emptyToNull(values.tripFeeNotes),
    standard_availability: emptyToNull(values.standardAvailability),
    emergency_available: values.emergencyAvailable,
    after_hours_available: values.afterHoursAvailable,
    weekend_available: values.weekendAvailable,
    license_number: emptyToNull(values.licenseNumber),
    license_state: emptyToNull(values.licenseState),
    license_expires_on: emptyToNull(values.licenseExpiresOn),
    insurance_status: emptyToNull(values.insuranceStatus),
    insurance_expires_on: emptyToNull(values.insuranceExpiresOn),
    w9_status: emptyToNull(values.w9Status),
    preferred: values.preferred,
    vendor_status: values.vendorStatus,
    shared_network_visible: values.sharedNetworkVisible,
    internal_notes: emptyToNull(values.internalNotes),
    public_notes: emptyToNull(values.publicNotes),
    coverage: coverageSummaryFromParts(values),
    onboarding_status: values.vendorStatus === "pending" ? "pending" : "approved",
    source: extras.source,
    source_submission_id: extras.sourceSubmissionId ?? null,
    created_by: extras.createdBy ?? null,
    phone_normalized: phoneNormalized,
    email_normalized: emailNormalized,
  };
}

export async function loadExistingVendorsForDuplicateCheck(): Promise<ExistingVendorForMatch[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_profiles")
    .select(
      "organization_id, legal_name, primary_phone, primary_email, address, city, state, phone_normalized, email_normalized, organizations(name)",
    )
    .limit(2000);

  return (data ?? []).map((row) => {
    const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      organizationId: row.organization_id as string,
      companyName: (org?.name as string) || (row.legal_name as string) || "Vendor",
      phone: row.primary_phone as string | null,
      email: row.primary_email as string | null,
      address: row.address as string | null,
      city: row.city as string | null,
      state: row.state as string | null,
      phoneNormalized: row.phone_normalized as string | null,
      emailNormalized: row.email_normalized as string | null,
    };
  });
}

export async function checkVendorDuplicates(input: {
  companyName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  excludeOrganizationId?: string;
}): Promise<DuplicateCandidate[]> {
  const existing = await loadExistingVendorsForDuplicateCheck();
  const filtered = input.excludeOrganizationId
    ? existing.filter((row) => row.organizationId !== input.excludeOrganizationId)
    : existing;
  return findDuplicateCandidates(input, filtered);
}

export type VendorListFilters = {
  q?: string;
  state?: string;
  city?: string;
  trade?: string;
  status?: string;
  preferred?: string;
  shared?: string;
  availability?: string;
};

export async function getVendorDirectoryMetrics() {
  const admin = createAdminClient();
  const [
    { count: total },
    { count: active },
    { count: pendingReview },
    { count: preferred },
    { data: stateRows },
  ] = await Promise.all([
    admin.from("organizations").select("id", { count: "exact", head: true }).eq("type", "vendor"),
    admin
      .from("vendor_profiles")
      .select("id", { count: "exact", head: true })
      .eq("vendor_status", "active"),
    admin
      .from("vendor_network_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("vendor_profiles").select("id", { count: "exact", head: true }).eq("preferred", true),
    admin.from("vendor_profiles").select("coverage_states, state"),
  ]);

  const states = new Set<string>();
  for (const row of stateRows ?? []) {
    if (row.state) states.add(String(row.state).toUpperCase());
    for (const code of row.coverage_states ?? []) {
      if (code) states.add(String(code).toUpperCase());
    }
  }

  return {
    total: total ?? 0,
    active: active ?? 0,
    pendingReview: pendingReview ?? 0,
    preferred: preferred ?? 0,
    statesCovered: states.size,
  };
}

export async function listAdminVendors(filters: VendorListFilters) {
  const admin = createAdminClient();
  const query = admin
    .from("organizations")
    .select(
      `
      id,
      name,
      status,
      created_at,
      updated_at,
      vendor_profiles (
        id,
        legal_name,
        primary_contact_name,
        primary_phone,
        primary_email,
        city,
        state,
        zip,
        service_categories,
        coverage,
        coverage_states,
        coverage_cities,
        coverage_counties,
        coverage_zips,
        service_radius_miles,
        trip_fee_enabled,
        trip_fee_amount,
        trip_fee_notes,
        preferred,
        vendor_status,
        shared_network_visible,
        emergency_available,
        after_hours_available,
        weekend_available,
        source
      )
    `,
    )
    .eq("type", "vendor")
    .order("name");

  const { data, error } = await query;
  if (error) throw new Error("Unable to load vendors.");

  const ids = (data ?? []).map((row) => row.id as string);
  const { data: assignments } = ids.length
    ? await admin
        .from("work_order_assignments")
        .select("id, vendor_organization_id, status, created_at, updated_at")
        .in("vendor_organization_id", ids)
    : { data: [] };

  const openByVendor = new Map<string, number>();
  const lastJobByVendor = new Map<string, string>();
  for (const item of assignments ?? []) {
    const vendorId = item.vendor_organization_id as string;
    if (["offered", "accepted"].includes(item.status as string)) {
      openByVendor.set(vendorId, (openByVendor.get(vendorId) ?? 0) + 1);
    }
    const stamp = (item.updated_at || item.created_at) as string;
    const prev = lastJobByVendor.get(vendorId);
    if (!prev || stamp > prev) lastJobByVendor.set(vendorId, stamp);
  }

  const q = (filters.q ?? "").trim().toLowerCase();

  const rows = (data ?? [])
    .map((row) => {
      const profileRaw = row.vendor_profiles;
      const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
      return {
        id: row.id as string,
        name: row.name as string,
        orgStatus: row.status as string,
        profile: profile as Record<string, unknown> | null,
        openWorkOrders: openByVendor.get(row.id as string) ?? 0,
        lastJobAt: lastJobByVendor.get(row.id as string) ?? null,
      };
    })
    .filter((row) => {
      const p = row.profile;
      if (!p) return false;

      if (filters.status && String(p.vendor_status) !== filters.status) return false;
      if (filters.preferred === "yes" && !p.preferred) return false;
      if (filters.preferred === "no" && p.preferred) return false;
      if (filters.shared === "yes" && !p.shared_network_visible) return false;
      if (filters.shared === "no" && p.shared_network_visible) return false;
      if (filters.state) {
        const state = String(filters.state).toUpperCase();
        const profileState = String(p.state ?? "").toUpperCase();
        const covered = Array.isArray(p.coverage_states)
          ? (p.coverage_states as string[]).map((s) => s.toUpperCase())
          : [];
        if (profileState !== state && !covered.includes(state)) return false;
      }
      if (filters.city) {
        const city = filters.city.toLowerCase();
        const profileCity = String(p.city ?? "").toLowerCase();
        const cities = Array.isArray(p.coverage_cities)
          ? (p.coverage_cities as string[]).map((c) => c.toLowerCase())
          : [];
        if (profileCity !== city && !cities.some((c) => c.includes(city))) return false;
      }
      if (filters.trade) {
        const trade = filters.trade.toLowerCase();
        const cats = Array.isArray(p.service_categories)
          ? (p.service_categories as string[]).map((c) => c.toLowerCase())
          : [];
        if (!cats.some((c) => c.includes(trade) || trade.includes(c))) return false;
      }
      if (filters.availability === "emergency" && !p.emergency_available) return false;
      if (filters.availability === "after_hours" && !p.after_hours_available) return false;
      if (filters.availability === "weekend" && !p.weekend_available) return false;

      if (q) {
        const haystack = [
          row.name,
          p.legal_name,
          p.primary_contact_name,
          p.primary_phone,
          p.primary_email,
          p.city,
          p.state,
          p.zip,
          p.coverage,
          ...(Array.isArray(p.service_categories) ? (p.service_categories as string[]) : []),
          ...(Array.isArray(p.coverage_states) ? (p.coverage_states as string[]) : []),
          ...(Array.isArray(p.coverage_cities) ? (p.coverage_cities as string[]) : []),
          ...(Array.isArray(p.coverage_counties) ? (p.coverage_counties as string[]) : []),
          ...(Array.isArray(p.coverage_zips) ? (p.coverage_zips as string[]) : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

  return rows;
}
