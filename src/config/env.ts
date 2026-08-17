import {
  getBrowserSupabaseConfigStatus,
  getPasswordRecoveryRedirectTo,
  getPublicSupabasePublishableKey,
  getPublicSupabaseUrl,
  getSiteUrl,
  isBrowserSupabaseConfigured,
} from "@/config/public-env";
import { parseEmailList, parsePhoneList } from "@/config/recipients";
import {
  getNotificationEmailTo,
  getResendApiKey,
  getResendFromEmail,
  getServiceRoleKey,
  getWhatsAppConfig,
  isEmailNotificationsEnabled,
  isFirstUseAlertsEnabled,
  isWhatsAppNotificationsEnabled,
} from "@/config/server-env";

export {
  getBrowserSupabaseConfigStatus,
  getNotificationEmailTo,
  getPasswordRecoveryRedirectTo,
  getResendApiKey,
  getResendFromEmail,
  getServiceRoleKey,
  getSiteUrl,
  getWhatsAppConfig,
  isEmailNotificationsEnabled,
  isFirstUseAlertsEnabled,
  isWhatsAppNotificationsEnabled,
  parseEmailList,
  parsePhoneList,
};

export function isSupabaseConfigured(): boolean {
  return isBrowserSupabaseConfigured();
}

export function getSupabaseUrl(): string | undefined {
  const url = getPublicSupabaseUrl();
  return url || undefined;
}

export function getSupabasePublishableKey(): string | undefined {
  const key = getPublicSupabasePublishableKey();
  return key || undefined;
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

export function notificationStatus() {
  return {
    supabase: isSupabaseConfigured(),
    serviceRole: isServiceRoleConfigured(),
    email: isEmailNotificationsEnabled(),
    whatsapp: isWhatsAppNotificationsEnabled(),
  };
}
