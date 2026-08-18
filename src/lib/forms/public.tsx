import "server-only";
import { isServiceRoleConfigured } from "@/config/env";
import { STORAGE_BUCKETS } from "@/config/platform";
import { ContactConfirmation } from "@/emails/ContactConfirmation";
import { InternalContactNotification } from "@/emails/InternalContactNotification";
import { InternalQuoteNotification } from "@/emails/InternalQuoteNotification";
import { CoverageRequestConfirmation } from "@/emails/CoverageRequestConfirmation";
import { InternalCoverageRequestNotification } from "@/emails/InternalCoverageRequestNotification";
import { InternalVendorApplicationNotification } from "@/emails/InternalVendorApplicationNotification";
import { QuoteConfirmation } from "@/emails/QuoteConfirmation";
import { VendorConfirmation } from "@/emails/VendorConfirmation";
import { writeAuditLog } from "@/lib/audit";
import {
  coverageRequestSchema,
  contactSchema,
  quoteSchema,
  vendorSchema,
} from "@/lib/form-schemas";
import { enforceRateLimit, findIdempotent, saveIdempotent } from "@/lib/forms/abuse";
import { isHoneypotTriggered } from "@/lib/forms/spam";
import {
  formatDateTime,
  normalizeEmail,
  normalizePhone,
  normalizeState,
  normalizeZip,
  splitPersonName,
  summarizeText,
} from "@/lib/format";
import { checkCoverage, recordDemandGap } from "@/lib/coverage/service";
import { displayCountyName, normalizeStateCode, serviceLabel } from "@/lib/coverage/logic";
import { notify } from "@/lib/notifications";
import { storePrivateFiles } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormSubmitResult } from "@/types";

const RECEIVED =
  "Save this number for your records. TrueFix360 has stored your submission.";

export async function submitContact(input: unknown, idempotencyKey: string | null): Promise<FormSubmitResult> {
  const parsed = contactSchema.parse(input);
  if (isHoneypotTriggered(parsed.companyUrl)) return ignored();
  await ready();
  await enforceRateLimit("contact", parsed.email);
  const existing = await replay(idempotencyKey);
  if (existing) return existing;

  const names = splitPersonName(parsed.name);
  const admin = createAdminClient();
  const reference = await nextReference(admin, "contact", "TFC");
  const { data, error } = await admin
    .from("contact_submissions")
    .insert({
      reference_number: reference,
      first_name: names.firstName,
      last_name: names.lastName,
      company: parsed.company || null,
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      topic: parsed.topic,
      message: parsed.message,
      source: "website",
    })
    .select("id, created_at")
    .single();
  if (error || !data) throw new Error("The message could not be saved.");

  await saveIdempotent(idempotencyKey, "contact_submissions", data.id);
  await writeAuditLog({
    action: "contact.submitted",
    entityType: "contact_submissions",
    entityId: data.id,
    metadata: { reference },
  });

  const warning = await safeNotify(() =>
    notify({
      event: "contact.submitted",
      entityType: "contact_submissions",
      entityId: data.id,
      referenceNumber: reference,
      adminPath: `/admin/contacts/${data.id}`,
      replyTo: parsed.email,
      officeEmail: {
        subject: `[${reference}] New TrueFix360 Contact Request`,
        react: (
          <InternalContactNotification
            referenceNumber={reference}
            firstName={names.firstName}
            lastName={names.lastName}
            company={parsed.company}
            email={parsed.email}
            phone={parsed.phone}
            topic={parsed.topic}
            message={parsed.message}
            submittedAt={formatDateTime(data.created_at)}
            adminUrl={absolute(`/admin/contacts/${data.id}`)}
          />
        ),
      },
      submitterEmail: {
        to: parsed.email,
        subject: `We received your message (${reference})`,
        react: <ContactConfirmation referenceNumber={reference} name={names.firstName} />,
      },
      whatsapp: {
        template: "submission",
        parameters: [
          "Contact",
          reference,
          `${names.firstName} ${names.lastName}`.trim(),
          parsed.phone,
          parsed.email,
          parsed.company || "n/a",
          parsed.topic,
          "n/a",
          summarizeText(parsed.message, 120),
        ],
      },
    }),
  );

  return success(reference, "Your message has been received.", warning);
}

