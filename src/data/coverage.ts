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

/**
 * Confirmed service markets. Keep empty until markets are provided.
 * Homepage and /coverage both read this file — do not hardcode states elsewhere.
 */
export const coverageMarkets: CoverageMarket[] = [
  // {
  //   id: "sample-xx",
  //   state: "Example State",
  //   stateCode: "XX",
  //   status: "expanding",
  //   notes: "Replace once confirmed markets are provided.",
  // },
];

export const coverageCopy = {
  heading: "Growing Coverage Across the United States",
  summary:
    "TrueFix360 coordinates property services through an expanding network of field professionals across active U.S. service markets.",
  availability:
    "Service availability varies by property location, service type, trade, scope, and field availability.",
  inquiryNote:
    "Need coverage somewhere not shown? Contact our operations team.",
  emptyState:
    "Confirmed service markets will be listed here as coverage is published. If you need work in a specific area, contact the team and we will review local capability.",
} as const;

export const coverageLegend = [
  { status: "active" as const, label: "Active Coverage", description: "Established service capability." },
  { status: "expanding" as const, label: "Expanding Coverage", description: "Vendor network being built." },
  { status: "inquiry" as const, label: "Other U.S. Markets", description: "Available for coverage review." },
];
