/** Pure presentation helpers for admin vendor cards/table. */

export function truncateTrades(trades: string[], limit = 3): { shown: string[]; more: number } {
  const clean = trades.map((t) => t.trim()).filter(Boolean);
  if (clean.length <= limit) return { shown: clean, more: 0 };
  return { shown: clean.slice(0, limit), more: clean.length - limit };
}

export function formatVendorCoverage(profile: Record<string, unknown> | null | undefined): string {
  if (!profile) return "—";
  const coverage = String(profile.coverage ?? "").trim();
  if (coverage) return coverage;

  const cities = Array.isArray(profile.coverage_cities)
    ? (profile.coverage_cities as string[])
    : [];
  const counties = Array.isArray(profile.coverage_counties)
    ? (profile.coverage_counties as string[])
    : [];
  const states = Array.isArray(profile.coverage_states)
    ? (profile.coverage_states as string[])
    : [];
  const radius =
    profile.service_radius_miles != null ? `+${profile.service_radius_miles} mi` : null;

  if (cities[0]) return [cities[0], radius].filter(Boolean).join(" ");
  if (counties.length) {
    return [states[0] ?? profile.state, `${counties.length} counties`, radius]
      .filter(Boolean)
      .join(" · ");
  }
  if (states.length === 1 && !radius) return String(states[0]);
  if (states.length) return [states.join(", "), radius].filter(Boolean).join(" ");
  if (profile.city || profile.state) {
    return [[profile.city, profile.state].filter(Boolean).join(", "), radius]
      .filter(Boolean)
      .join(" ");
  }
  return "—";
}