export async function submitQuote(
  input: unknown,
  files: File[],
  idempotencyKey: string | null,
): Promise<FormSubmitResult> {
  const parsed = quoteSchema.parse(input);
  if (isHoneypotTriggered(parsed.companyUrl)) return ignored();
  await ready();
  await enforceRateLimit("quote", parsed.email);
  const existing = await replay(idempotencyKey);
  if (existing) return existing;

  const admin = createAdminClient();
  const reference = await nextReference(admin, "quote", "TFQ");
  const { data, error } = await admin
    .from("quote_requests")
    .insert({
      reference_number: reference,
      first_name: parsed.firstName,
      last_name: parsed.lastName,
      company: parsed.company || null,
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      property_address: parsed.propertyAddress,
      city: parsed.city,
      state: normalizeState(parsed.state),
      zip: normalizeZip(parsed.zip),
      property_type: parsed.propertyType,
      occupancy_status: parsed.occupancyStatus,
      service_category: parsed.serviceCategory,
      requested_service: parsed.requestedService,
      description: parsed.description,
      urgency: parsed.urgency,
      preferred_date: parsed.preferredDate || null,
      number_of_properties: parsed.numberOfProperties,
      preferred_contact_method: parsed.preferredContactMethod,
      source: "website",
    })
    .select("id, created_at")
    .single();
  if (error || !data) throw new Error("The quote request could not be saved.");

  let attachmentCount = 0;
  if (files.length > 0) {
    const stored = await storePrivateFiles({
      bucket: STORAGE_BUCKETS.quoteAttachments,
      folder: data.id,
      files,
    });
    attachmentCount = stored.length;
    if (stored.length > 0) {
      await admin.from("quote_attachments").insert(
        stored.map((file) => ({
          quote_request_id: data.id,
          storage_path: file.storagePath,
          original_name: file.originalName,
          mime_type: file.mimeType,
          size_bytes: file.sizeBytes,
        })),
      );
    }
  }

  await saveIdempotent(idempotencyKey, "quote_requests", data.id);
  await writeAuditLog({
    action: "quote.submitted",
    entityType: "quote_requests",
    entityId: data.id,
    metadata: { reference, attachmentCount },
  });

  const warning = await safeNotify(() =>
    notify({
      event: "quote.submitted",
      entityType: "quote_requests",
      entityId: data.id,
      adminPath: `/admin/quotes/${data.id}`,
      replyTo: parsed.email,
      officeEmail: {
        subject: `[${reference}] New Quote Request — ${parsed.serviceCategory} — ${parsed.city}, ${parsed.state}`,
        react: (
          <InternalQuoteNotification
            referenceNumber={reference}
            firstName={parsed.firstName}
            lastName={parsed.lastName}
            company={parsed.company}
            email={parsed.email}
            phone={parsed.phone}
            propertyAddress={parsed.propertyAddress}
            city={parsed.city}
            state={parsed.state}
            zip={parsed.zip}
            propertyType={parsed.propertyType}
            occupancyStatus={parsed.occupancyStatus}
            serviceCategory={parsed.serviceCategory}
            requestedService={parsed.requestedService}
            description={parsed.description}
            urgency={parsed.urgency}
            preferredDate={parsed.preferredDate}
            numberOfProperties={parsed.numberOfProperties}
            preferredContactMethod={parsed.preferredContactMethod}
            attachmentCount={attachmentCount}
            submittedAt={formatDateTime(data.created_at)}
            adminUrl={absolute(`/admin/quotes/${data.id}`)}
          />
        ),
      },
      submitterEmail: {
        to: parsed.email,
        subject: `We received your quote request (${reference})`,
        react: (
          <QuoteConfirmation
            referenceNumber={reference}
            name={parsed.firstName}
            serviceCategory={parsed.serviceCategory}
            city={parsed.city}
            state={parsed.state}
          />
        ),
      },
      whatsapp: {
        template: "submission",
        parameters: [
          "Quote",
          reference,
          `${parsed.firstName} ${parsed.lastName} / ${parsed.company || "n/a"}`,
          parsed.phone,
          parsed.email,
          `${parsed.city}, ${parsed.state}`,
          parsed.serviceCategory,
          parsed.urgency,
          summarizeText(parsed.description, 120),
        ],
      },
    }),
  );

  return success(
    reference,
    "Your service/quote request has been received. Submitting a request does not constitute acceptance of work or final pricing.",
    warning,
  );
}

