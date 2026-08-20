import { describe, expect, it } from "vitest";
import {
  canRemoveMembership,
  classifyInviteDuplicate,
  inviteDuplicateMessage,
  isAppRole,
  normalizeInviteEmail,
  safeLoginNextPath,
  wouldRemoveLastActiveAdmin,
} from "@/lib/admin/users";
import { resolveHomePath } from "@/lib/auth/roles";
import { inviteLinkErrorMessage } from "@/lib/auth/password";
import { homePathForRole } from "@/config/platform";

describe("invite email normalization", () => {
  it("lowercases and trims emails", () => {
    expect(normalizeInviteEmail("  Richard@Example.COM ")).toBe("richard@example.com");
  });
});

describe("invite duplicates", () => {
  it("blocks pending and active duplicates", () => {
    expect(
      classifyInviteDuplicate({
        email: "a@example.com",
        memberships: [{ status: "invited", email: "a@example.com" }],
        pendingInvitations: [],
      }),
    ).toBe("pending");
    expect(
      classifyInviteDuplicate({
        email: "a@example.com",
        memberships: [{ status: "active", email: "A@example.com" }],
        pendingInvitations: [],
      }),
    ).toBe("active");
    expect(inviteDuplicateMessage("pending")).toMatch(/resend/i);
    expect(inviteDuplicateMessage("active")).toMatch(/active user/i);
  });
});

describe("admin removal guards", () => {
  it("blocks self-removal and last admin removal", () => {
    expect(
      canRemoveMembership({
        actorUserId: "u1",
        targetUserId: "u1",
        targetRole: "staff",
        targetStatus: "active",
        activeAdminCount: 2,
      }).ok,
    ).toBe(false);

    expect(
      wouldRemoveLastActiveAdmin({
        targetRole: "admin",
        targetStatus: "active",
        activeAdminCount: 1,
      }),
    ).toBe(true);

    expect(
      canRemoveMembership({
        actorUserId: "admin1",
        targetUserId: "admin2",
        targetRole: "admin",
        targetStatus: "active",
        activeAdminCount: 1,
      }),
    ).toEqual({ ok: false, error: "At least one active administrator must remain." });

    expect(
      canRemoveMembership({
        actorUserId: "admin1",
        targetUserId: "user2",
        targetRole: "vendor_admin",
        targetStatus: "active",
        activeAdminCount: 1,
      }).ok,
    ).toBe(true);
  });
});

describe("login next path safety", () => {
  it("allows internal relative paths and rejects open redirects", () => {
    expect(safeLoginNextPath("/vendor-network/abc", "/admin")).toBe("/vendor-network/abc");
    expect(safeLoginNextPath("/portal/vendor", "/login")).toBe("/portal/vendor");
    expect(safeLoginNextPath("//evil.example", "/login")).toBe("/login");
    expect(safeLoginNextPath("https://evil.example", "/login")).toBe("/login");
    expect(safeLoginNextPath("\\evil", "/login")).toBe("/login");
  });
});

describe("role routing ignores login tab labels", () => {
  it("routes vendor_admin to vendor portal, not admin", () => {
    expect(homePathForRole("vendor_admin")).toBe("/portal/vendor");
    expect(isAppRole("vendor_admin")).toBe(true);
    expect(isAppRole("superadmin")).toBe(false);
    expect(
      resolveHomePath([
        {
          id: "1",
          organizationId: "v1",
          organizationName: "Vendor Co",
          organizationType: "vendor",
          role: "vendor_admin",
          status: "active",
        },
      ]),
    ).toBe("/portal/vendor");
    expect(
      resolveHomePath([
        {
          id: "1",
          organizationId: "i1",
          organizationName: "TrueFix360",
          organizationType: "internal",
          role: "admin",
          status: "active",
        },
      ]),
    ).toBe("/admin");
  });

  it("ignores invited memberships for portal routing", () => {
    expect(
      resolveHomePath([
        {
          id: "1",
          organizationId: "v1",
          organizationName: "Vendor Co",
          organizationType: "vendor",
          role: "vendor_admin",
          status: "invited",
        },
      ]),
    ).toBe("/login");
  });
});

describe("expired invite messaging", () => {
  it("asks admin to resend without exposing tokens", () => {
    expect(inviteLinkErrorMessage("expired")).toMatch(/resend your invitation/i);
    expect(inviteLinkErrorMessage("missing")).toMatch(/resend your invitation/i);
    expect(inviteLinkErrorMessage("expired")).not.toMatch(/access_token|refresh_token/i);
  });
});
