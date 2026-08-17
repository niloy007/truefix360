import { getPasswordRecoveryRedirectTo } from "@/config/public-env";
import { describe, expect, it } from "vitest";
import {
  classifyAuthLinkError,
  inviteLinkErrorMessage,
  parseAuthLinkErrorParam,
  resetLinkErrorMessage,
  safeAuthNextPath,
  validateNewPassword,
} from "@/lib/auth/password";
import { resolveHomePath } from "@/lib/auth/roles";

describe("password validation", () => {
  it("requires 10 characters and a matching confirmation", () => {
    expect(validateNewPassword("", "secret12345")).toBe("Create a password to continue.");
    expect(validateNewPassword("short", "short")).toBe(
      "Use a password with at least 10 characters.",
    );
    expect(validateNewPassword("longenough1", "mismatch12")).toBe("Passwords do not match.");
    expect(validateNewPassword("longenough1", "longenough1")).toBeNull();
  });
});

describe("auth link errors", () => {
  it("maps provider failures without exposing tokens", () => {
    expect(classifyAuthLinkError("access_denied", "otp_expired")).toBe("expired");
    expect(classifyAuthLinkError("user_already_registered", null)).toBe("used");
    expect(classifyAuthLinkError("access_denied", "invalid")).toBe("invalid");
    expect(parseAuthLinkErrorParam("missing")).toBe("missing");
    expect(inviteLinkErrorMessage("expired")).toMatch(/expired/i);
    expect(inviteLinkErrorMessage("used")).toMatch(/already been used/i);
    expect(resetLinkErrorMessage("expired")).toMatch(/reset link has expired/i);
    expect(inviteLinkErrorMessage("invalid")).not.toMatch(/access_token|refresh_token|token_hash/i);
  });

  it("rejects unsafe next paths", () => {
    expect(safeAuthNextPath("//evil.example", "/login")).toBe("/login");
    expect(safeAuthNextPath("https://evil.example", "/login")).toBe("/login");
    expect(safeAuthNextPath("/auth/callback", "/reset-password")).toBe("/reset-password");
    expect(safeAuthNextPath("/admin", "/reset-password")).toBe("/reset-password");
    expect(safeAuthNextPath("/auth/invite", "/reset-password")).toBe("/auth/invite");
    expect(safeAuthNextPath("/reset-password", "/login")).toBe("/reset-password");
  });

  it("builds recovery redirectTo from NEXT_PUBLIC_SITE_URL", () => {
    expect(getPasswordRecoveryRedirectTo()).toMatch(
      /\/auth\/callback\?next=\/reset-password$/,
    );
  });
});

describe("invite destination", () => {
  it("routes from real memberships, not URL roles", () => {
    expect(
      resolveHomePath([
        {
          id: "1",
          organizationId: "a",
          organizationName: "TrueFix360",
          organizationType: "internal",
          role: "admin",
          status: "active",
        },
      ]),
    ).toBe("/admin");
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
      ]),
    ).toBe("/portal/client");
    expect(
      resolveHomePath([
        {
          id: "1",
          organizationId: "a",
          organizationName: "Vendor Co",
          organizationType: "vendor",
          role: "crew",
          status: "active",
        },
      ]),
    ).toBe("/portal/vendor");
  });
});
