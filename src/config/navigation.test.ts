import { describe, expect, it } from "vitest";
import {
  headerActions,
  isPrimaryNavActive,
  navPathBase,
  primaryNav,
  topBar,
} from "@/config/navigation";

describe("public navigation config", () => {
  it("uses the intended main-nav order without Home", () => {
    expect(primaryNav.map((item) => item.label)).toEqual([
      "Services",
      "Coverage",
      "Clients",
      "Vendors",
      "Residents",
      "About",
      "Contact",
    ]);
    expect(primaryNav.some((item) => item.label === "Home")).toBe(false);
  });

  it("keeps utility bar as tagline plus login access only", () => {
    expect(topBar.tagline).toMatch(/Property Preservation & Maintenance Nationwide/i);
    expect(topBar.links.map((l) => l.label)).toEqual(["Client Login", "Vendor Login"]);
    expect(topBar.links.some((l) => /preservation|maintenance|coverage/i.test(l.label))).toBe(
      false,
    );
  });

  it("exposes a single Get a Quote header CTA", () => {
    expect(headerActions.quote.href).toBe("/get-a-quote");
    expect(headerActions).not.toHaveProperty("login");
  });

  it("links Services / Clients / Vendors children to real routes", () => {
    const services = primaryNav.find((i) => i.label === "Services")!;
    const clients = primaryNav.find((i) => i.label === "Clients")!;
    const vendors = primaryNav.find((i) => i.label === "Vendors")!;

    expect(services.children?.map((c) => navPathBase(c.href))).toEqual(
      expect.arrayContaining([
        "/services/property-preservation",
        "/services/property-maintenance",
        "/services",
      ]),
    );
    expect(clients.children?.some((c) => c.href === "/login")).toBe(true);
    expect(clients.children?.some((c) => c.href === "/get-a-quote")).toBe(true);
    expect(vendors.children?.some((c) => c.href === "/vendors/apply")).toBe(true);
    expect(vendors.children?.some((c) => c.href === "/login?type=vendor")).toBe(true);
  });

  it("marks active sections without confusing Coverage and Clients", () => {
    expect(isPrimaryNavActive(primaryNav[1], "/coverage")).toBe(true);
    expect(isPrimaryNavActive(primaryNav[2], "/coverage")).toBe(false);
    expect(isPrimaryNavActive(primaryNav[0], "/services/property-preservation")).toBe(true);
    expect(isPrimaryNavActive(primaryNav[3], "/vendors/apply")).toBe(true);
    expect(isPrimaryNavActive(primaryNav[2], "/login", "")).toBe(true);
    expect(isPrimaryNavActive(primaryNav[3], "/login", "type=vendor")).toBe(true);
    expect(isPrimaryNavActive(primaryNav[2], "/login", "type=vendor")).toBe(false);
  });
});
