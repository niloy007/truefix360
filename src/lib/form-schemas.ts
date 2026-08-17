import { z } from "zod";
import { usStates } from "@/data/us-states";
import { vendorServiceOptions } from "@/data/vendors";

const required = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

export const contactSchema = z.object({
  name: required("Name"),
  company: z.string().trim().optional(),
  email: z.email("Enter a valid email address."),
  phone: required("Phone"),
  topic: required("Topic"),
  message: required("Message").min(12, "Please provide a bit more detail."),
});

export type ContactValues = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  firstName: required("First name"),
  lastName: required("Last name"),
  company: z.string().trim().optional(),
  email: z.email("Enter a valid email address."),
  phone: required("Phone"),
  propertyAddress: required("Property address"),
  city: required("City"),
  state: required("State"),
  zip: required("ZIP"),
  propertyType: required("Property type"),
  occupancyStatus: required("Occupancy status"),
  serviceCategory: required("Service category"),
  requestedService: required("Requested service"),
  description: required("Description").min(12, "Please describe the work needed."),
  urgency: required("Urgency"),
  preferredDate: z.string().optional(),
  numberOfProperties: required("Number of properties"),
  preferredContactMethod: required("Preferred contact method"),
});

export type QuoteValues = z.infer<typeof quoteSchema>;

export const vendorSchema = z.object({
  companyName: required("Company / business name"),
  firstName: required("First name"),
  lastName: required("Last name"),
  email: z.email("Enter a valid email address."),
  phone: required("Phone"),
  website: z.string().trim().optional(),
  address: required("Business address"),
  city: required("City"),
  state: required("State"),
  zip: required("ZIP"),
  businessType: required("Business type"),
  yearsInBusiness: required("Years in business"),
  crewCount: required("Number of field technicians / crews"),
  insuranceStatus: required("Insurance status"),
  workersCompStatus: required("Workers compensation status"),
  services: z.array(z.string()).min(1, "Select at least one service."),
  statesCovered: required("States covered"),
  countiesCities: required("Counties / cities covered"),
  travelRadius: required("Travel radius"),
  willingToTravel: required("Travel preference"),
  tripCharge: required("Trip charge"),
  businessHours: required("Normal business hours"),
  emergencyAvailability: required("Emergency availability"),
  weekendAvailability: required("Weekend availability"),
  experience: required("Experience").min(20, "Please share a bit more about your experience."),
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
});

export type VendorValues = z.infer<typeof vendorSchema>;

export const coverageInquirySchema = z.object({
  name: required("Name"),
  email: z.email("Enter a valid email address."),
  location: required("Location"),
  message: z.string().trim().optional(),
});

export type CoverageInquiryValues = z.infer<typeof coverageInquirySchema>;

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
