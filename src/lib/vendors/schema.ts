import { z } from "zod";
import { vendorServiceOptions } from "@/data/vendors";

const optionalText = (max = 200) => z.string().trim().max(max).optional().or(z.literal(""));
const requiredText = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

export const VENDOR_STATUSES = ["active", "inactive", "pending", "do_not_use"] as const;
export const NETWORK_PERMISSIONS = ["viewer", "contributor", "manager"] as const;
export const LINK_EXPIRATIONS = ["7", "30", "90", "never", "custom"] as const;

export const vendorTradeChoices = [
  ...vendorServiceOptions,
  "General Maintenance",
  "Property Preservation",
  "Landscaping",
  "Lawn Maintenance",
  "Cleaning / Janitorial",
  "Tree Service",
  "Appliance Repair",
  "Pest Control",
] as const;

const uniqueTrades = [...new Set(vendorTradeChoices)];

export const adminVendorFormSchema = z
  .object({
    companyName: requiredText("Company / Vendor Name", 160),
    contactName: optionalText(120),
    phone: requiredText("Primary Phone", 40),
    alternatePhone: optionalText(40),
    email: z
      .string()
      .trim()
      .max(160)
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address."),
    website: optionalText(200),
    address: optionalText(200),
    city: optionalText(80),
    state: optionalText(2),
    zip: optionalText(16),
    services: z.array(z.string().max(80)).default([]),
    coverageStates: z.array(z.string().max(2)).default([]),
    coverageCounties: z.array(z.string().max(120)).default([]),
    coverageCities: z.array(z.string().max(120)).default([]),
    coverageZips: z.array(z.string().max(16)).default([]),
    serviceRadiusMiles: z.coerce.number().min(0).optional().nullable(),
    homeZip: optionalText(16),
    tripFeeEnabled: z.boolean().default(false),
    tripFeeAmount: z.coerce.number().min(0).optional().nullable(),
    tripFeeNotes: optionalText(500),
    standardAvailability: optionalText(200),
    emergencyAvailable: z.boolean().default(false),
    afterHoursAvailable: z.boolean().default(false),
    weekendAvailable: z.boolean().default(false),
    licenseNumber: optionalText(80),
    licenseState: optionalText(2),
    licenseExpiresOn: optionalText(20),
    insuranceStatus: optionalText(80),
    insuranceExpiresOn: optionalText(20),
    w9Status: optionalText(80),
    preferred: z.boolean().default(false),
    vendorStatus: z.enum(VENDOR_STATUSES).default("active"),
    sharedNetworkVisible: z.boolean().default(false),
    internalNotes: optionalText(5000),
    publicNotes: optionalText(2000),
    forceCreate: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.tripFeeEnabled && data.tripFeeAmount == null) {
      ctx.addIssue({
        code: "custom",
        path: ["tripFeeAmount"],
        message: "Trip fee amount is required when trip fee applies.",
      });
    }
  });

export type AdminVendorFormValues = z.infer<typeof adminVendorFormSchema>;

export const networkSubmissionSchema = z.object({
  companyName: requiredText("Company / Vendor Name", 160),
  contactName: optionalText(120),
  phone: requiredText("Primary Phone", 40),
  alternatePhone: optionalText(40),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address."),
  website: optionalText(200),
  address: optionalText(200),
  city: optionalText(80),
  state: optionalText(2),
  zip: optionalText(16),
  services: z.array(z.string().max(80)).min(1, "Select at least one trade/service."),
  coverageStates: z.array(z.string().max(2)).default([]),
  coverageCounties: z.array(z.string().max(120)).default([]),
  coverageCities: z.array(z.string().max(120)).default([]),
  coverageZips: z.array(z.string().max(16)).default([]),
  serviceRadiusMiles: z.coerce.number().min(0).optional().nullable(),
  homeZip: optionalText(16),
  tripFeeEnabled: z.boolean().default(false),
  tripFeeAmount: z.coerce.number().min(0).optional().nullable(),
  tripFeeNotes: optionalText(500),
  standardAvailability: optionalText(200),
  emergencyAvailable: z.boolean().default(false),
  afterHoursAvailable: z.boolean().default(false),
  weekendAvailable: z.boolean().default(false),
  notes: optionalText(2000),
  forceCreate: z.boolean().default(false),
});

export type NetworkSubmissionValues = z.infer<typeof networkSubmissionSchema>;

export const shareLinkSchema = z
  .object({
    name: requiredText("Link Name", 120),
    permission: z.enum(NETWORK_PERMISSIONS),
    expiration: z.enum(LINK_EXPIRATIONS),
    customExpiresAt: optionalText(40),
  })
  .superRefine((data, ctx) => {
    if (data.expiration === "custom") {
      if (!data.customExpiresAt) {
        ctx.addIssue({
          code: "custom",
          path: ["customExpiresAt"],
          message: "Choose a custom expiration date.",
        });
        return;
      }
      const when = new Date(data.customExpiresAt);
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        ctx.addIssue({
          code: "custom",
          path: ["customExpiresAt"],
          message: "Expiration must be in the future.",
        });
      }
    }
  });

export type ShareLinkValues = z.infer<typeof shareLinkSchema>;

export const TRADE_OPTIONS = uniqueTrades.map((label) => ({ value: label, label }));

export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

export function parseStringList(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  const text = String(raw);
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fall through to comma-separated
  }
  return text
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function coverageSummaryFromParts(input: {
  coverageStates?: string[];
  coverageCities?: string[];
  coverageCounties?: string[];
  serviceRadiusMiles?: number | null;
}): string {
  const parts: string[] = [];
  if (input.coverageCities?.length) parts.push(input.coverageCities.slice(0, 3).join(", "));
  else if (input.coverageCounties?.length) parts.push(input.coverageCounties.slice(0, 3).join(", "));
  else if (input.coverageStates?.length) parts.push(input.coverageStates.join(", "));
  if (input.serviceRadiusMiles != null) parts.push(`${input.serviceRadiusMiles} miles`);
  return parts.join(" + ") || "";
}
