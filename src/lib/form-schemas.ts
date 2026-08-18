import { z } from "zod";
import { usStates } from "@/data/us-states";
import { vendorServiceOptions } from "@/data/vendors";
import {
  coverageValidationMessages,
  parseTravelRadiusMiles,
} from "@/lib/vendor-application/coverage";

const required = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

export const contactSchema = z.object({
  name: required("Name", 120),
  company: z.string().trim().max(160).optional(),
  email: z.email("Enter a valid email address.").max(160),
  phone: required("Phone", 40),
  topic: required("Topic", 80),
  message: required("Message", 5000).min(12, "Please provide a bit more detail."),
  companyUrl: z.string().max(200).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  firstName: required("First name", 80),
  lastName: required("Last name", 80),
  company: z.string().trim().max(160).optional(),
  email: z.email("Enter a valid email address.").max(160),
  phone: required("Phone", 40),
  propertyAddress: required("Property address", 200),
  city: required("City", 80),
  state: required("State", 2),
  zip: required("ZIP", 16),
  propertyType: required("Property type", 80),
  occupancyStatus: required("Occupancy status", 40),
  serviceCategory: required("Service category", 80),
  requestedService: required("Requested service", 160),
  description: required("Description", 8000).min(12, "Please describe the work needed."),
  urgency: required("Urgency", 40),
  preferredDate: z.string().max(20).optional(),
  numberOfProperties: required("Number of properties", 20),
  preferredContactMethod: required("Preferred contact method", 40),
  companyUrl: z.string().max(200).optional(),
});

export type QuoteValues = z.infer<typeof quoteSchema>;

export const vendorSchema = z.object({
  companyName: required("Company / business name", 160),
  firstName: required("First name", 80),
  lastName: required("Last name", 80),
  email: z.email("Enter a valid email address.").max(160),
  phone: required("Phone", 40),
  website: z.string().trim().max(200).optional(),
  address: required("Business address", 200),
  city: required("City", 80),
  state: required("State", 2),
  zip: required("ZIP", 16),
  businessType: required("Business type", 80),
  yearsInBusiness: required("Years in business", 20),
  crewCount: required("Number of field technicians / crews", 20),
  insuranceStatus: required("Insurance status", 80),
  workersCompStatus: required("Workers compensation status", 80),
  services: z.array(z.string().max(80)).min(1, "Select at least one service."),
  coverageStates: z.array(z.string()),
  coverageGroups: z.array(
    z.object({
      state: z.string(),
      allCounties: z.boolean(),
      counties: z.array(z.string()),
      cities: z.array(z.string()),
      nearbyAreas: z.boolean(),
    }),
  ),
  travelRadiusPreset: required("Travel radius", 20),
  travelRadiusCustom: z.string().optional(),
  willingToTravel: required("Travel preference", 20),
  tripCharge: required("Trip charge", 20),
  businessHoursPreset: required("Normal business hours", 40),
  businessHoursCustom: z.string().optional(),
  emergencyAvailability: required("Emergency availability", 20),
  weekendAvailability: required("Weekend availability", 20),
  experience: required("Experience", 8000).min(20, "Please share a bit more about your experience."),
  companyUrl: z.string().max(200).optional(),
  accurate: z
    .boolean()
    .refine((value) => value === true, "Please confirm the information is accurate."),
  independentContractor: z
    .boolean()
    .refine(
      (value) => value === true,
      "Independent contractor acknowledgment is required.",
    ),
  permissionToContact: z
    .boolean()
    .refine((value) => value === true, "Permission to contact is required."),
  terms: z
    .boolean()
    .refine((value) => value === true, "Terms acknowledgement is required."),
}).superRefine((values, ctx) => {
  const coverageErrors = coverageValidationMessages({
    coverageStates: values.coverageStates,
    coverageGroups: values.coverageGroups,
  });
  if (coverageErrors.coverageStates) {
    ctx.addIssue({
      code: "custom",
      path: ["coverageStates"],
      message: coverageErrors.coverageStates,
    });
  }
  if (coverageErrors.coverageGroups) {
    ctx.addIssue({
      code: "custom",
      path: ["coverageGroups"],
      message: coverageErrors.coverageGroups,
    });
  }
  const radius = parseTravelRadiusMiles(values.travelRadiusPreset, values.travelRadiusCustom ?? "");
  if (radius.error) {
    ctx.addIssue({
      code: "custom",
      path: values.travelRadiusPreset === "custom" ? ["travelRadiusCustom"] : ["travelRadiusPreset"],
      message: radius.error,
    });
  }
  if (values.businessHoursPreset === "custom" && !(values.businessHoursCustom ?? "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["businessHoursCustom"],
      message: "Enter your custom business hours.",
    });
  }
});

export type VendorValues = z.infer<typeof vendorSchema>;

export const coverageInquirySchema = z.object({
  name: required("Name", 120),
  email: z.email("Enter a valid email address.").max(160),
  location: required("Location", 160),
  message: z.string().trim().max(2000).optional(),
  companyUrl: z.string().max(200).optional(),
});

export type CoverageInquiryValues = z.infer<typeof coverageInquirySchema>;

export const coverageRequestSchema = z.object({
  firstName: required("First name", 80),
  lastName: required("Last name", 80),
  company: z.string().trim().max(160).optional(),
  email: z.email("Enter a valid email address.").max(160),
  phone: required("Phone", 40),
  propertyAddress: z.string().trim().max(200).optional(),
  city: required("City", 80),
  state: required("State", 2),
  county: required("County", 80),
  zip: z.string().trim().max(16).optional(),
  serviceCategory: required("Service category", 80),
  numberOfProperties: z.string().trim().max(20).optional(),
  urgency: z.enum(["routine", "priority", "emergency"]),
  description: required("Description", 8000).min(12, "Please describe the coverage needed."),
  companyUrl: z.string().max(200).optional(),
});

export type CoverageRequestValues = z.infer<typeof coverageRequestSchema>;

export const quoteCategories = [
  { value: "property-preservation", label: "Property Preservation" },
  { value: "property-maintenance", label: "Property Maintenance" },
  { value: "inspection", label: "Inspection" },
  { value: "repair", label: "Repair" },
  { value: "turn", label: "Turn / Make Ready" },
  { value: "exterior", label: "Exterior Service" },
  { value: "emergency", label: "Emergency Service" },
  { value: "other", label: "Other" },
];

export const contactTopics = [
  { value: "new-service", label: "New Service Request" },
  { value: "existing-work", label: "Existing Work" },
  { value: "partnership", label: "Partnership" },
  { value: "vendor-network", label: "Vendor Network" },
  { value: "resident", label: "Resident Question" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

export const stateOptions = usStates.map((state) => ({
  value: state.code,
  label: `${state.name} (${state.code})`,
}));

export const vendorServiceChoices = vendorServiceOptions.map((item) => ({
  value: item,
  label: item,
}));
