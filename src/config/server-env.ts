import "server-only";

import { parseEmailList, parsePhoneList } from "@/config/recipients";

function read(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function flag(name: string, fallback: boolean): boolean {
  const value = read(name);
  if (value === undefined) return fallback;
  return value.toLowerCase() !== "false" && value !== "0";
}

export function getServiceRoleKey(): string | undefined {
  return read("SUPABASE_SERVICE_ROLE_KEY");
}

export function getResendApiKey(): string | undefined {
  return read("RESEND_API_KEY");
}

export function getResendFromEmail(): string {
  return (
    read("RESEND_FROM_EMAIL") ??
    "TrueFix360 <notifications@notify.truefix360.com>"
  );
}

export function getNotificationEmailTo(): string[] {
  return parseEmailList(
    read("NOTIFICATION_EMAIL_TO") ??
      "office@truefix360.com,support@truefix360.com",
  );
}

export function isEmailNotificationsEnabled(): boolean {
  return flag("EMAIL_NOTIFICATIONS_ENABLED", true) && Boolean(getResendApiKey());
}

export function isWhatsAppNotificationsEnabled(): boolean {
  return (
    flag("WHATSAPP_NOTIFICATIONS_ENABLED", false) &&
    Boolean(read("WHATSAPP_ACCESS_TOKEN")) &&
    Boolean(read("WHATSAPP_PHONE_NUMBER_ID"))
  );
}

export function getWhatsAppConfig() {
  return {
    version: read("WHATSAPP_GRAPH_VERSION") ?? "v21.0",
    accessToken: read("WHATSAPP_ACCESS_TOKEN"),
    phoneNumberId: read("WHATSAPP_PHONE_NUMBER_ID"),
    recipients: parsePhoneList(read("WHATSAPP_NOTIFY_TO")),
    templateNewSubmission: read("WHATSAPP_TEMPLATE_NEW_SUBMISSION"),
    templateNewServiceRequest: read("WHATSAPP_TEMPLATE_NEW_SERVICE_REQUEST"),
    templateVendorUpdate: read("WHATSAPP_TEMPLATE_VENDOR_UPDATE"),
    languageCode: read("WHATSAPP_TEMPLATE_LANGUAGE_CODE") ?? "en_US",
  };
}

export function isFirstUseAlertsEnabled(): boolean {
  return flag("LOGIN_FIRST_USE_ALERTS_ENABLED", true);
}

/** Server-only secret used to encrypt Vendor Network share tokens for admin recovery. */
export function getVendorNetworkTokenEncryptionKey(): string | undefined {
  return read("VENDOR_NETWORK_TOKEN_ENCRYPTION_KEY");
}

export { parseEmailList, parsePhoneList };
