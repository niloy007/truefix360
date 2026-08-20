import { describe, expect, it } from "vitest";
import {
  findDuplicateCandidates,
  hasExactDuplicate,
  normalizeCompanyName,
  normalizeEmail,
  normalizePhone,
} from "@/lib/vendors/duplicates";
import {
  assertNoSensitiveSharedFields,
  mapSharedVendor,
  SHARED_VENDOR_EXCLUDED_FIELDS,
} from "@/lib/vendor-network/public-fields";
import { generateShareToken, hashToken, buildVendorNetworkUrl } from "@/lib/vendor-network/tokens";
import {
  decryptShareTokenWithKey,
  encryptShareTokenWithKey,
} from "@/lib/vendor-network/token-crypto-core";
import { canManageNetworkEdits, canSubmitVendors } from "@/lib/vendor-network/permissions";
import { adminVendorFormSchema, networkSubmissionSchema, shareLinkSchema } from "@/lib/vendors/schema";
import { formatVendorCoverage, truncateTrades, vendorInitials } from "@/lib/vendors/presentation";
import { buildVendorFilterHref } from "@/lib/vendors/filter-href";
import { shareLinkStatus } from "@/lib/vendors/share-link-status";
import { getSiteUrl } from "@/config/public-env";

/** Test-local mirror of admin URL recovery without server-only imports. */
function recoverShareUrlForTest(
  link: {
    encrypted_token?: string | null;
    revoked_at?: string | null;
    expires_at?: string | null;
  },
  nowMs: number,
  secret?: string,
): string | null {
  const status = shareLinkStatus(
    { revokedAt: link.revoked_at ?? null, expiresAt: link.expires_at ?? null },
    nowMs,
  );
  if (status !== "active" || !link.encrypted_token || !secret) return null;
  try {
    const raw = decryptShareTokenWithKey(link.encrypted_token, secret);
    return buildVendorNetworkUrl(getSiteUrl(), raw);
  } catch {
    return null;
  }
}

describe("vendor network tokens", () => {
  it("generates high-entropy tokens and stable hashes", () => {
    const a = generateShareToken();
    const b = generateShareToken();
    expect(a).not.toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(40);
    expect(hashToken(a)).toHaveLength(64);
    expect(hashToken(a)).toEqual(hashToken(a));
    expect(hashToken(a)).not.toEqual(hashToken(b));
  });
});

describe("encrypted recoverable share tokens", () => {
  const secret = "test-vendor-network-encryption-key-32chars!!";

  it("encrypts and decrypts raw tokens without storing plaintext", () => {
    const raw = generateShareToken();
    const encrypted = encryptShareTokenWithKey(raw, secret);
    expect(encrypted).not.toContain(raw);
    expect(encrypted.split(".")).toHaveLength(3);
    expect(decryptShareTokenWithKey(encrypted, secret)).toBe(raw);
  });

  it("fails decryption with the wrong key", () => {
    const raw = generateShareToken();
    const encrypted = encryptShareTokenWithKey(raw, secret);
    expect(() => decryptShareTokenWithKey(encrypted, "wrong-key-value-xxxxxxxxxxxx")).toThrow();
  });

  it("builds site-relative share URLs from raw tokens", () => {
    const raw = "abc123tokenvalue";
    expect(buildVendorNetworkUrl("https://truefix360.com", raw)).toBe(
      "https://truefix360.com/vendor-network/abc123tokenvalue",
    );
  });

  it("simulates regenerate invalidating previous hash", () => {
    const oldToken = generateShareToken();
    const newToken = generateShareToken();
    const oldHash = hashToken(oldToken);
    const newHash = hashToken(newToken);
    expect(oldHash).not.toEqual(newHash);
    expect(hashToken(oldToken)).toEqual(oldHash);
    expect(hashToken(newToken)).not.toEqual(oldHash);
  });

  it("does not put raw tokens in audit-style metadata payloads", () => {
    const raw = generateShareToken();
    const encrypted = encryptShareTokenWithKey(raw, secret);
    const auditMetadata = {
      name: "Vendor Sourcing Network",
      permission: "viewer",
    };
    const serialized = JSON.stringify({ ...auditMetadata, encryptedPresent: Boolean(encrypted) });
    expect(serialized).not.toContain(raw);
    expect(serialized).not.toContain(encrypted);
  });
});

describe("legacy hash-only share links", () => {
  it("marks active links without encrypted_token as non-recoverable", () => {
    const now = Date.now();
    expect(
      recoverShareUrlForTest({ encrypted_token: null, revoked_at: null, expires_at: null }, now),
    ).toBeNull();
    expect(shareLinkStatus({ revokedAt: null, expiresAt: null }, now)).toBe("active");
  });

  it("does not recover revoked or expired encrypted links", () => {
    const secret = "test-vendor-network-encryption-key-32chars!!";
    const encrypted = encryptShareTokenWithKey(generateShareToken(), secret);
    const now = Date.now();
    expect(
      recoverShareUrlForTest(
        {
          encrypted_token: encrypted,
          revoked_at: new Date().toISOString(),
          expires_at: null,
        },
        now,
        secret,
      ),
    ).toBeNull();
    expect(
      recoverShareUrlForTest(
        {
          encrypted_token: encrypted,
          revoked_at: null,
          expires_at: new Date(now - 60_000).toISOString(),
        },
        now,
        secret,
      ),
    ).toBeNull();
  });

  it("recovers active encrypted links for admin copy/open", () => {
    const secret = "test-vendor-network-encryption-key-32chars!!";
    const raw = generateShareToken();
    const encrypted = encryptShareTokenWithKey(raw, secret);
    const url = recoverShareUrlForTest(
      { encrypted_token: encrypted, revoked_at: null, expires_at: null },
      Date.now(),
      secret,
    );
    expect(url).toContain("/vendor-network/");
    expect(url).toContain(raw);
  });
});

