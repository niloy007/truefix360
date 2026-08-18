"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/config/env";
import { writeAuditLog } from "@/lib/audit";
import { requireInternalStaff } from "@/lib/auth/guards";
import { proposeCoverageFromApplication } from "@/lib/coverage/service";
import { retryNotification } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/config/platform";

async function staff() {
  return requireInternalStaff();
}

export async function updateContactStatus(id: string, status: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  await admin.from("contact_submissions").update({ status }).eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: "contact.status_change",
    entityType: "contact_submissions",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
}

export async function updateQuoteStatus(id: string, status: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  await admin.from("quote_requests").update({ status }).eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId: ctx.membership.organizationId,
    action: "quote.status_change",
    entityType: "quote_requests",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
}

export async function convertQuoteToServiceRequest(id: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  const { data: quote } = await admin.from("quote_requests").select("*").eq("id", id).single();
  if (!quote) throw new Error("Quote not found.");

  const orgName = quote.company || `${quote.first_name} ${quote.last_name}`.trim();
  const { data: org } = await admin
    .from("organizations")
    .insert({ name: orgName, type: "client", status: "active" })
    .select("id")
    .single();
  if (!org) throw new Error("Client organization could not be created.");

  await admin.from("client_accounts").insert({
    organization_id: org.id,
    billing_email: quote.email,
    billing_phone: quote.phone,
  });

  const { data: property } = await admin
    .from("properties")
    .insert({
      client_organization_id: org.id,
      address1: quote.property_address,
      city: quote.city,
      state: quote.state,
      zip: quote.zip,
      property_type: quote.property_type,
      occupancy_status: quote.occupancy_status,
    })
    .select("id")
    .single();

  const { data: reference } = await admin.rpc("next_reference", {
    p_kind: "service_request",
    p_prefix: "TFSR",
  });

  const { data: request } = await admin
    .from("service_requests")
    .insert({
      reference_number: reference,
      client_organization_id: org.id,
      property_id: property?.id ?? null,
      originating_quote_id: quote.id,
      service_category: quote.service_category,
      issue: quote.requested_service,
      description: quote.description,
      priority: quote.urgency === "emergency" || quote.urgency === "priority" ? quote.urgency : "routine",
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  await admin
    .from("quote_requests")
    .update({ status: "converted", converted_service_request_id: request?.id ?? null })
    .eq("id", id);

  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "quote.converted",
    entityType: "quote_requests",
    entityId: id,
    metadata: { serviceRequestId: request?.id },
  });
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/service-requests");
}

export async function updateVendorApplicationStatus(id: string, status: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  await admin.from("vendor_applications").update({ status }).eq("id", id);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor_application.status_change",
    entityType: "vendor_applications",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/vendor-applications");
  revalidatePath(`/admin/vendor-applications/${id}`);
}

export async function approveVendorApplication(id: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  const { data: app } = await admin.from("vendor_applications").select("*").eq("id", id).single();
  if (!app) throw new Error("Application not found.");

  const { data: org } = await admin
    .from("organizations")
    .insert({ name: app.company_name, type: "vendor", status: "active" })
    .select("id")
    .single();
  if (!org) throw new Error("Vendor organization could not be created.");

  const { data: profile } = await admin.from("vendor_profiles").insert({
    organization_id: org.id,
    legal_name: app.company_name,
    primary_contact_name: `${app.first_name} ${app.last_name}`.trim(),
    primary_email: app.email,
    primary_phone: app.phone,
    website: app.website,
    address: app.address,
    city: app.city,
    state: app.state,
    zip: app.zip,
    service_categories: app.services,
    coverage: `${app.states_covered}; ${app.counties_cities}`,
    insurance_status: app.insurance_status,
    workers_comp_status: app.workers_comp_status,
    onboarding_status: "approved",
  }).select("id").single();

  await admin
    .from("vendor_applications")
    .update({ status: "approved", vendor_organization_id: org.id })
    .eq("id", id);

  await proposeCoverageFromApplication({
    applicationId: id,
    organizationId: org.id,
    profileId: profile?.id ?? null,
    statesCovered: app.states_covered,
    countiesCities: app.counties_cities,
    services: app.services,
    travelRadius: app.travel_radius,
  });
  await inviteUser(org.id, app.email, "vendor_admin", app.first_name, app.last_name);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "vendor.approved",
    entityType: "vendor_applications",
    entityId: id,
    metadata: { organizationId: org.id },
  });
  revalidatePath("/admin/vendor-applications");
  revalidatePath("/admin/vendors");
}

export async function inviteUserAction(formData: FormData) {
  const ctx = await staff();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const organizationId = String(formData.get("organizationId") ?? "");
  const role = String(formData.get("role") ?? "") as AppRole;
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  if (!email || !organizationId || !role) {
    throw new Error("Email, organization, and role are required.");
  }
  await inviteUser(organizationId, email, role, firstName, lastName);
  await writeAuditLog({
    actorUserId: ctx.userId,
    organizationId,
    action: role === "client" ? "client.invite" : "vendor.invite",
    entityType: "invitations",
    metadata: { email, role },
  });
  revalidatePath("/admin/users");
}

