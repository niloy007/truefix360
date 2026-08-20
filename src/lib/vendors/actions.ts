"use server";

import { revalidatePath } from "next/cache";
import { getSiteUrl } from "@/config/env";
import { writeAuditLog } from "@/lib/audit";
import { requireInternalStaff } from "@/lib/auth/guards";
import { InternalGenericNotification } from "@/emails/InternalGenericNotification";
import { notify } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasExactDuplicate } from "@/lib/vendors/duplicates";
import {
  checkVendorDuplicates,
  orgStatusFromVendorStatus,
  profilePayloadFromForm,
} from "@/lib/vendors/queries";
import {
  adminVendorFormSchema,
  emptyToNull,
  formBoolean,
  parseStringList,
  shareLinkSchema,
  type AdminVendorFormValues,
} from "@/lib/vendors/schema";
import {
  buildVendorNetworkUrl,
  generateShareToken,
  hashToken,
} from "@/lib/vendor-network/tokens";
import { decryptShareToken, encryptShareToken } from "@/lib/vendor-network/token-crypto";

export type ActionResult =
  | { ok: true; organizationId?: string; url?: string; message?: string }
  | {
      ok: false;
      error: string;
      duplicates?: Awaited<ReturnType<typeof checkVendorDuplicates>>;
    };

function parseAdminVendorForm(formData: FormData): AdminVendorFormValues {
  return adminVendorFormSchema.parse({
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
    licenseNumber: String(formData.get("licenseNumber") ?? ""),
    licenseState: String(formData.get("licenseState") ?? ""),
    licenseExpiresOn: String(formData.get("licenseExpiresOn") ?? ""),
    insuranceStatus: String(formData.get("insuranceStatus") ?? ""),
    insuranceExpiresOn: String(formData.get("insuranceExpiresOn") ?? ""),
    w9Status: String(formData.get("w9Status") ?? ""),
    preferred: formBoolean(formData, "preferred"),
    vendorStatus: String(formData.get("vendorStatus") ?? "active"),
    sharedNetworkVisible: formBoolean(formData, "sharedNetworkVisible"),
    internalNotes: String(formData.get("internalNotes") ?? ""),
    publicNotes: String(formData.get("publicNotes") ?? ""),
    forceCreate: formBoolean(formData, "forceCreate"),
  });
}

export async function createVendorAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  let values: AdminVendorFormValues;
  try {
    values = parseAdminVendorForm(formData);
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

  if (duplicates.length && !values.forceCreate) {
    return {
      ok: false,
      error: hasExactDuplicate(duplicates)
        ? "A vendor with the same phone or email already exists."
        : "Possible existing vendor found.",
      duplicates,
    };
  }

  const admin = createAdminClient();
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: values.companyName,
      type: "vendor",
      status: orgStatusFromVendorStatus(values.vendorStatus),
    })
    .select("id")
    .single();

  if (orgError || !org) {
    return { ok: false, error: "Vendor could not be created." };
  }

  const { error: profileError } = await admin.from("vendor_profiles").insert({
    organization_id: org.id,
    ...profilePayloadFromForm(values, { source: "manual", createdBy: ctx.userId }),
  });

  if (profileError) {
    await admin.from("organizations").delete().eq("id", org.id);
    return { ok: false, error: "Vendor profile could not be saved." };
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: org.id,
    action: "vendor.created",
    entityType: "organizations",
    entityId: org.id,
    metadata: { source: "manual", companyName: values.companyName },
  });

  revalidatePath("/admin/vendors");
  return { ok: true, organizationId: org.id, message: "Vendor created successfully." };
}

