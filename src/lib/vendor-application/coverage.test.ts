import { describe, expect, it } from "vitest";
import { getCountiesByState } from "@/data/us-counties";
import { displayCountyName } from "@/lib/coverage/logic";
import { formatReference, isReferenceFormat } from "@/lib/format";
import { vendorSchema } from "@/lib/form-schemas";
import {
  VENDOR_APPLICATION_LIST_COLUMNS,
  buildProposedCoverageRows,
  buildVendorApplicationStorage,
  coverageValidationMessages,
  formatCoverageSummary,
  normalizeCityTags,
  parseCoveragePayload,
  parseTravelRadiusMiles,
  serializeCoveragePayload,
  uniqueCanonicalCounties,
  uniqueStateCodes,
  type CoverageGroup,
} from "@/lib/vendor-application/coverage";

const completeVendor = {
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
  services: ["Preservation"],
  coverageStates: ["GA", "TX"],
  coverageGroups: [
    {
      state: "GA",
      allCounties: false,
      counties: ["Fulton County", "Cobb County", "Gwinnett County"],
      cities: ["Atlanta", "Marietta"],
      nearbyAreas: true,
    },
    {
      state: "TX",
      allCounties: false,
      counties: ["Dallas County", "Tarrant County"],
      cities: ["Dallas", "Fort Worth"],
      nearbyAreas: false,
    },
  ] satisfies CoverageGroup[],
  travelRadiusPreset: "75",
  travelRadiusCustom: "",
  willingToTravel: "depends",
  tripCharge: "yes",
  businessHoursPreset: "mon-fri-8-5",
  businessHoursCustom: "",
  emergencyAvailability: "yes",
  weekendAvailability: "by-appointment",
  experience: "We have completed preservation and maintenance work for years.",
  accurate: true,
  independentContractor: true,
  permissionToContact: true,
  terms: true,
};

describe("vendor application persistence mapping", () => {
  it("stores structured coverage and a TFV-compatible reference format", () => {
    const parsed = vendorSchema.parse(completeVendor);
    const row = buildVendorApplicationStorage(parsed);
    expect(row.states_covered).toBe("GA, TX");
    const payload = JSON.parse(row.counties_cities) as { v: number; groups: CoverageGroup[] };
    expect(payload.v).toBe(1);
    expect(payload.groups[0]?.counties).toEqual(["Fulton County", "Cobb County", "Gwinnett County"]);
    expect(payload.groups[1]?.cities).toEqual(["Dallas", "Fort Worth"]);
    expect(row.travel_radius).toBe("75");
    expect(isReferenceFormat(formatReference("TFV", 2026, 1), "TFV")).toBe(true);
    expect(formatReference("TFV", 2026, 1)).toBe("TFV-2026-000001");
  });

  it("keeps submitted applications visible to the admin list query", () => {
    expect(VENDOR_APPLICATION_LIST_COLUMNS).toContain("states_covered");
    expect(VENDOR_APPLICATION_LIST_COLUMNS).toContain("counties_cities");
    expect(VENDOR_APPLICATION_LIST_COLUMNS).not.toContain("coverage_states");
  });
});

