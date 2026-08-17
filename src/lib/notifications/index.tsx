import "server-only";
import { getSiteUrl, getWhatsAppConfig } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { officeRecipients, sendEmail } from "@/lib/notifications/email";
import type { NotifyPayload } from "@/lib/notifications/types";
import { sendWhatsAppTemplate } from "@/lib/notifications/whatsapp";

export async function notify(payload: NotifyPayload): Promise<void> {
  const admin = createAdminClient();
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const adminUrl = payload.adminPath ? `${siteUrl}${payload.adminPath}` : `${siteUrl}/admin`;

  if (payload.officeEmail) {
    const result = await sendEmail({
      to: officeRecipients(),
      subject: payload.officeEmail.subject,
      react: payload.officeEmail.react,
      replyTo: payload.replyTo,
    });
    await recordDeliveries(admin, payload, "email", result.recipients, result);
  }

  if (payload.submitterEmail) {
    const result = await sendEmail({
      to: [payload.submitterEmail.to],
      subject: payload.submitterEmail.subject,
      react: payload.submitterEmail.react,
    });
    await recordDeliveries(admin, payload, "email", result.recipients, result);
  }

  if (payload.whatsapp) {
    const config = getWhatsAppConfig();
    const templateName =
      payload.whatsapp.template === "service_request"
        ? config.templateNewServiceRequest
        : payload.whatsapp.template === "vendor_update"
          ? config.templateVendorUpdate
          : config.templateNewSubmission;

    if (!templateName || config.recipients.length === 0) {
      await recordDeliveries(
        admin,
        payload,
        "whatsapp",
        config.recipients.length ? config.recipients : ["unconfigured"],
        { status: "skipped", sanitizedError: "skipped_not_configured" },
      );
      return;
    }

    const parameters = [...payload.whatsapp.parameters];
    if (parameters.length < 10) {
      parameters.push(adminUrl);
    } else {
      parameters[9] = adminUrl;
    }

    for (const recipient of config.recipients) {
      const result = await sendWhatsAppTemplate({
        recipient,
        templateName,
        language: config.languageCode,
        parameters,
      });
      await recordDeliveries(admin, payload, "whatsapp", [recipient], result);
    }
  }
}

export async function retryNotification(id: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("notification_deliveries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.status !== "failed") return;

  if (data.provider === "email") {
    const result = await sendEmail({
      to: [data.recipient],
      subject: `Retry: ${data.event_type}`,
      react: (
        <p>
          A previous notification failed and was retried. Open the original record in TrueFix360
          Admin. Event: {data.event_type}. Entity: {data.entity_id}.
        </p>
      ),
    });
    await admin
      .from("notification_deliveries")
      .update({
        status: result.status,
        provider_message_id: result.providerMessageId ?? null,
        sanitized_error: result.sanitizedError ?? null,
        attempted_at: new Date().toISOString(),
        delivered_at: result.status === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    return;
  }

  const config = getWhatsAppConfig();
  if (!config.templateNewSubmission) return;
  const result = await sendWhatsAppTemplate({
    recipient: data.recipient,
    templateName: config.templateNewSubmission,
    language: config.languageCode,
    parameters: [data.event_type, data.entity_id ?? "n/a", "retry", "n/a", "n/a", "n/a", "n/a", "n/a", "n/a", `${getSiteUrl()}/admin`],
  });
  await admin
    .from("notification_deliveries")
    .update({
      status: result.status,
      provider_message_id: result.providerMessageId ?? null,
      sanitized_error: result.sanitizedError ?? null,
      attempted_at: new Date().toISOString(),
      delivered_at: result.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", id);
}

async function recordDeliveries(
  admin: ReturnType<typeof createAdminClient>,
  payload: NotifyPayload,
  provider: "email" | "whatsapp",
  recipients: string[],
  result: {
    status: "sent" | "failed" | "skipped";
    providerMessageId?: string;
    sanitizedError?: string;
  },
) {
  const rows = recipients.map((recipient) => ({
    event_type: payload.event,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    provider,
    recipient,
    status: result.status,
    provider_message_id: result.providerMessageId ?? null,
    sanitized_error: result.sanitizedError ?? null,
    delivered_at: result.status === "sent" ? new Date().toISOString() : null,
  }));
  if (rows.length === 0) return;
  await admin.from("notification_deliveries").insert(rows);
}