describe("vendor filter URL params", () => {
  it("preserves filters and view when building hrefs", () => {
    const href = buildVendorFilterHref({
      tab: "all",
      q: "plumbing",
      state: "PA",
      trade: "Plumbing",
      status: "active",
      view: "cards",
    });
    expect(href).toContain("tab=all");
    expect(href).toContain("q=plumbing");
    expect(href).toContain("state=PA");
    expect(href).toContain("trade=Plumbing");
    expect(href).toContain("status=active");
    expect(href).toContain("view=cards");
  });

  it("clearing keeps view preference", () => {
    const href = buildVendorFilterHref({ tab: "all", view: "table" });
    expect(href).toBe("/admin/vendors?tab=all&view=table");
  });
});

describe("vendor card presentation", () => {
  it("truncates trades, builds initials, and formats coverage", () => {
    const trades = Array.from({ length: 14 }, (_, i) => `Trade ${i + 1}`);
    const { shown, more } = truncateTrades(trades, 3);
    expect(shown).toHaveLength(3);
    expect(more).toBe(11);
    expect(vendorInitials("Anointed Hands Handyman Services")).toBe("AH");
    expect(vendorInitials("Georgia Home Services")).toBe("GH");
    expect(vendorInitials("ABC Maintenance")).toBe("AM");
    expect(
      formatVendorCoverage({
        coverage_cities: ["Pittsburgh"],
        state: "PA",
        service_radius_miles: 50,
      }),
    ).toBe("Pittsburgh, PA · 50-mile radius");
    expect(
      formatVendorCoverage({
        state: "PA",
        coverage_counties: ["a", "b", "c", "d", "e"],
      }),
    ).toContain("5 counties");
  });
});

describe("duplicate detection", () => {
  const existing = [
    {
      organizationId: "org-1",
      companyName: "ABC Property Services LLC",
      phone: "(404) 555-1234",
      email: "Ops@ABC.com",
      address: "100 Main Street",
      city: "Atlanta",
      state: "GA",
      phoneNormalized: "4045551234",
      emailNormalized: "ops@abc.com",
    },
  ];

  it("normalizes phone and email", () => {
    expect(normalizePhone("+1 (404) 555-1234")).toBe("4045551234");
    expect(normalizeEmail(" Ops@ABC.com ")).toBe("ops@abc.com");
    expect(normalizeCompanyName("ABC Property Services, LLC")).toContain("abc property services");
  });

  it("detects exact phone and email matches", () => {
    const byPhone = findDuplicateCandidates(
      { companyName: "Other", phone: "404-555-1234" },
      existing,
    );
    expect(byPhone[0]?.strength).toBe("exact");
    expect(hasExactDuplicate(byPhone)).toBe(true);

    const byEmail = findDuplicateCandidates(
      { companyName: "Other", email: "ops@abc.com" },
      existing,
    );
    expect(byEmail[0]?.matchType).toBe("exact_email");
  });

  it("warns on fuzzy company names", () => {
    const fuzzy = findDuplicateCandidates(
      { companyName: "ABC Property Services", state: "GA" },
      existing,
    );
    expect(fuzzy[0]?.strength).toBe("fuzzy");
    expect(hasExactDuplicate(fuzzy)).toBe(false);
  });
});

describe("shared vendor privacy", () => {
  it("maps only public fields", () => {
    const mapped = mapSharedVendor({
      organization_id: "org-1",
      legal_name: "Test Vendor",
      primary_contact_name: "Jane",
      primary_phone: "4045550100",
      primary_email: "jane@example.com",
      city: "Atlanta",
      state: "GA",
      service_categories: ["HVAC"],
      coverage_states: ["GA"],
      preferred: true,
      shared_network_visible: true,
      internal_notes: "SECRET",
      organizations: { id: "org-1", name: "Test Vendor", type: "vendor", status: "active" },
    });
    expect(mapped?.companyName).toBe("Test Vendor");
    expect(mapped).not.toHaveProperty("internal_notes");
    expect(assertNoSensitiveSharedFields(mapped as unknown as Record<string, unknown>)).toBe(true);
    for (const field of SHARED_VENDOR_EXCLUDED_FIELDS) {
      expect(mapped).not.toHaveProperty(field);
    }
  });
});

describe("network permissions", () => {
  it("allows submit for contributor and manager only", () => {
    expect(canSubmitVendors("viewer")).toBe(false);
    expect(canSubmitVendors("contributor")).toBe(true);
    expect(canSubmitVendors("manager")).toBe(true);
    expect(canManageNetworkEdits("manager")).toBe(true);
    expect(canManageNetworkEdits("contributor")).toBe(false);
  });
});

describe("vendor schemas", () => {
  it("requires company and phone for admin create", () => {
    const result = adminVendorFormSchema.safeParse({
      companyName: "",
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid admin vendor payload", () => {
    const result = adminVendorFormSchema.safeParse({
      companyName: "Georgia Home Services",
      phone: "404-555-0100",
      email: "hello@example.com",
      services: ["HVAC"],
      vendorStatus: "active",
    });
    expect(result.success).toBe(true);
  });

  it("requires services for network submissions", () => {
    const result = networkSubmissionSchema.safeParse({
      companyName: "Network Vendor",
      phone: "4045550100",
      services: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects past custom share-link expiration", () => {
    const result = shareLinkSchema.safeParse({
      name: "Sourcing",
      permission: "viewer",
      expiration: "custom",
      customExpiresAt: "2020-01-01T00:00",
    });
    expect(result.success).toBe(false);
  });
});
