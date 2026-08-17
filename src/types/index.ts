export type FormMode = "placeholder";

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
};

export type OccupancyStatus = "occupied" | "vacant" | "unknown";

export type Urgency = "routine" | "priority" | "emergency";
