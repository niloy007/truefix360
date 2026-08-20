"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  canSubmitVendors,
  resolveNetworkLinkAccess,
} from "@/lib/vendor-network/access";
import {
  mapSharedVendor,
  SHARED_VENDOR_SELECT,
  type SharedVendorPublic,
} from "@/lib/vendor-network/public-fields";
import { hasExactDuplicate } from "@/lib/vendors/duplicates";
import { checkVendorDuplicates } from "@/lib/vendors/queries";
import {
  emptyToNull,
  formBoolean,
  networkSubmissionSchema,
  parseStringList,
} from "@/lib/vendors/schema";
import { normalizeEmail, normalizePhone } from "@/lib/vendors/duplicates";
import { notifyNetworkSubmission } from "@/lib/vendors/actions";

export type NetworkActionResult =
  | { ok: true; message?: string; submissionId?: string }
  | {
      ok: false;
      error: string;
      duplicates?: Awaited<ReturnType<typeof checkVendorDuplicates>>;
    };

export async function listSharedVendors(rawToken: string, filters?: {
  q?: string;
  state?: string;
  trade?: string;
  preferred?: string;
}): Promise<SharedVendorPublic[]> {
  const ctx = await requireUser();
  void ctx;
  const access = await resolveNetworkLinkAccess(rawToken);
  if (!access.ok) {
    throw new Error("This vendor-network link is no longer active.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendor_profiles")
    .select(SHARED_VENDOR_SELECT)
    .eq("shared_network_visible", true)
    .eq("vendor_status", "active")
    .order("legal_name");

  if (error) throw new Error("Unable to load shared vendors.");

  const q = (filters?.q ?? "").trim().toLowerCase();
  const mapped = (data ?? [])
    .map((row) => mapSharedVendor(row as unknown as Record<string, unknown>))
    .filter((row): row is SharedVendorPublic => Boolean(row));

  return mapped.filter((vendor) => {
    if (filters?.preferred === "yes" && !vendor.preferred) return false;
    if (filters?.state) {
      const state = filters.state.toUpperCase();
      if (
        String(vendor.state ?? "").toUpperCase() !== state &&
        !vendor.coverageStates.map((s) => s.toUpperCase()).includes(state)
      ) {
        return false;
      }
    }
    if (filters?.trade) {
      const trade = filters.trade.toLowerCase();
      if (!vendor.trades.some((t) => t.toLowerCase().includes(trade) || trade.includes(t.toLowerCase()))) {
        return false;
      }
    }
    if (q) {
      const haystack = [
        vendor.companyName,
        vendor.contactName,
        vendor.phone,
        vendor.email,
        vendor.city,
        vendor.state,
        vendor.zip,
        vendor.coverageSummary,
        ...vendor.trades,
        ...vendor.coverageStates,
        ...vendor.coverageCities,
        ...vendor.coverageCounties,
        ...vendor.coverageZips,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export async function getSharedVendor(
  rawToken: string,
  organizationId: string,
): Promise<SharedVendorPublic | null> {
  await requireUser();
  const access = await resolveNetworkLinkAccess(rawToken);
  if (!access.ok) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_profiles")
    .select(SHARED_VENDOR_SELECT)
    .eq("organization_id", organizationId)
    .eq("shared_network_visible", true)
    .maybeSingle();

  if (!data) return null;
  return mapSharedVendor(data as unknown as Record<string, unknown>);
}

export async function submitNetworkVendorAction(
  rawToken: string,
  formData: FormData,
): Promise<NetworkActionResult> {
  const ctx = await requireUser();
  const access = await resolveNetworkLinkAccess(rawToken);
  if (!access.ok) {
    return { ok: false, error: "This vendor-network link is no longer active." };
  }
  if (!canSubmitVendors(access.link.permission)) {
    return { ok: false, error: "You don't have permission to perform this action." };
  }

  let values;
  try {
    values = networkSubmissionSchema.parse({
      companyName: String(formData.get("companyName") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      alternatePhone: String(formData.get("alternatePhone") ?? ""),
      email: String(formData.get("email") ?? ""),
      website: String(formData.get("website") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      services: parseStringList(formData.get("services")),
      coverageStates: parseStringList(formData.get("coverageStates")),
      coverageCounties: parseStringList(formData.get("coverageCounties")),
      coverageCities: parseStringList(formData.get("coverageCities")),
      coverageZips: parseStringList(formData.get("coverageZips")),
      serviceRadiusMiles: formData.get("serviceRadiusMiles")
        ? Number(formData.get("serviceRadiusMiles"))
        : null,
      homeZip: String(formData.get("homeZip") ?? ""),
      tripFeeEnabled: formBoolean(formData, "tripFeeEnabled"),
      tripFeeAmount: formData.get("tripFeeAmount") ? Number(formData.get("tripFeeAmount")) : null,
      tripFeeNotes: String(formData.get("tripFeeNotes") ?? ""),
      standardAvailability: String(formData.get("standardAvailability") ?? ""),
      emergencyAvailable: formBoolean(formData, "emergencyAvailable"),
      afterHoursAvailable: formBoolean(formData, "afterHoursAvailable"),
      weekendAvailable: formBoolean(formData, "weekendAvailable"),
      notes: String(formData.get("notes") ?? ""),
      forceCreate: formBoolean(formData, "forceCreate"),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid vendor details.",
    };
  }

  const duplicates = await checkVendorDuplicates({
    companyName: values.companyName,
    phone: values.phone,
    email: values.email,
    address: values.address,
    city: values.city,
    state: values.state,
  });

  if (duplicates.length) {
    if (hasExactDuplicate(duplicates)) {
      return {
        ok: false,
        error: "A vendor with the same phone or email already exists. Contact an administrator.",
        duplicates,
      };
    }
    if (!values.forceCreate) {
      return {
        ok: false,
        error: "Possible existing vendor found.",
        duplicates,
      };
    }
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, first_name, last_name")
    .eq("id", ctx.userId)
    .maybeSingle();
  const submittedByName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    ctx.email;

  const { data: submission, error } = await admin
    .from("vendor_network_submissions")
    .insert({
      company_name: values.companyName,
      contact_name: emptyToNull(values.contactName),
      phone: values.phone,
      alternate_phone: emptyToNull(values.alternatePhone),
      email: emptyToNull(values.email),
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
      notes: emptyToNull(values.notes),
      status: "pending",
      submitted_by: ctx.userId,
      submitted_by_email: ctx.email,
      submitted_by_name: submittedByName,
      network_link_id: access.link.id,
      phone_normalized: normalizePhone(values.phone) || null,
      email_normalized: normalizeEmail(values.email) || null,
    })
    .select("id")
    .single();

  if (error || !submission) {
    return { ok: false, error: "Vendor submission could not be saved." };
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_network_submission.created",
    entityType: "vendor_network_submissions",
    entityId: submission.id,
    metadata: {
      companyName: values.companyName,
      networkLinkId: access.link.id,
      source: "shared_network",
    },
  });

  void notifyNetworkSubmission({
    companyName: values.companyName,
    submittedBy: submittedByName,
    linkName: access.link.name,
    submissionId: submission.id,
  });

  revalidatePath(`/vendor-network/${encodeURIComponent(rawToken)}`);
  return {
    ok: true,
    submissionId: submission.id,
    message: "Vendor submitted for admin review.",
  };
}