export async function updateVendorAction(
  organizationId: string,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  let values: AdminVendorFormValues;
  try {
    values = parseAdminVendorForm(formData);
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
    excludeOrganizationId: organizationId,
  });

  if (duplicates.length && !values.forceCreate) {
    return {
      ok: false,
      error: hasExactDuplicate(duplicates)
        ? "Another vendor with the same phone or email already exists."
        : "Possible existing vendor found.",
      duplicates,
    };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("organizations")
    .select("id, status, vendor_profiles(preferred, shared_network_visible, vendor_status)")
    .eq("id", organizationId)
    .eq("type", "vendor")
    .maybeSingle();
  if (!existing) return { ok: false, error: "Vendor not found." };

  const prevProfile = Array.isArray(existing.vendor_profiles)
    ? existing.vendor_profiles[0]
    : existing.vendor_profiles;

  const { error: orgError } = await admin
    .from("organizations")
    .update({
      name: values.companyName,
      status: orgStatusFromVendorStatus(values.vendorStatus),
    })
    .eq("id", organizationId);
  if (orgError) return { ok: false, error: "Vendor could not be updated." };

  const payload = profilePayloadFromForm(values, { source: "manual" });
  // Preserve original source / created_by on edit
  delete (payload as { source?: string }).source;
  delete (payload as { created_by?: string | null }).created_by;
  delete (payload as { source_submission_id?: string | null }).source_submission_id;

  const { error: profileError } = await admin
    .from("vendor_profiles")
    .update(payload)
    .eq("organization_id", organizationId);
  if (profileError) return { ok: false, error: "Vendor profile could not be updated." };

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId,
    action: "vendor.updated",
    entityType: "organizations",
    entityId: organizationId,
    metadata: { companyName: values.companyName },
  });

  if (prevProfile && prevProfile.vendor_status !== values.vendorStatus) {
    await writeAuditLog({
      actorUserId: ctx.userId,
      organizationId,
      action: "vendor.status_changed",
      entityType: "organizations",
      entityId: organizationId,
      metadata: { from: prevProfile.vendor_status, to: values.vendorStatus },
    });
  }
  if (prevProfile && Boolean(prevProfile.preferred) !== values.preferred) {
    await writeAuditLog({
      actorUserId: ctx.userId,
      organizationId,
      action: "vendor.preferred_changed",
      entityType: "organizations",
      entityId: organizationId,
      metadata: { preferred: values.preferred },
    });
  }
  if (prevProfile && Boolean(prevProfile.shared_network_visible) !== values.sharedNetworkVisible) {
    await writeAuditLog({
      actorUserId: ctx.userId,
      organizationId,
      action: "vendor.network_visibility",
      entityType: "organizations",
      entityId: organizationId,
      metadata: { sharedNetworkVisible: values.sharedNetworkVisible },
    });
  }

  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${organizationId}`);
  return { ok: true, organizationId, message: "Vendor updated successfully." };
}

export async function setVendorStatusAction(
  organizationId: string,
  vendorStatus: string,
) {
  const ctx = await requireInternalStaff();
  if (!["active", "inactive", "pending", "do_not_use"].includes(vendorStatus)) {
    throw new Error("Invalid vendor status.");
  }
  const admin = createAdminClient();
  const orgStatus = orgStatusFromVendorStatus(
    vendorStatus as AdminVendorFormValues["vendorStatus"],
  );
  await admin.from("organizations").update({ status: orgStatus }).eq("id", organizationId).eq("type", "vendor");
  await admin
    .from("vendor_profiles")
    .update({ vendor_status: vendorStatus })
    .eq("organization_id", organizationId);
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId,
    action: "vendor.status_changed",
    entityType: "organizations",
    entityId: organizationId,
    metadata: { to: vendorStatus },
  });
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${organizationId}`);
}

function expirationDate(expiration: string, customExpiresAt?: string | null): string | null {
  if (expiration === "never") return null;
  if (expiration === "custom" && customExpiresAt) {
    return new Date(customExpiresAt).toISOString();
  }
  const days = Number(expiration);
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export async function createVendorNetworkLinkAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  let values;
  try {
    values = shareLinkSchema.parse({
      name: String(formData.get("name") ?? ""),
      permission: String(formData.get("permission") ?? "viewer"),
      expiration: String(formData.get("expiration") ?? "30"),
      customExpiresAt: String(formData.get("customExpiresAt") ?? ""),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid share link details.",
    };
  }

  const rawToken = generateShareToken();
  const tokenHash = hashToken(rawToken);
  let encryptedToken: string;
  try {
    encryptedToken = encryptShareToken(rawToken);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "VENDOR_NETWORK_TOKEN_ENCRYPTION_KEY is required to create share links.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendor_network_links")
    .insert({
      name: values.name,
      token_hash: tokenHash,
      encrypted_token: encryptedToken,
      permission: values.permission,
      created_by: ctx.userId,
      expires_at: expirationDate(values.expiration, values.customExpiresAt),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Share link could not be created." };
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_network_link.created",
    entityType: "vendor_network_links",
    entityId: data.id,
    metadata: { name: values.name, permission: values.permission },
  });

  revalidatePath("/admin/vendors");
  return {
    ok: true,
    url: buildVendorNetworkUrl(getSiteUrl(), rawToken),
    message: "Share link created.",
  };
}

export async function revokeVendorNetworkLinkAction(linkId: string): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("vendor_network_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", linkId)
    .is("revoked_at", null);
  if (error) return { ok: false, error: "Unable to revoke link." };

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_network_link.revoked",
    entityType: "vendor_network_links",
    entityId: linkId,
  });
  revalidatePath("/admin/vendors");
  return { ok: true, message: "Vendor Network link revoked." };
}

