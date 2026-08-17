import "server-only";
import { Resend } from "resend";
import type { ReactElement } from "react";
import {
  getNotificationEmailTo,
  getResendApiKey,
  getResendFromEmail,
  isEmailNotificationsEnabled,
} from "@/config/env";

export type EmailSendResult = {
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string;
  sanitizedError?: string;
  recipients: string[];
};

function getClient(): Resend | null {
  const key = getResendApiKey();
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(options: {
  to: string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const recipients = options.to.filter(Boolean);
  if (recipients.length === 0) {
    return { status: "skipped", sanitizedError: "no_recipients", recipients: [] };
  }
  if (!isEmailNotificationsEnabled()) {
    return { status: "skipped", sanitizedError: "skipped_not_configured", recipients };
  }
  const client = getClient();
  if (!client) {
    return { status: "skipped", sanitizedError: "skipped_not_configured", recipients };
  }

  try {
    const { data, error } = await client.emails.send({
      from: getResendFromEmail(),
      to: recipients,
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo,
    });
    if (error) {
      return {
        status: "failed",
        sanitizedError: sanitizeProviderError(error.message),
        recipients,
      };
    }
    return {
      status: "sent",
      providerMessageId: data?.id,
      recipients,
    };
  } catch {
    return {
      status: "failed",
      sanitizedError: "email_provider_error",
      recipients,
    };
  }
}

export function officeRecipients(): string[] {
  return getNotificationEmailTo();
}

function sanitizeProviderError(message: string): string {
  return message.replace(/re_[a-zA-Z0-9]+/g, "[redacted]").slice(0, 280);
}
