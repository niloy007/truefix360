/** Pure presentation helpers for admin vendor cards/table. */

export function truncateTrades(trades: string[], limit = 3): { shown: string[]; more: number } {
  const clean = trades.map((t) => t.trim()).filter(Boolean);
  if (clean.length <= limit) return { shown: clean, more: 0 };
  return { shown: clean.slice(0, limit), more: clean.length - limit };
}

/** Two-letter initials from a company name for avatar placeholders. */
export function vendorInitials(name: string): string {
  const parts = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export type CoverageSummary = {
  primary: string;
  secondary?: string;
};

export function formatVendorCoverageParts(
  profile: Record<string, unknown> | null | undefined,
): CoverageSummary {
  if (!profile) return { primary: "—" };

  const coverage = String(profile.coverage ?? "").trim();
  const cities = Array.isArray(profile.coverage_cities)
    ? (profile.coverage_cities as string[])
    : [];
  const counties = Array.isArray(profile.coverage_counties)
    ? (profile.coverage_counties as string[])
    : [];
  const states = Array.isArray(profile.coverage_states)
    ? (profile.coverage_states as string[])
    : [];
  const radiusMiles =
    typeof profile.service_radius_miles === "number"
      ? profile.service_radius_miles
      : profile.service_radius_miles != null
        ? Number(profile.service_radius_miles)
        : null;
  const radiusLabel =
    radiusMiles != null && !Number.isNaN(radiusMiles)
      ? `${radiusMiles}-mile radius`
      : undefined;

  if (coverage) {
    return { primary: coverage, secondary: radiusLabel };
  }

  if (cities[0]) {
    const primary = [cities[0], states[0] ?? profile.state].filter(Boolean).join(", ");
    return { primary, secondary: radiusLabel };
  }

  if (counties.length) {
    const primary = [states[0] ?? profile.state, `${counties.length} counties`]
      .filter(Boolean)
      .join(" · ");
    return { primary, secondary: radiusLabel };
  }

  if (states.length) {
    return {
      primary: states.length === 1 ? String(states[0]) : states.join(", "),
      secondary: radiusLabel,
    };
  }

  if (profile.city || profile.state) {
    return {
      primary: [profile.city, profile.state].filter(Boolean).join(", "),
      secondary: radiusLabel,
    };
  }

  return { primary: "—" };
}

export function formatVendorCoverage(profile: Record<string, unknown> | null | undefined): string {
  const parts = formatVendorCoverageParts(profile);
  return [parts.primary, parts.secondary].filter(Boolean).join(" · ");
}
