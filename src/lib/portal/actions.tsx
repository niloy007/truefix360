"use server";

import { revalidatePath } from "next/cache";
import { STORAGE_BUCKETS } from "@/config/platform";
import { writeAuditLog } from "@/lib/audit";
import { requireClientUser, requireVendorUser } from "@/lib/auth/guards";
import { InternalGenericNotification } from "@/emails/InternalGenericNotification";
import { getSiteUrl } from "@/config/env";
import { notify } from "@/lib/notifications";
import { storePrivateFiles } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";

const vendorTransitions: Record<string, string> = {
  accept: "assigned",
  decline: "sourcing",
  on_my_way: "en_route",
  on_site: "on_site",
  complete: "completed",
};

export async function createClientServiceRequest(formData: FormData) {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const propertyId = String(formData.get("propertyId") ?? "");
  const { data: property } = await admin
    .from("properties")
    .select("id, client_organization_id, city, state")
    .eq("id", propertyId)
    .eq("client_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!property) throw new Error("Select a property you can access.");

  const { data: reference } = await admin.rpc("next_reference", {
    p_kind: "service_request",
    p_prefix: "TFSR",
  });
  const { data: request, error } = await admin
    .from("service_requests")
    .insert({
      reference_number: reference,
      client_organization_id: ctx.membership.organizationId,
      property_id: property.id,
      service_category: String(formData.get("serviceCategory") ?? ""),
      issue: String(formData.get("issue") ?? ""),
      description: String(formData.get("description") ?? ""),
      priority: String(formData.get("priority") ?? "routine"),
      preferred_schedule: String(formData.get("preferredSchedule") ?? "") || null,
      client_reference: String(formData.get("clientReference") ?? "") || null,
      client_nte: formData.get("clientNte") ? Number(formData.get("clientNte")) : null,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error || !request) throw new Error("The service request could not be saved.");

  const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 0) {
    const stored = await storePrivateFiles({
      bucket: STORAGE_BUCKETS.workOrderFiles,
      folder: `service-requests/${request.id}`,
      files,
    });
    await admin.from("service_request_files").insert(
      stored.map((file) => ({
        service_request_id: request.id,
        uploaded_by: ctx.userId,
        storage_path: file.storagePath,
        original_name: file.originalName,
        mime_type: file.mimeType,
        size_bytes: file.sizeBytes,
      })),
    );
  }

  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: "service_request.submitted",
    entityType: "service_requests",
    entityId: request.id,
  });
  await notify({
    event: "client_service_request.submitted",
    entityType: "service_requests",
    entityId: request.id,
    adminPath: `/admin/service-requests/${request.id}`,
    officeEmail: {
      subject: `[${reference}] New client service request`,
      react: (
        <InternalGenericNotification
          title="New client service request"
          preview={`${ctx.membership.organizationName} submitted ${reference}`}
          adminUrl={`${getSiteUrl()}/admin/service-requests/${request.id}`}
          rows={[
            { label: "Client", value: ctx.membership.organizationName },
            { label: "Reference", value: String(reference) },
            { label: "Property", value: `${property.city}, ${property.state}` },
            { label: "Service", value: String(formData.get("serviceCategory") ?? "") },
            { label: "Priority", value: String(formData.get("priority") ?? "") },
            { label: "Time", value: formatDateTime(new Date()) },
          ]}
        />
      ),
    },
    whatsapp: {
      template: "service_request",
      parameters: [
        "Service request",
        String(reference),
        ctx.membership.organizationName,
        `${property.city}, ${property.state}`,
        String(formData.get("serviceCategory") ?? ""),
        String(formData.get("priority") ?? ""),
        String(formData.get("issue") ?? ""),
        "n/a",
        "n/a",
      ],
    },
  });
  revalidatePath("/portal/client/requests");
}

