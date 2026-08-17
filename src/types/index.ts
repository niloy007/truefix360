export type FormMode = "live" | "placeholder";

export type FormKind =
  | "contact"
  | "quote"
  | "vendor-application"
  | "coverage-inquiry";

export type FormSubmitResult = {
  ok: boolean;
  mode: FormMode;
  receivedAt: string;
  message: string;
  referenceNumber?: string;
  warning?: string;
};