describe("coverage structure", () => {
  it("keeps counties specific to each selected state", () => {
    const parsed = vendorSchema.parse(completeVendor);
    expect(parsed.coverageGroups[0]?.state).toBe("GA");
    expect(parsed.coverageGroups[0]?.counties).toContain("Fulton County");
    expect(parsed.coverageGroups[1]?.counties).toContain("Dallas County");
    expect(parsed.coverageGroups[0]?.counties).not.toContain("Dallas County");
  });

  it("accepts valid state and county pairing", () => {
    expect(getCountiesByState("GA")).toContain("Fulton County");
    expect(getCountiesByState("TX")).toContain("Harris County");
    expect(displayCountyName("fulton")).toBe("Fulton County");
  });

  it("prevents duplicate states and duplicate counties", () => {
    expect(uniqueStateCodes(["GA", "ga", "TX"])).toEqual(["GA", "TX"]);
    expect(uniqueCanonicalCounties(["Fulton", "Fulton County", "fulton county"])).toEqual([
      "Fulton County",
    ]);
  });

  it("normalizes city tags", () => {
    expect(normalizeCityTags([" atlanta ", "Atlanta", "marietta"])).toEqual(["Atlanta", "Marietta"]);
  });

  it("allows a statewide claim without exploding counties", () => {
    const parsed = vendorSchema.parse({
      ...completeVendor,
      coverageStates: ["GA"],
      coverageGroups: [
        {
          state: "GA",
          allCounties: true,
          counties: ["Fulton County"],
          cities: [],
          nearbyAreas: false,
        },
      ],
    });
    const storage = buildVendorApplicationStorage(parsed);
    const payload = parseCoveragePayload(storage.states_covered, storage.counties_cities);
    expect(payload[0]?.allCounties).toBe(true);
    expect(payload[0]?.counties).toEqual([]);
    const rows = buildProposedCoverageRows({
      applicationId: "app-1",
      organizationId: "org-1",
      groups: payload,
      services: parsed.services,
      travelRadiusMiles: 75,
    });
    expect(rows).toEqual([]);
  });

  it("validates a custom travel radius", () => {
    expect(parseTravelRadiusMiles("custom", "80").miles).toBe(80);
    expect(parseTravelRadiusMiles("custom", "0").error).toMatch(/greater than 0/i);
    expect(parseTravelRadiusMiles("custom", "9999").error).toMatch(/500/i);
    expect(
      vendorSchema.parse({ ...completeVendor, travelRadiusPreset: "custom", travelRadiusCustom: "80" })
        .travelRadiusCustom,
    ).toBe("80");
  });

  it("requires business hours and custom hours text", () => {
    expect(() => vendorSchema.parse({ ...completeVendor, businessHoursPreset: "" })).toThrow();
    expect(() =>
      vendorSchema.parse({
        ...completeVendor,
        businessHoursPreset: "custom",
        businessHoursCustom: "",
      }),
    ).toThrow();
    const custom = vendorSchema.parse({
      ...completeVendor,
      businessHoursPreset: "custom",
      businessHoursCustom: "Mon–Fri: 7:00 AM–6:00 PM",
    });
    expect(buildVendorApplicationStorage(custom).normal_hours).toContain("Mon–Fri");
  });

  it("requires emergency and weekend availability", () => {
    expect(() => vendorSchema.parse({ ...completeVendor, emergencyAvailability: "" })).toThrow();
    expect(() => vendorSchema.parse({ ...completeVendor, weekendAvailability: "" })).toThrow();
    const parsed = vendorSchema.parse(completeVendor);
    expect(parsed.emergencyAvailability).toBe("yes");
    expect(parsed.weekendAvailability).toBe("by-appointment");
  });

  it("rejects a county that does not belong to the selected state", () => {
    expect(
      coverageValidationMessages({
        coverageStates: ["GA"],
        coverageGroups: [
          {
            state: "GA",
            allCounties: false,
            counties: ["Dallas County"],
            cities: [],
            nearbyAreas: false,
          },
        ],
      }).coverageGroups,
    ).toMatch(/county/i);
    expect(() =>
      vendorSchema.parse({
        ...completeVendor,
        coverageStates: ["GA"],
        coverageGroups: [
          {
            state: "GA",
            allCounties: false,
            counties: ["Dallas County"],
            cities: [],
            nearbyAreas: false,
          },
        ],
      }),
    ).toThrow();
  });
});

describe("approval coverage copy", () => {
  it("creates proposed/unverified vendor coverage only", () => {
    const parsed = vendorSchema.parse(completeVendor);
    const rows = buildProposedCoverageRows({
      applicationId: "app-1",
      organizationId: "org-1",
      groups: parsed.coverageGroups,
      services: parsed.services,
      travelRadiusMiles: 75,
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.status === "proposed")).toBe(true);
    expect(rows.every((row) => row.verification_status === "unverified")).toBe(true);
    expect(rows.map((row) => row.verification_status)).not.toContain("verified");
    expect(rows.map((row) => row.status)).not.toContain("active");
  });

  it("does not create verified public coverage on approval", () => {
    const parsed = vendorSchema.parse(completeVendor);
    const rows = buildProposedCoverageRows({
      applicationId: "app-1",
      organizationId: "org-1",
      groups: parsed.coverageGroups,
      services: parsed.services,
      travelRadiusMiles: 75,
    });
    expect(JSON.stringify(rows)).not.toMatch(/"verified"|"active"/);
    expect(formatCoverageSummary(parsed.coverageGroups)).toBe("GA (3 counties), TX (2 counties)");
    expect(serializeCoveragePayload(parsed.coverageGroups)).toContain("Fulton County");
  });
});

describe("public vendor application fields", () => {
  it("does not collect SSN, EIN, W-9, banking, or passwords", () => {
    const keys = Object.keys(vendorSchema.shape);
    for (const key of ["ssn", "ein", "taxId", "w9", "bankAccount", "routingNumber", "password"]) {
      expect(keys).not.toContain(key);
    }
  });
});