export async function decideClientEstimate(estimateId: string, decision: "approved" | "declined", comment: string) {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data: estimate } = await admin
    .from("estimates")
    .select("id, reference_number, work_order_id, status, client_sell_amount, client_visible_scope, client_comment, created_at, work_orders!inner(client_organization_id)")
    .eq("id", estimateId)
    .eq("work_orders.client_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!estimate) throw new Error("Estimate not found.");

  await admin
    .from("estimates")
    .update({ status: decision, client_comment: comment || null })
    .eq("id", estimateId);
  await admin.from("work_order_events").insert({
    work_order_id: estimate.work_order_id,
    event: `estimate_${decision}`,
    actor_user_id: ctx.userId,
    visibility: "shared",
    note: comment || null,
  });
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: decision === "approved" ? "estimate.approved" : "estimate.declined",
    entityType: "estimates",
    entityId: estimateId,
  });
  await notify({
    event: decision === "approved" ? "client_estimate.approved" : "client_estimate.declined",
    entityType: "estimates",
    entityId: estimateId,
    adminPath: `/admin/estimates/${estimateId}`,
    officeEmail: {
      subject: `Client ${decision} estimate ${estimate.reference_number}`,
      react: (
        <InternalGenericNotification
          title={`Estimate ${decision}`}
          preview={`${ctx.membership.organizationName} ${decision} ${estimate.reference_number}`}
          adminUrl={`${getSiteUrl()}/admin/estimates/${estimateId}`}
          rows={[
            { label: "Client", value: ctx.membership.organizationName },
            { label: "Estimate", value: estimate.reference_number },
            { label: "Decision", value: decision },
            { label: "Comment", value: comment || "n/a" },
          ]}
        />
      ),
    },
    whatsapp: {
      template: "submission",
      parameters: [
        `Estimate ${decision}`,
        estimate.reference_number,
        ctx.membership.organizationName,
        "n/a",
        ctx.email,
        "n/a",
        "estimate",
        decision,
        comment || "n/a",
      ],
    },
  });
  revalidatePath("/portal/client/estimates");
}

export async function vendorJobAction(assignmentId: string, action: string, reason?: string) {
  const ctx = await requireVendorUser();
  if (!["accept", "decline", "on_my_way", "on_site", "complete"].includes(action)) {
    throw new Error("That action is not allowed.");
  }
  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("work_order_assignments")
    .select("*")
    .eq("id", assignmentId)
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!assignment) throw new Error("Assignment not found.");

  const now = new Date().toISOString();
  const assignmentPatch: Record<string, unknown> = {};
  if (action === "accept") {
    assignmentPatch.status = "accepted";
    assignmentPatch.accepted_at = now;
  }
  if (action === "decline") {
    assignmentPatch.status = "declined";
    assignmentPatch.declined_at = now;
    assignmentPatch.decline_reason = reason ?? null;
  }
  if (action === "complete") {
    assignmentPatch.status = "completed";
    assignmentPatch.completed_at = now;
  }
  if (Object.keys(assignmentPatch).length > 0) {
    await admin.from("work_order_assignments").update(assignmentPatch).eq("id", assignmentId);
  }

  const newStatus = vendorTransitions[action];
  await admin.from("work_orders").update({ status: newStatus }).eq("id", assignment.work_order_id);
  await admin.from("work_order_events").insert({
    work_order_id: assignment.work_order_id,
    event: action,
    actor_user_id: ctx.userId,
    new_status: newStatus,
    visibility: "shared",
    note: reason ?? null,
  });
  if (action === "complete") {
    await notify({
      event: "work_order.completed",
      entityType: "work_orders",
      entityId: assignment.work_order_id,
      adminPath: `/admin/work-orders/${assignment.work_order_id}`,
      officeEmail: {
        subject: "Work order marked complete",
        react: (
          <InternalGenericNotification
            title="Work order completed"
            preview="A vendor marked work complete."
            adminUrl={`${getSiteUrl()}/admin/work-orders/${assignment.work_order_id}`}
            rows={[
              { label: "Vendor", value: ctx.membership.organizationName },
              { label: "Work order", value: assignment.work_order_id },
            ]}
          />
        ),
      },
    });
  }
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: `work_order.${action}`,
    entityType: "work_orders",
    entityId: assignment.work_order_id,
  });
  revalidatePath("/portal/vendor/assignments");
}

