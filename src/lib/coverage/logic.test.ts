import { describe, expect, it } from "vitest";
import {
  combineCoverageStatus,
  displayCountyName,
  normalizeCountyKey,
  normalizeStateCode,
  toPublicCoverageStatus,
  publicCoverageCopy,
  shouldCreateGap,
  vendorCoverageCounts,
  vendorServiceToSlug,
} from "@/lib/coverage/logic";

describe("coverage normalization", () => {
  it("normalizes county variants to one key", () => {
    expect(normalizeCountyKey("Fulton")).toBe("fulton");
    expect(normalizeCountyKey("Fulton County")).toBe("fulton");
    expect(normalizeCountyKey("FULTON COUNTY")).toBe("fulton");
    expect(displayCountyName("fulton")).toBe("Fulton County");
  });

  it("normalizes state names and codes", () => {
    expect(normalizeStateCode("ga")).toBe("GA");
    expect(normalizeStateCode("Georgia")).toBe("GA");
    expect(normalizeStateCode("ZZ")).toBeNull();
  });

  it("maps vendor application services onto existing slugs", () => {
    expect(vendorServiceToSlug("HVAC")).toBe("hvac");
    expect(vendorServiceToSlug("Preservation")).toBe("property-preservation");
  });
});

describe("coverage combination", () => {
  it("counts manual active coverage as covered", () => {
    expect(toPublicCoverageStatus(combineCoverageStatus([{ kind: "manual", capability: "active" }]))).toBe(
      "covered",
    );
  });

  it("counts verified active vendor coverage as covered", () => {
    expect(
      toPublicCoverageStatus(
        combineCoverageStatus([
          {
            kind: "vendor",
            vendorStatus: "active",
            verificationStatus: "verified",
            organizationActive: true,
            onboardingAccepted: true,
          },
        ]),
      ),
    ).toBe("covered");
  });

  it("ignores unverified, proposed, suspended, and inactive vendors", () => {
    expect(
      combineCoverageStatus([
        {
          kind: "vendor",
          vendorStatus: "active",
          verificationStatus: "unverified",
          organizationActive: true,
          onboardingAccepted: true,
        },
        {
          kind: "vendor",
          vendorStatus: "proposed",
          verificationStatus: "verified",
          organizationActive: true,
          onboardingAccepted: true,
        },
        {
          kind: "vendor",
          vendorStatus: "active",
          verificationStatus: "verified",
          organizationActive: false,
          onboardingAccepted: true,
        },
        {
          kind: "vendor",
          vendorStatus: "suspended",
          verificationStatus: "verified",
          organizationActive: true,
          onboardingAccepted: true,
        },
      ]),
    ).toBe("unavailable");
  });

  it("uses limited when only limited manual coverage exists", () => {
    expect(combineCoverageStatus([{ kind: "manual", capability: "limited" }])).toBe("limited");
  });

  it("does not open a gap when coverage is established", () => {
    expect(shouldCreateGap("covered")).toBe(false);
    expect(shouldCreateGap("not_established")).toBe(true);
  });

  it("keeps public copy free of vendor identity", () => {
    const copy = publicCoverageCopy("covered");
    expect(JSON.stringify(copy)).not.toMatch(/vendor|crew|phone|email/i);
  });

  it("never treats unverified vendors as public vendor counts", () => {
    expect(
      vendorCoverageCounts([
        { kind: "vendor", vendorStatus: "active", verificationStatus: "unverified" },
        {
          kind: "vendor",
          vendorStatus: "active",
          verificationStatus: "verified",
          organizationActive: true,
          onboardingAccepted: true,
        },
      ]),
    ).toBe(1);
  });
});
