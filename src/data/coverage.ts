export type CoverageStatus = "active" | "expanding" | "inquiry";

export type CoverageMarket = {
  id: string;
  state: string;
  stateCode: string;
  region?: string;
  cities?: string[];
  counties?: string[];
  notes?: string;
  status: CoverageStatus;
};

export const coverageMarkets: CoverageMarket[] = [
  { id: "nc", state: "North Carolina", stateCode: "NC", status: "expanding", notes: "Active/growing market. Coverage varies by county and service." },
  { id: "tx", state: "Texas", stateCode: "TX", status: "expanding", notes: "Active/growing market. Coverage varies by county and service." },
  { id: "ga", state: "Georgia", stateCode: "GA", status: "expanding", notes: "Active/growing market. Coverage varies by county and service." },
  { id: "oh", state: "Ohio", stateCode: "OH", status: "expanding", notes: "Active/growing market. Coverage varies by county and service." },
  { id: "wa", state: "Washington", stateCode: "WA", status: "expanding", notes: "Active/growing market. Coverage varies by county and service." },
];

export const coverageCopy = {
  heading: "Active and Growing Service Network",
  summary:
    "TrueFix360 maintains an active and growing field-service network across North Carolina, Texas, Georgia, Ohio, and Washington. Availability varies by county and service category.",
  availability:
    "Service availability varies by property location, service type, trade, scope, and field availability. A market state is not the same as county-level coverage.",
  inquiryNote:
    "Need coverage somewhere not shown? Request a coverage review and operations will evaluate the location.",
  emptyState:
    "Confirmed county and service coverage is published as it is verified. If you need work in a specific area, request a coverage review.",
} as const;

export const coverageLegend = [
  { status: "active" as const, label: "Established Coverage", description: "Verified county and service capability." },
  { status: "expanding" as const, label: "Active / Growing Market", description: "Strategic market; coverage still varies by county and service." },
  { status: "inquiry" as const, label: "Other U.S. Markets", description: "Available for coverage review and sourcing." },
];
