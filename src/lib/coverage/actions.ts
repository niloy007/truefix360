"use server";

import { revalidatePath } from "next/cache";
import { requireInternalStaff } from "@/lib/auth/guards";
import { writeAuditLog } from "@/lib/audit";
import { displayCountyName, normalizeCountyKey, normalizeStateCode } from "@/lib/coverage/logic";
import { createAdminClient } from "@/lib/supabase/admin";

async function staff() {
  return requireInternalStaff();
}

function refreshCoverage() {
  revalidatePath("/admin/coverage");
  revalidatePath("/coverage");
  revalidatePath("/admin/dispatch");
  revalidatePath("/admin");
}

export async function addManualCoverageAction(formData: FormData) {
  const ctx = await staff();
  const state = normalizeStateCode(String(formData.get("state") ?? ""));
  const county = String(formData.get("county") ?? "");
  const service = String(formData.get("service") ?? "").trim();
  const status = String(formData.get("status") ?? "active");
  const publicVisible = String(formData.get("publicVisible") ?? "true") === "true";
  const notes = String(formData.get("notes") ?? "") || null;
  if (!state || !normalizeCountyKey(county) || !service) {
    throw new Error("State, county, and service are required.");
  }
  const admin = createAdminClient();
  await admin.from("manual_coverage").upsert({
    state_code: state,
    county_name: displayCountyName(county),
    normalized_county_name: normalizeCountyKey(county),
    service_category: service,
    status,
    public_visible: publicVisible,
    notes_internal: notes,
    verified_by: ctx.userId,
    verified_at: new Date().toISOString(),
  }, { onConflict: "state_code,normalized_county_name,service_category" });
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "coverage.manual_added",
    entityType: "manual_coverage",
    metadata: { state, county, service, status },
  });
  refreshCoverage();
}

export async function verifyVendorCoverageAction(formData: FormData) {
  const ctx = await staff();
  const id = String(formData.get("coverageId") ?? "");
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_coverage")
    .select("id, vendor_organization_id, state_code, county_name, service_category, organizations:vendor_organization_id(status, type), vendor_profiles:vendor_profile_id(onboarding_status)")
    .eq("id", id)
    .maybeSingle();
  if (!data) throw new Error("Coverage record not found.");
  const org = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
  if (org?.status !== "active") throw new Error("The vendor organization must be active before coverage can be verified.");
  await admin
    .from("vendor_coverage")
    .update({
      verification_status: "verified",
      status: "active",
      verified_by: ctx.userId,
      verified_at: new Date().toISOString(),
      effective_from: new Date().toISOString(),
    })
    .eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_coverage.verified",
    entityType: "vendor_coverage",
    entityId: id,
    metadata: { state: data.state_code, county: data.county_name, service: data.service_category },
  });
  refreshCoverage();
}

export async function rejectVendorCoverageAction(formData: FormData) {
  const ctx = await staff();
  const id = String(formData.get("coverageId") ?? "");
  const admin = createAdminClient();
  await admin.from("vendor_coverage").update({ verification_status: "rejected", status: "inactive" }).eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_coverage.rejected",
    entityType: "vendor_coverage",
    entityId: id,
  });
  refreshCoverage();
}

export async function suspendVendorCoverageAction(formData: FormData) {
  const ctx = await staff();
  const id = String(formData.get("coverageId") ?? "");
  const admin = createAdminClient();
  await admin.from("vendor_coverage").update({ status: "suspended" }).eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_coverage.suspended",
    entityType: "vendor_coverage",
    entityId: id,
  });
  refreshCoverage();
}

export async function updateCoverageRequestStatusAction(formData: FormData) {
  const ctx = await staff();
  const id = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const admin = createAdminClient();
  await admin.from("coverage_requests").update({ status }).eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "coverage_request.status_changed",
    entityType: "coverage_requests",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/coverage/requests");
  revalidatePath(`/admin/coverage/requests/${id}`);
}
