import type { ReactElement } from "react";

export type NotificationEvent =
  | "contact.submitted"
  | "quote.submitted"
  | "vendor_application.submitted"
  | "client_service_request.submitted"
  | "vendor_estimate.submitted"
  | "client_estimate.approved"
  | "client_estimate.declined"
  | "work_order.completed"
  | "auth.first_login"
  | "coverage_request.submitted"
  | "vendor_network_submission";

export type NotifyPayload = {
  event: NotificationEvent;
  entityType: string;
  entityId: string;
  referenceNumber?: string;
  adminPath?: string;
  replyTo?: string;
  officeEmail?: {
    subject: string;
    react: ReactElement;
  };
  submitterEmail?: {
    to: string;
    subject: string;
    react: ReactElement;
  };
  whatsapp?: {
    template: "submission" | "service_request" | "vendor_update";
    parameters: string[];
  };
};