export async function submitVendor(input: unknown, idempotencyKey: string | null): Promise<FormSubmitResult> {
  const parsed = vendorSchema.parse(input);
  if (isHoneypotTriggered(parsed.companyUrl)) return ignored();
  await ready();
  await enforceRateLimit("vendor", parsed.email);
  const existing = await replay(idempotencyKey);
  if (existing) return existing;

  const admin = createAdminClient();
  const reference = await nextReference(admin, "vendor", "TFV");
  const { data, error } = await admin
    .from("vendor_applications")
    .insert({
      reference_number: reference,
      company_name: parsed.companyName,
      first_name: parsed.firstName,
      last_name: parsed.lastName,
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      website: parsed.website || null,
      address: parsed.address,
      city: parsed.city,
      state: normalizeState(parsed.state),
      zip: normalizeZip(parsed.zip),
      business_type: parsed.businessType,
      years_in_business: parsed.yearsInBusiness,
      crew_count: parsed.crewCount,
      insurance_status: parsed.insuranceStatus,
      workers_comp_status: parsed.workersCompStatus,
      services: parsed.services,
      states_covered: parsed.statesCovered,
      counties_cities: parsed.countiesCities,
      travel_radius: parsed.travelRadius,
      willing_to_travel: parsed.willingToTravel,
      trip_charge_required: parsed.tripCharge,
      normal_hours: parsed.businessHours,
      emergency_availability: parsed.emergencyAvailability,
      weekend_availability: parsed.weekendAvailability,
      experience: parsed.experience,
    })
    .select("id, created_at")
    .single();
  if (error || !data) throw new Error("The vendor application could not be saved.");

  await saveIdempotent(idempotencyKey, "vendor_applications", data.id);
  await writeAuditLog({
    action: "vendor_application.submitted",
    entityType: "vendor_applications",
    entityId: data.id,
    metadata: { reference },
  });

  const warning = await safeNotify(() =>
    notify({
      event: "vendor_application.submitted",
      entityType: "vendor_applications",
      entityId: data.id,
      adminPath: `/admin/vendor-applications/${data.id}`,
      replyTo: parsed.email,
      officeEmail: {
        subject: `[${reference}] New Vendor Application — ${parsed.companyName} — ${parsed.state}`,
        react: (
          <InternalVendorApplicationNotification
            referenceNumber={reference}
            companyName={parsed.companyName}
            firstName={parsed.firstName}
            lastName={parsed.lastName}
            email={parsed.email}
            phone={parsed.phone}
            website={parsed.website}
            city={parsed.city}
            state={parsed.state}
            services={parsed.services.join(", ")}
            statesCovered={parsed.statesCovered}
            travelRadius={parsed.travelRadius}
            insuranceStatus={parsed.insuranceStatus}
            workersCompStatus={parsed.workersCompStatus}
            emergencyAvailability={parsed.emergencyAvailability}
            weekendAvailability={parsed.weekendAvailability}
            experience={parsed.experience}
            submittedAt={formatDateTime(data.created_at)}
            adminUrl={absolute(`/admin/vendor-applications/${data.id}`)}
          />
        ),
      },
      submitterEmail: {
        to: parsed.email,
        subject: `We received your vendor application (${reference})`,
        react: (
          <VendorConfirmation referenceNumber={reference} companyName={parsed.companyName} />
        ),
      },
      whatsapp: {
        template: "vendor_update",
        parameters: [
          "Vendor application",
          reference,
          parsed.companyName,
          `${parsed.firstName} ${parsed.lastName}`.trim(),
          parsed.phone,
          parsed.email,
          parsed.state,
          parsed.services.slice(0, 4).join(", "),
          summarizeText(parsed.experience, 80),
        ],
      },
    }),
  );

  return success(
    reference,
    "We received your vendor application. Submitting an application does not guarantee work assignments or work volume.",
    warning,
  );
}