export async function submitVendorEstimate(formData: FormData) {
  const ctx = await requireVendorUser();
  const workOrderId = String(formData.get("workOrderId") ?? "");
  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("work_order_assignments")
    .select("id")
    .eq("work_order_id", workOrderId)
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!assignment) throw new Error("You can only estimate assigned work.");
  const { data: reference } = await admin.rpc("next_reference", { p_kind: "estimate", p_prefix: "TFEST" });
  const { data: estimate } = await admin
    .from("estimates")
    .insert({
      reference_number: reference,
      work_order_id: workOrderId,
      vendor_organization_id: ctx.membership.organizationId,
      submitted_by: ctx.userId,
      amount: Number(formData.get("amount")),
      description: String(formData.get("description") ?? ""),
      labor_material_explanation: String(formData.get("laborMaterial") ?? ""),
      status: "submitted",
    })
    .select("id")
    .single();
  await admin.from("work_orders").update({ status: "estimate_required" }).eq("id", workOrderId);
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: "estimate.submitted",
    entityType: "estimates",
    entityId: estimate?.id,
  });
  await notify({
    event: "vendor_estimate.submitted",
    entityType: "estimates",
    entityId: estimate?.id ?? workOrderId,
    adminPath: `/admin/estimates/${estimate?.id}`,
    officeEmail: {
      subject: `Vendor estimate ${reference}`,
      react: (
        <InternalGenericNotification
          title="Vendor estimate submitted"
          preview={`${ctx.membership.organizationName} submitted ${reference}`}
          adminUrl={`${getSiteUrl()}/admin/estimates/${estimate?.id}`}
          rows={[
            { label: "Vendor", value: ctx.membership.organizationName },
            { label: "Reference", value: String(reference) },
          ]}
        />
      ),
    },
  });
  revalidatePath("/portal/vendor/estimates");
}

export async function uploadWorkOrderPhoto(formData: FormData) {
  const ctx = await requireVendorUser();
  const workOrderId = String(formData.get("workOrderId") ?? "");
  const category = String(formData.get("category") ?? "supporting");
  if (!["before", "during", "after", "supporting", "completion", "estimate"].includes(category)) {
    throw new Error("Invalid photo category.");
  }
  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("work_order_assignments")
    .select("id")
    .eq("work_order_id", workOrderId)
    .eq("vendor_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!assignment) throw new Error("Assignment not found.");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  const stored = await storePrivateFiles({
    bucket: STORAGE_BUCKETS.workOrderFiles,
    folder: `${workOrderId}/${ctx.membership.organizationId}`,
    files,
  });
  await admin.from("work_order_files").insert(
    stored.map((file) => ({
      work_order_id: workOrderId,
      uploaded_by: ctx.userId,
      organization_id: ctx.membership.organizationId,
      category,
      storage_path: file.storagePath,
      original_name: file.originalName,
      mime_type: file.mimeType,
      size_bytes: file.sizeBytes,
      caption: String(formData.get("caption") ?? "") || null,
      visibility: "vendor",
    })),
  );
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: "file.uploaded",
    entityType: "work_orders",
    entityId: workOrderId,
    metadata: { category },
  });
  revalidatePath(`/portal/vendor/assignments/${assignment.id}`);
}

export async function uploadVendorDocument(formData: FormData) {
  const ctx = await requireVendorUser();
  const category = String(formData.get("category") ?? "other");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  const stored = await storePrivateFiles({
    bucket: STORAGE_BUCKETS.vendorDocuments,
    folder: ctx.membership.organizationId,
    files,
  });
  const admin = createAdminClient();
  await admin.from("vendor_documents").insert(
    stored.map((file) => ({
      vendor_organization_id: ctx.membership.organizationId,
      uploaded_by: ctx.userId,
      category,
      storage_path: file.storagePath,
      original_name: file.originalName,
      mime_type: file.mimeType,
      size_bytes: file.sizeBytes,
    })),
  );
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: "file.uploaded",
    entityType: "vendor_documents",
    metadata: { category },
  });
  revalidatePath("/portal/vendor/documents");
}

export async function updateVendorCompany(formData: FormData) {
  const ctx = await requireVendorUser();
  const admin = createAdminClient();
  await admin
    .from("vendor_profiles")
    .update({
      primary_phone: String(formData.get("phone") ?? "") || null,
      primary_email: String(formData.get("email") ?? "") || null,
      coverage: String(formData.get("coverage") ?? "") || null,
      service_categories: String(formData.get("services") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    })
    .eq("organization_id", ctx.membership.organizationId);
  revalidatePath("/portal/vendor/company");
}