export async function getVendorNetworkLinkUrlAction(linkId: string): Promise<ActionResult> {
  await requireInternalStaff();
  const admin = createAdminClient();
  const { data: link, error } = await admin
    .from("vendor_network_links")
    .select("id, encrypted_token, revoked_at, expires_at")
    .eq("id", linkId)
    .maybeSingle();

  if (error || !link) return { ok: false, error: "Share link not found." };
  if (link.revoked_at) return { ok: false, error: "This link has been revoked." };
  if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: "This link has expired." };
  }
  if (!link.encrypted_token) {
    return {
      ok: false,
      error:
        "Share link unavailable for copying. This link was created before reusable link storage was enabled.",
    };
  }

  try {
    const rawToken = decryptShareToken(String(link.encrypted_token));
    return {
      ok: true,
      url: buildVendorNetworkUrl(getSiteUrl(), rawToken),
    };
  } catch {
    return { ok: false, error: "Unable to recover share link. Check encryption key configuration." };
  }
}

export async function regenerateVendorNetworkLinkAction(linkId: string): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  const admin = createAdminClient();
  const { data: existing, error: loadError } = await admin
    .from("vendor_network_links")
    .select("id, name, permission, expires_at, revoked_at")
    .eq("id", linkId)
    .maybeSingle();

  if (loadError || !existing) return { ok: false, error: "Share link not found." };
  if (existing.revoked_at) return { ok: false, error: "Revoked links cannot be regenerated." };
  if (existing.expires_at && new Date(existing.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: "Expired links cannot be regenerated. Create a new link instead." };
  }

  let encryptedToken: string;
  const rawToken = generateShareToken();
  const tokenHash = hashToken(rawToken);
  try {
    encryptedToken = encryptShareToken(rawToken);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "VENDOR_NETWORK_TOKEN_ENCRYPTION_KEY is required to regenerate links.",
    };
  }

  const { error } = await admin
    .from("vendor_network_links")
    .update({
      token_hash: tokenHash,
      encrypted_token: encryptedToken,
    })
    .eq("id", linkId)
    .is("revoked_at", null);

  if (error) return { ok: false, error: "Unable to regenerate share link." };

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_network_link.regenerated",
    entityType: "vendor_network_links",
    entityId: linkId,
    metadata: { name: existing.name, permission: existing.permission },
  });

  revalidatePath("/admin/vendors");
  return {
    ok: true,
    url: buildVendorNetworkUrl(getSiteUrl(), rawToken),
    message: "Share link regenerated.",
  };
}

export async function setVendorPreferredAction(
  organizationId: string,
  preferred: boolean,
): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("vendor_profiles")
    .update({ preferred })
    .eq("organization_id", organizationId);
  if (error) return { ok: false, error: "Unable to update preferred status." };

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor.preferred_changed",
    entityType: "organizations",
    entityId: organizationId,
    metadata: { preferred },
  });
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${organizationId}`);
  return { ok: true, message: preferred ? "Marked preferred." : "Unmarked preferred." };
}

export async function setVendorSharedVisibilityAction(
  organizationId: string,
  sharedNetworkVisible: boolean,
): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("vendor_profiles")
    .update({ shared_network_visible: sharedNetworkVisible })
    .eq("organization_id", organizationId);
  if (error) return { ok: false, error: "Unable to update shared network visibility." };

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor.shared_visibility_changed",
    entityType: "organizations",
    entityId: organizationId,
    metadata: { sharedNetworkVisible },
  });
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${organizationId}`);
  return {
    ok: true,
    message: sharedNetworkVisible ? "Shown in Shared Network." : "Hidden from Shared Network.",
  };
}

