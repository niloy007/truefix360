import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Droplets,
  Hammer,
  House,
  Leaf,
  ShieldCheck,
  Thermometer,
  Wrench,
  Zap,
} from "lucide-react";

export type ServiceSlug =
  | "property-preservation"
  | "property-maintenance"
  | "repairs"
  | "inspections"
  | "exterior"
  | "turns"
  | "plumbing"
  | "electrical"
  | "hvac";

export type ServiceRecord = {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  href: string;
  eyebrow?: string;
  summary: string;
  description: string;
  icon: LucideIcon;
  items: string[];
};

export const services: ServiceRecord[] = [
  {
    slug: "property-preservation",
    name: "Property Preservation",
    shortName: "Preservation",
    href: "/services/property-preservation",
    summary:
      "Securing, winterization, debris, lawn care, inspections and preservation services.",
    description:
      "Protect vacant, foreclosed, bank-owned, investor-held, and otherwise at-risk properties with coordinated field work.",
    icon: ShieldCheck,
    items: [
      "Initial Secure",
      "Re-Secure",
      "Lock Change",
      "Boarding",
      "Winterization",
      "De-winterization",
      "Debris Removal",
      "Lawn Maintenance",
      "Property Cleaning",
      "Inspections",
      "Hazard Reporting",
      "Minor Repairs",
      "Conveyance Preparation",
    ],
  },
  {
    slug: "property-maintenance",
    name: "Property Maintenance",
    shortName: "Maintenance",
    href: "/services/property-maintenance",
    summary:
      "Day-to-day maintenance and repair support for occupied properties.",
    description:
      "Support occupied residential and commercial properties with recurring and on-demand maintenance services.",
    icon: House,
    items: [
      "Plumbing",
      "HVAC",
      "Electrical",
      "Carpentry",
      "Drywall",
      "Painting",
      "Doors",
      "Locks",
      "Flooring",
      "Appliances coordination",
      "Exterior work",
      "General handyman service",
      "Preventive maintenance",
      "Turns",
    ],
  },
  {
    slug: "repairs",
    name: "Repairs",
    shortName: "Repairs",
    href: "/services#repairs",
    summary:
      "General repairs, carpentry, drywall, doors, fixtures and corrective maintenance.",
    description:
      "Corrective repair coordination for occupied and vacant properties, from fixtures to finish work.",
    icon: Hammer,
    items: [
      "General repairs",
      "Carpentry",
      "Drywall",
      "Doors and hardware",
      "Fixtures",
      "Corrective maintenance",
    ],
  },
  {
    slug: "inspections",
    name: "Inspections",
    shortName: "Inspections",
    href: "/services#inspections",
    summary: "Property condition and field inspection services.",
    description:
      "Field inspections that document property condition, occupancy, and items that need attention.",
    icon: ClipboardCheck,
    items: [
      "Occupancy checks",
      "Condition inspections",
      "Photo documentation",
      "Hazard reporting",
      "Follow-up field visits",
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    shortName: "Plumbing",
    href: "/services/property-maintenance",
    summary:
      "Leaks, fixtures, drain issues, water systems and related service coordination.",
    description:
      "Plumbing repair and coordination for leaks, fixtures, drains, and related water-system issues.",
    icon: Droplets,
    items: ["Leaks", "Fixtures", "Drains", "Water systems"],
  },
  {
    slug: "electrical",
    name: "Electrical",
    shortName: "Electrical",
    href: "/services/property-maintenance",
    summary: "Lighting, switches, outlets and electrical repair coordination.",
    description:
      "Electrical repair coordination for lighting, devices, and related service needs.",
    icon: Zap,
    items: ["Lighting", "Switches", "Outlets", "Electrical repair coordination"],
  },
  {
    slug: "hvac",
    name: "HVAC",
    shortName: "HVAC",
    href: "/services/property-maintenance",
    summary:
      "Heating and cooling diagnostics, maintenance and repair coordination.",
    description:
      "Heating and cooling diagnostics, maintenance, and repair coordination through qualified field resources.",
    icon: Thermometer,
    items: ["Diagnostics", "Maintenance", "Repair coordination"],
  },
  {
    slug: "exterior",
    name: "Exterior Services",
    shortName: "Exterior",
    href: "/services#exterior",
    summary:
      "Lawn care, landscaping, exterior cleanup, gutters and seasonal work.",
    description:
      "Grounds, lawn, and exterior services that keep properties presentable and maintained.",
    icon: Leaf,
    items: [
      "Lawn care",
      "Landscaping",
      "Exterior cleanup",
      "Gutters",
      "Seasonal work",
    ],
  },
  {
    slug: "turns",
    name: "Turns & Make Ready",
    shortName: "Turns",
    href: "/services#turns",
    summary:
      "Property preparation between occupants, including repair, cleanup and readiness work.",
    description:
      "Make-ready services that prepare a property between occupants, including repair, cleanup, and readiness work.",
    icon: Wrench,
    items: ["Repairs", "Cleaning", "Paint and finish", "Readiness checks"],
  },
];

export const homepageServiceCards: ServiceSlug[] = [
  "property-preservation",
  "property-maintenance",
  "repairs",
  "plumbing",
  "electrical",
  "hvac",
  "exterior",
  "turns",
];

export const overviewCategories: ServiceSlug[] = [
  "property-preservation",
  "property-maintenance",
  "repairs",
  "inspections",
  "exterior",
  "turns",
];

export function getService(slug: ServiceSlug): ServiceRecord {
  const service = services.find((item) => item.slug === slug);
  if (!service) {
    throw new Error(`Unknown service: ${slug}`);
  }
  return service;
}

export const preservationChecklist = [
  "Initial secure",
  "Re-secure",
  "Lock changes",
  "Winterization",
  "Debris removal",
  "Lawn maintenance",
  "Property inspections",
  "Safety/hazard reporting",
  "Cleaning",
  "Minor repairs",
  "Boarding",
  "Conveyance preparation",
] as const;

export const maintenanceChecklist = [
  "Plumbing",
  "HVAC",
  "Electrical",
  "Handyman services",
  "Appliance-related service coordination",
  "Doors and locks",
  "Drywall and paint",
  "Flooring",
  "Exterior maintenance",
  "Emergency work",
  "Preventive maintenance",
  "Turns",
] as const;

