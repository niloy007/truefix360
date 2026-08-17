import { describe, expect, it } from "vitest";
import {
  contactSchema,
  quoteSchema,
  vendorSchema,
} from "@/lib/form-schemas";
import { parseEmailList, parsePhoneList } from "@/config/recipients";
import { formatReference, isReferenceFormat, splitPersonName } from "@/lib/format";
import { homePathForRole } from "@/config/platform";
import { isHoneypotTriggered } from "@/lib/forms/spam";
import {
  assertNoConfidentialVendorFields,
  assertNoVendorCostOnClientEstimate,
  toClientEstimatePayload,
  toVendorEstimatePayload,
  toVendorWorkOrderPayload,
} from "@/lib/confidentiality";
import { isClientRole, isInternalRole, isVendorRole, resolveHomePath } from "@/lib/auth/roles";

describe("contact validation", () => {
  it("accepts a complete contact payload", () => {
    const parsed = contactSchema.parse({
      name: "Alex Rivera",
      email: "alex@example.com",
      phone: "555-0100",
      topic: "new-service",
      message: "Need preservation support at a vacant property.",
    });
    expect(parsed.email).toBe("alex@example.com");
  });

  it("rejects a short message", () => {
    expect(() =>
      contactSchema.parse({
        name: "Alex",
        email: "alex@example.com",
        phone: "555",
        topic: "other",
        message: "Hi",
      }),
    ).toThrow();
  });
});

describe("quote validation", () => {
  it("normalizes required quote fields", () => {
    const parsed = quoteSchema.parse({
      firstName: "Sam",
      lastName: "Lee",
      email: "sam@example.com",
      phone: "5550101",
      propertyAddress: "100 Main St",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      propertyType: "single-family",
      occupancyStatus: "vacant",
      serviceCategory: "property-preservation",
      requestedService: "Lock change",
      description: "Need the property secured after vacancy.",
      urgency: "priority",
      numberOfProperties: "1",
      preferredContactMethod: "email",
    });
    expect(parsed.state).toBe("TX");
  });
});

describe("vendor validation", () => {
  it("requires acknowledgements and services", () => {
    expect(() =>
      vendorSchema.parse({
        companyName: "Field Co",
        firstName: "Pat",
        lastName: "Nguyen",
        email: "pat@example.com",
        phone: "5550102",
        address: "12 Oak",
        city: "Austin",
        state: "TX",
        zip: "78701",
        businessType: "llc",
        yearsInBusiness: "5",
        crewCount: "3",
        insuranceStatus: "insured",
        workersCompStatus: "yes",
        services: [],
        statesCovered: "TX",
        countiesCities: "Travis",
        travelRadius: "50 miles",
        willingToTravel: "yes",
        tripCharge: "no",
        businessHours: "8-5",
        emergencyAvailability: "yes",
        weekendAvailability: "no",
        experience: "We have completed preservation and maintenance work for years.",
        accurate: true,
        independentContractor: true,
        permissionToContact: true,
        terms: true,
      }),
    ).toThrow();
  });
});

describe("notification recipient parsing", () => {
  it("parses unique emails", () => {
    expect(parseEmailList(" office@truefix360.com, support@truefix360.com, OFFICE@truefix360.com ")).toEqual([
      "office@truefix360.com",
      "support@truefix360.com",
    ]);
  });

  it("parses E.164 numbers only", () => {
    expect(parsePhoneList("+15551234567, 5551234567, +44")).toEqual(["+15551234567"]);
  });
});

describe("authorization helpers", () => {
  it("maps roles to homes", () => {
    expect(homePathForRole("admin")).toBe("/admin");
    expect(homePathForRole("client")).toBe("/portal/client");
    expect(homePathForRole("crew")).toBe("/portal/vendor");
    expect(isInternalRole("staff")).toBe(true);
    expect(isClientRole("client")).toBe(true);
    expect(isVendorRole("vendor_admin")).toBe(true);
  });

  it("sends mixed memberships to the selector", () => {
    expect(
      resolveHomePath([
        {
          id: "1",
          organizationId: "a",
          organizationName: "Client Co",
          organizationType: "client",
          role: "client",
          status: "active",
        },
        {
          id: "2",
          organizationId: "b",
          organizationName: "Vendor Co",
          organizationType: "vendor",
          role: "crew",
          status: "active",
        },
      ]),
    ).toBe("/portal/select");
  });
});

describe("reference generator", () => {
  it("formats a padded yearly sequence", () => {
    expect(formatReference("TFQ", 2026, 123)).toBe("TFQ-2026-000123");
    expect(isReferenceFormat("TFC-2026-000001", "TFC")).toBe(true);
  });
});

describe("confidential serializers", () => {
  it("omits client NTE and internal notes from vendor work orders", () => {
    const payload = toVendorWorkOrderPayload({
      id: "wo-1",
      reference_number: "TFWO-2026-000001",
      service_category: "repair",
      title: "Leak",
      priority: "priority",
      status: "assigned",
      scheduled_start: null,
      scheduled_end: null,
      vendor_visible_notes: "Use side gate",
      access_instructions: "Lockbox",
      resident_contact_name: "Jordan",
      resident_contact_phone: "5550100",
      properties: {
        address1: "100 Main",
        address2: null,
        city: "Dallas",
        state: "TX",
        zip: "75201",
        property_type: "single-family",
        occupancy_status: "occupied",
      },
    });
    expect(payload).not.toHaveProperty("clientNte");
    expect(payload).not.toHaveProperty("internalNotes");
    assertNoConfidentialVendorFields(payload);
  });

  it("exposes only client-facing estimate amount", () => {
    const payload = toClientEstimatePayload({
      id: "e1",
      reference_number: "TFEST-2026-000001",
      work_order_id: "wo-1",
      status: "sent_to_client",
      client_sell_amount: 450,
      client_visible_scope: "Repair leak",
      client_comment: null,
      created_at: "2026-01-01T00:00:00.000Z",
    });
    expect(payload.amount).toBe(450);
    expect(payload).not.toHaveProperty("vendorAmount");
    assertNoVendorCostOnClientEstimate(payload);
  });

  it("keeps vendor cost off client serializers", () => {
    const payload = toVendorEstimatePayload({
      id: "e1",
      reference_number: "TFEST-2026-000001",
      work_order_id: "wo-1",
      status: "submitted",
      amount: 220,
      description: "Labor",
      labor_material_explanation: "Parts",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    expect(payload.amount).toBe(220);
    assertNoConfidentialVendorFields(payload);
  });
});

describe("spam helpers", () => {
  it("treats a filled honeypot as spam", () => {
    expect(isHoneypotTriggered("https://spam.test")).toBe(true);
    expect(isHoneypotTriggered("")).toBe(false);
  });

  it("splits a person name", () => {
    expect(splitPersonName("Alex Rivera")).toEqual({ firstName: "Alex", lastName: "Rivera" });
  });
});