export async function approveNetworkSubmissionAction(
  submissionId: string,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  const admin = createAdminClient();
  const { data: submission } = await admin
    .from("vendor_network_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) return { ok: false, error: "Submission not found." };
  if (submission.status !== "pending" && submission.status !== "needs_info") {
    return { ok: false, error: "This submission has already been reviewed." };
  }

  const vendorStatus = String(formData.get("vendorStatus") ?? "active");
  const preferred = formBoolean(formData, "preferred");
  const sharedNetworkVisible = formBoolean(formData, "sharedNetworkVisible");

  const values: AdminVendorFormValues = adminVendorFormSchema.parse({
    companyName: submission.company_name,
    contactName: submission.contact_name ?? "",
    phone: submission.phone,
    alternatePhone: submission.alternate_phone ?? "",
    email: submission.email ?? "",
    website: submission.website ?? "",
    address: submission.address ?? "",
    city: submission.city ?? "",
    state: submission.state ?? "",
    zip: submission.zip ?? "",
    services: submission.service_categories ?? [],
    coverageStates: submission.coverage_states ?? [],
    coverageCounties: submission.coverage_counties ?? [],
    coverageCities: submission.coverage_cities ?? [],
    coverageZips: submission.coverage_zips ?? [],
    serviceRadiusMiles: submission.service_radius_miles,
    homeZip: submission.home_zip ?? "",
    tripFeeEnabled: Boolean(submission.trip_fee_enabled),
    tripFeeAmount: submission.trip_fee_amount,
    tripFeeNotes: submission.trip_fee_notes ?? "",
    standardAvailability: submission.standard_availability ?? "",
    emergencyAvailable: Boolean(submission.emergency_available),
    afterHoursAvailable: Boolean(submission.after_hours_available),
    weekendAvailable: Boolean(submission.weekend_available),
    licenseNumber: "",
    licenseState: "",
    licenseExpiresOn: "",
    insuranceStatus: "",
    insuranceExpiresOn: "",
    w9Status: "",
    preferred,
    vendorStatus,
    sharedNetworkVisible,
    internalNotes: "",
    publicNotes: submission.notes ?? "",
    forceCreate: true,
  });

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: values.companyName,
      type: "vendor",
      status: orgStatusFromVendorStatus(values.vendorStatus),
    })
    .select("id")
    .single();
  if (orgError || !org) return { ok: false, error: "Vendor could not be created from submission." };

  const { error: profileError } = await admin.from("vendor_profiles").insert({
    organization_id: org.id,
    ...profilePayloadFromForm(values, {
      source: "shared_network",
      createdBy: ctx.userId,
      sourceSubmissionId: submissionId,
    }),
  });
  if (profileError) {
    await admin.from("organizations").delete().eq("id", org.id);
    return { ok: false, error: "Vendor profile could not be created." };
  }

  await admin
    .from("vendor_network_submissions")
    .update({
      status: "approved",
      reviewed_by: ctx.userId,
      reviewed_at: new Date().toISOString(),
      resulting_vendor_organization_id: org.id,
    })
    .eq("id", submissionId);

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: org.id,
    action: "vendor_network_submission.approved",
    entityType: "vendor_network_submissions",
    entityId: submissionId,
    metadata: { resultingVendorId: org.id, companyName: values.companyName },
  });

  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${org.id}`);
  return { ok: true, organizationId: org.id, message: "Network submission approved." };
}

export async function rejectNetworkSubmissionAction(
  submissionId: string,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireInternalStaff();
  const reason = emptyToNull(String(formData.get("rejectionReason") ?? ""));
  const admin = createAdminClient();
  const { error } = await admin
    .from("vendor_network_submissions")
    .update({
      status: "rejected",
      reviewed_by: ctx.userId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", submissionId)
    .in("status", ["pending", "needs_info"]);
  if (error) return { ok: false, error: "Unable to reject submission." };

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_network_submission.rejected",
    entityType: "vendor_network_submissions",
    entityId: submissionId,
    metadata: { reason },
  });
  revalidatePath("/admin/vendors");
  return { ok: true, message: "Submission rejected." };
}

export async function approveNetworkSubmissionFormAction(
  submissionId: string,
  formData: FormData,
) {
  const result = await approveNetworkSubmissionAction(submissionId, formData);
  if (!result.ok) {
    throw new Error(result.error);
  }
  const { redirect } = await import("next/navigation");
  redirect(`/admin/vendors/${result.organizationId}?approved=1`);
}

export async function rejectNetworkSubmissionFormAction(
  submissionId: string,
  formData: FormData,
) {
  const result = await rejectNetworkSubmissionAction(submissionId, formData);
  if (!result.ok) {
    throw new Error(result.error);
  }
  revalidatePath("/admin/vendors");
}

export async function revokeVendorNetworkLinkFormAction(linkId: string) {
  const result = await revokeVendorNetworkLinkAction(linkId);
  if (!result.ok) {
    throw new Error(result.error);
  }
  revalidatePath("/admin/vendors");
}

/** Non-blocking office notification helper used by network submit. */
export async function notifyNetworkSubmission(input: {
  companyName: string;
  submittedBy: string;
  linkName: string;
  submissionId: string;
}) {
  try {
    const siteUrl = getSiteUrl().replace(/\/$/, "");
    await notify({
      event: "vendor_network_submission",
      entityType: "vendor_network_submissions",
      entityId: input.submissionId,
      adminPath: `/admin/vendors?tab=pending`,
      officeEmail: {
        subject: `New Vendor Submitted: ${input.companyName}`,
        react: InternalGenericNotification({
          title: "New Vendor Submitted",
          preview: `${input.companyName} was submitted by ${input.submittedBy} through ${input.linkName}.`,
          rows: [
            { label: "Vendor", value: input.companyName },
            { label: "Submitted by", value: input.submittedBy },
            { label: "Share link", value: input.linkName },
          ],
          adminUrl: `${siteUrl}/admin/vendors?tab=pending`,
        }),
      },
    });
  } catch {
    // Notification failures must not block persistence.
  }
}
