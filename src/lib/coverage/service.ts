import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  displayCountyName,
  MARKET_STATE_CODES,
  normalizeCountyKey,
  normalizeStateCode,
  serviceLabel,
  type PublicCoverageStatus,
} from "@/lib/coverage/logic";
import { buildProposedCoverageRows, parseCoveragePayload } from "@/lib/vendor-application/coverage";

export type CoverageCheckResult = {
  status: PublicCoverageStatus;
  marketState: boolean;
  stateCode: string;
  countyName: string;
  serviceCategory: string;
  serviceLabel: string;
};

export async function checkCoverage(input: {
  state: string;
  county: string;
  service: string;
}): Promise<CoverageCheckResult | { error: string }> {
  const stateCode = normalizeStateCode(input.state);
  const countyKey = normalizeCountyKey(input.county);
  const service = input.service.trim();
  if (!stateCode) return { error: "Enter a valid U.S. state." };
  if (!countyKey) return { error: "Enter a county." };
  if (!service) return { error: "Select a service category." };

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("coverage_public_status", {
    p_state: stateCode,
    p_county: input.county,
    p_service: service,
  });
  if (error) {
    return { error: "Coverage could not be checked right now." };
  }
  const row = Array.isArray(data) ? data[0] : data;
  const status = (row?.status as PublicCoverageStatus) || "not_established";
  return {
    status: status === "covered" || status === "limited" ? status : "not_established",
    marketState: Boolean(row?.market_state),
    stateCode,
    countyName: row?.county_name || displayCountyName(input.county),
    serviceCategory: service,
    serviceLabel: serviceLabel(service),
  };
}

export async function getMarketStates() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("market_states")
    .select("state_code, state_name, status, display_order, public_visible")
    .eq("public_visible", true)
    .order("display_order");
  if (data && data.length > 0) return data;
  return MARKET_STATE_CODES.map((code, index) => ({
    state_code: code,
    state_name: displayCountyName(code).replace(" County", ""),
    status: "growing",
    display_order: index + 1,
    public_visible: true,
  }));
}

export async function getPublicMarketCards() {
  const admin = createAdminClient();
  const states = await getMarketStates();
  const { data } = await admin
    .from("v_effective_coverage")
    .select("state_code, normalized_county_name, service_category, coverage_status")
    .in("coverage_status", ["active", "limited"]);
  return states.map((state) => {
    const rows = (data ?? []).filter((row) => row.state_code === state.state_code);
    const counties = new Set(rows.map((row) => row.normalized_county_name));
    const services = new Set(rows.map((row) => row.service_category));
    return {
      ...state,
      verifiedCounties: counties.size,
      serviceCategories: services.size,
    };
  });
}

export async function recordDemandGap(input: {
  state: string;
  county: string;
  service: string;
  source: "coverage_request" | "service_request" | "quote_request" | "work_order" | "manual";
  sourceId?: string | null;
  priority?: "routine" | "priority" | "emergency";
}) {
  const admin = createAdminClient();
  await admin.rpc("record_coverage_gap", {
    p_state: input.state,
    p_county: input.county,
    p_service: input.service,
    p_source: input.source,
    p_source_id: input.sourceId ?? null,
    p_priority: input.priority ?? "routine",
  });
}

export async function proposeCoverageFromApplication(input: {
  applicationId: string;
  organizationId: string;
  profileId?: string | null;
  statesCovered: string;
  countiesCities: string;
  services: string[] | null;
  travelRadius?: string | null;
}) {
  const groups = parseCoveragePayload(input.statesCovered, input.countiesCities);
  const rows = buildProposedCoverageRows({
    applicationId: input.applicationId,
    organizationId: input.organizationId,
    profileId: input.profileId,
    groups,
    services: input.services,
    travelRadiusMiles: Number.parseInt(String(input.travelRadius ?? ""), 10) || null,
  });
  if (rows.length === 0) return 0;

  const admin = createAdminClient();
  await admin.from("vendor_coverage").upsert(rows, {
    onConflict: "vendor_organization_id,state_code,normalized_county_name,service_category",
  });
  return rows.length;
}
