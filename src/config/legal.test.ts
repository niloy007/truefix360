import { describe, expect, it } from "vitest";
import { legal } from "@/config/legal";
import { vendorSchema } from "@/lib/form-schemas";

describe("legal configuration", () => {
  it("uses a fixed last-updated date instead of the request date", () => {
    expect(legal.lastUpdatedLabel).toBe("August 18, 2026");
    expect(legal.lastUpdatedIso).toBe("2026-08-18");
  });

  it("uses existing TrueFix360 contact mailboxes", () => {
    expect(legal.supportEmail).toBe("support@truefix360.com");
    expect(legal.officeEmail).toBe("office@truefix360.com");
  });

  it("does not invent a legal entity suffix", () => {
    expect(legal.legalName).toBe("TrueFix360");
    expect(legal.legalName).not.toMatch(/LLC|Inc\.|Corp/i);
  });
});

describe("public vendor application fields", () => {
  it("does not collect SSN or EIN on the public form schema", () => {
    const keys = Object.keys(vendorSchema.shape);
    expect(keys).not.toContain("ssn");
    expect(keys).not.toContain("ein");
    expect(keys).not.toContain("taxId");
    expect(keys).not.toContain("socialSecurityNumber");
  });
});