async function inviteUser(
  organizationId: string,
  email: string,
  role: AppRole,
  firstName: string,
  lastName: string,
) {
  const admin = createAdminClient();
  await admin.from("invitations").insert({
    email,
    organization_id: organizationId,
    role,
    status: "pending",
  });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/invite`,
    data: { first_name: firstName, last_name: lastName },
  });
  if (error) throw new Error("The invitation could not be sent.");
  if (data.user) {
    await admin.from("organization_memberships").upsert({
      organization_id: organizationId,
      user_id: data.user.id,
      role,
      status: "invited",
    }, { onConflict: "organization_id,user_id,role" });
  }
}

export async function retryNotificationAction(id: string) {
  await staff();
  await retryNotification(id);
  revalidatePath("/admin/notifications");
}

export async function createWorkOrderFromRequest(serviceRequestId: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  const { data: request } = await admin
    .from("service_requests")
    .select("*")
    .eq("id", serviceRequestId)
    .single();
  if (!request) throw new Error("Service request not found.");
  const { data: reference } = await admin.rpc("next_reference", {
    p_kind: "work_order",
    p_prefix: "TFWO",
  });
  const { data: workOrder } = await admin
    .from("work_orders")
    .insert({
      reference_number: reference,
      client_organization_id: request.client_organization_id,
      property_id: request.property_id,
      originating_service_request_id: request.id,
      service_category: request.service_category,
      title: request.issue,
      scope: request.description,
      priority: request.priority,
      client_reference: request.client_reference,
      client_nte: request.client_nte,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  await admin.from("work_order_events").insert({
    work_order_id: workOrder?.id,
    event: "created",
    actor_user_id: ctx.userId,
    new_status: "new",
    visibility: "shared",
  });
  await admin.from("service_requests").update({ status: "converted" }).eq("id", serviceRequestId);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "work_order.created",
    entityType: "work_orders",
    entityId: workOrder?.id,
  });
  revalidatePath("/admin/work-orders");
}

export async function assignWorkOrder(workOrderId: string, vendorOrganizationId: string) {
  const ctx = await staff();
  const admin = createAdminClient();
  await admin.from("work_order_assignments").insert({
    work_order_id: workOrderId,
    vendor_organization_id: vendorOrganizationId,
    status: "offered",
  });
  await admin.from("work_orders").update({ status: "offered" }).eq("id", workOrderId);
  await admin.from("work_order_events").insert({
    work_order_id: workOrderId,
    event: "offered",
    actor_user_id: ctx.userId,
    new_status: "offered",
    visibility: "vendor",
  });
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "work_order.assignment",
    entityType: "work_orders",
    entityId: workOrderId,
    metadata: { vendorOrganizationId },
  });
  revalidatePath("/admin/work-orders");
  revalidatePath("/admin/dispatch");
  revalidatePath(`/admin/work-orders/${workOrderId}`);
}

export async function createWorkOrder(formData: FormData) {
  const ctx = await staff();
  const admin = createAdminClient();
  const clientOrganizationId = String(formData.get("clientOrganizationId") ?? "");
  const propertyId = String(formData.get("propertyId") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const serviceCategory = String(formData.get("serviceCategory") ?? "").trim();
  const priority = String(formData.get("priority") ?? "routine");
  const scope = String(formData.get("scope") ?? "").trim();
  const scheduledStart = String(formData.get("scheduledStart") ?? "") || null;
  const scheduledEnd = String(formData.get("scheduledEnd") ?? "") || null;
  if (!clientOrganizationId || !title || !serviceCategory) {
    throw new Error("Client, title, and service category are required.");
  }
  const { data: reference } = await admin.rpc("next_reference", {
    p_kind: "work_order",
    p_prefix: "TFWO",
  });
  const { data: workOrder, error } = await admin
    .from("work_orders")
    .insert({
      reference_number: reference,
      client_organization_id: clientOrganizationId,
      property_id: propertyId,
      service_category: serviceCategory,
      title,
      scope,
      priority,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error || !workOrder) throw new Error("The work order could not be created.");
  await admin.from("work_order_events").insert({
    work_order_id: workOrder.id,
    event: "created",
    actor_user_id: ctx.userId,
    new_status: "new",
    visibility: "shared",
  });
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "work_order.created",
    entityType: "work_orders",
    entityId: workOrder.id,
  });
  revalidatePath("/admin/work-orders");
  revalidatePath("/admin");
  redirect(`/admin/work-orders/${workOrder.id}`);
}

export async function updateWorkOrderSchedule(formData: FormData) {
  await staff();
  const workOrderId = String(formData.get("workOrderId") ?? "");
  const scheduledStart = String(formData.get("scheduledStart") ?? "") || null;
  const scheduledEnd = String(formData.get("scheduledEnd") ?? "") || null;
  const admin = createAdminClient();
  const patch: Record<string, string | null> = {
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
  };
  if (scheduledStart) patch.status = "scheduled";
  await admin.from("work_orders").update(patch).eq("id", workOrderId);
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath("/admin/dispatch");
}

export async function publishClientEstimate(formData: FormData) {
  const ctx = await staff();
  const estimateId = String(formData.get("estimateId") ?? "");
  const sell = Number(formData.get("clientSellAmount"));
  const scope = String(formData.get("clientVisibleScope") ?? "");
  const admin = createAdminClient();
  await admin
    .from("estimates")
    .update({
      client_sell_amount: sell,
      client_visible_scope: scope,
      status: "sent_to_client",
    })
    .eq("id", estimateId);
  await writeAuditLog({
    actorUserId: ctx.userId,
    action: "estimate.sent_to_client",
    entityType: "estimates",
    entityId: estimateId,
  });
  revalidatePath("/admin/estimates");
}