export async function submitCoverage(input: unknown, idempotencyKey: string | null): Promise<FormSubmitResult> {
  const parsed = coverageRequestSchema.parse(input);
  if (isHoneypotTriggered(parsed.companyUrl)) return ignored();
  await ready();
  await enforceRateLimit("coverage", parsed.email);
  const existing = await replay(idempotencyKey);
  if (existing) return existing;

  const stateCode = normalizeStateCode(parsed.state);
  if (!stateCode) throw new Error("Enter a valid U.S. state.");
  const check = await checkCoverage({
    state: stateCode,
    county: parsed.county,
    service: parsed.serviceCategory,
  });
  const coverageResult = "error" in check ? "not_established" : check.status;
  const countyName = "error" in check ? displayCountyName(parsed.county) : check.countyName;

  const admin = createAdminClient();
  const reference = await nextReference(admin, "coverage_request", "TFCR");
  const { data, error } = await admin
    .from("coverage_requests")
    .insert({
      reference_number: reference,
      first_name: parsed.firstName,
      last_name: parsed.lastName,
      company: parsed.company || null,
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      property_address: parsed.propertyAddress || null,
      city: parsed.city,
      state_code: stateCode,
      county_name: countyName,
      normalized_county_name: countyName.toLowerCase().replace(/\s+county$/, "").trim(),
      zip: parsed.zip || null,
      service_category: parsed.serviceCategory,
      number_of_properties: parsed.numberOfProperties || null,
      urgency: parsed.urgency,
      description: parsed.description,
      coverage_result_at_submission: coverageResult,
      status: "new",
      source: "website",
    })
    .select("id, created_at")
    .single();
  if (error || !data) throw new Error("The coverage request could not be saved.");

  if (coverageResult === "not_established") {
    await recordDemandGap({
      state: stateCode,
      county: parsed.county,
      service: parsed.serviceCategory,
      source: "coverage_request",
      sourceId: data.id,
      priority: parsed.urgency,
    });
  }

  await saveIdempotent(idempotencyKey, "coverage_requests", data.id);
  await writeAuditLog({
    action: "coverage_request.submitted",
    entityType: "coverage_requests",
    entityId: data.id,
    metadata: { reference, coverageResult },
  });

  const warning = await safeNotify(() =>
    notify({
      event: "coverage_request.submitted",
      entityType: "coverage_requests",
      entityId: data.id,
      adminPath: `/admin/coverage/requests/${data.id}`,
      replyTo: parsed.email,
      officeEmail: {
        subject: `[${reference}] Coverage Request — ${serviceLabel(parsed.serviceCategory)} — ${countyName}, ${stateCode}`,
        react: (
          <InternalCoverageRequestNotification
            referenceNumber={reference}
            firstName={parsed.firstName}
            lastName={parsed.lastName}
            company={parsed.company}
            email={parsed.email}
            phone={parsed.phone}
            city={parsed.city}
            state={stateCode}
            county={countyName}
            serviceCategory={serviceLabel(parsed.serviceCategory)}
            urgency={parsed.urgency}
            numberOfProperties={parsed.numberOfProperties}
            description={parsed.description}
            coverageResult={coverageResult}
            adminUrl={absolute(`/admin/coverage/requests/${data.id}`)}
          />
        ),
      },
      submitterEmail: {
        to: parsed.email,
        subject: `We received your coverage request (${reference})`,
        react: (
          <CoverageRequestConfirmation
            referenceNumber={reference}
            name={parsed.firstName}
            county={countyName}
            state={stateCode}
            serviceCategory={serviceLabel(parsed.serviceCategory)}
          />
        ),
      },
      whatsapp: {
        template: "submission",
        parameters: [
          "Coverage request",
          reference,
          `${countyName}, ${stateCode}`,
          serviceLabel(parsed.serviceCategory),
          parsed.urgency,
          parsed.numberOfProperties || "1",
          "n/a",
          "n/a",
          "n/a",
        ],
      },
    }),
  );

  return success(
    reference,
    "Your coverage request has been received. A request does not guarantee that local coverage can be sourced.",
    warning,
  );
}

async function nextReference(
  admin: ReturnType<typeof createAdminClient>,
  kind: string,
  prefix: string,
) {
  const { data, error } = await admin.rpc("next_reference", {
    p_kind: kind,
    p_prefix: prefix,
  });
  if (error || typeof data !== "string") {
    throw new Error("A reference number could not be generated.");
  }
  return data;
}

async function ready() {
  if (!isServiceRoleConfigured()) {
    throw new Error("Submissions are temporarily unavailable. Please try again later.");
  }
}

async function replay(key: string | null): Promise<FormSubmitResult | null> {
  const found = await findIdempotent(key);
  if (!found) return null;
  const admin = createAdminClient();
  const table =
    found.entity_type === "quote_requests"
      ? "quote_requests"
      : found.entity_type === "vendor_applications"
        ? "vendor_applications"
        : found.entity_type === "coverage_requests"
          ? "coverage_requests"
          : "contact_submissions";
  const { data } = await admin
    .from(table)
    .select("reference_number, created_at")
    .eq("id", found.entity_id)
    .maybeSingle();
  if (!data) return null;
  return {
    ok: true,
    mode: "live",
    receivedAt: data.created_at,
    referenceNumber: data.reference_number,
    message: RECEIVED,
  };
}

function success(referenceNumber: string, message: string, warning?: string): FormSubmitResult {
  return {
    ok: true,
    mode: "live",
    receivedAt: new Date().toISOString(),
    referenceNumber,
    message: `${message} Your reference number is ${referenceNumber}. ${RECEIVED}`,
    warning,
  };
}

function ignored(): FormSubmitResult {
  return {
    ok: true,
    mode: "live",
    receivedAt: new Date().toISOString(),
    message: "Thank you. If this request is needed, our team will follow up.",
  };
}

async function safeNotify(task: () => Promise<void>): Promise<string | undefined> {
  try {
    await task();
    return undefined;
  } catch {
    return "Your request was saved, but we had trouble sending a confirmation email.";
  }
}

function absolute(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://truefix360.com").replace(/\/$/, "");
  return `${base}${path}`;
}
