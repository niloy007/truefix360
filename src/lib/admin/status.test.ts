import { describe, expect, it } from "vitest";
import { humanizeAuditAction, humanizeKey, isEmergencyPriority, isUnassignedStatus } from "@/lib/admin/status";
import { sanitizeSearchTerm } from "@/lib/format";

describe("admin status helpers", () => {
  it("humanizes keys without exposing raw enums as the only label", () => {
    expect(humanizeKey("awaiting_client_approval")).toBe("Awaiting Client Approval");
  });

  it("identifies unassigned and emergency work", () => {
    expect(isUnassignedStatus("sourcing")).toBe(true);
    expect(isUnassignedStatus("assigned")).toBe(false);
    expect(isEmergencyPriority("emergency")).toBe(true);
    expect(isEmergencyPriority("routine")).toBe(false);
  });

  it("renders audit actions in plain language", () => {
    expect(humanizeAuditAction("auth.login", "Nowshad")).toContain("logged in");
    expect(humanizeAuditAction("work_order.created", "Alex")).toContain("created a work order");
  });

  it("sanitizes search input", () => {
    expect(sanitizeSearchTerm("TFWO_%test(")).toBe("TFWO  test");
  });
});
