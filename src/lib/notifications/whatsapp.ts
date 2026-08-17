import "server-only";
import {
  getWhatsAppConfig,
  isWhatsAppNotificationsEnabled,
} from "@/config/env";

export type WhatsAppSendResult = {
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string;
  sanitizedError?: string;
  recipient: string;
};

export async function sendWhatsAppTemplate(options: {
  recipient: string;
  templateName: string;
  language: string;
  parameters: string[];
}): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();
  if (!isWhatsAppNotificationsEnabled() || !config.accessToken || !config.phoneNumberId) {
    return {
      status: "skipped",
      sanitizedError: "skipped_not_configured",
      recipient: options.recipient,
    };
  }

  const to = options.recipient.replace(/^\+/, "");
  const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: options.templateName,
          language: { code: options.language },
          components: [
            {
              type: "body",
              parameters: options.parameters.slice(0, 10).map((text) => ({
                type: "text",
                text: text.slice(0, 1024) || "n/a",
              })),
            },
          ],
        },
      }),
    });

    const json = (await response.json().catch(() => null)) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number };
    } | null;

    if (!response.ok) {
      return {
        status: "failed",
        sanitizedError: sanitizeWhatsAppError(json?.error?.message ?? "whatsapp_error"),
        recipient: options.recipient,
      };
    }

    return {
      status: "sent",
      providerMessageId: json?.messages?.[0]?.id,
      recipient: options.recipient,
    };
  } catch {
    return {
      status: "failed",
      sanitizedError: "whatsapp_network_error",
      recipient: options.recipient,
    };
  }
}

function sanitizeWhatsAppError(message: string): string {
  return message.replace(/Bearer\s+\S+/gi, "[redacted]").slice(0, 280);
}
