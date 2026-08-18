"use client";

import { useId, useState } from "react";
import { US_STATE_PATHS } from "@/data/us-state-paths";

export const MARKET_STATES = [
  { code: "WA", name: "Washington" },
  { code: "TX", name: "Texas" },
  { code: "GA", name: "Georgia" },
  { code: "OH", name: "Ohio" },
  { code: "NC", name: "North Carolina" },
] as const;

const MARKET_CODES = new Set<string>(MARKET_STATES.map((state) => state.code));

const LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
  WA: { x: 118, y: 62 },
  TX: { x: 392, y: 386 },
  OH: { x: 702, y: 232 },
  NC: { x: 792, y: 308 },
  GA: { x: 728, y: 368 },
};

type USCoverageMapProps = {
  variant?: "homepage" | "coverage";
  className?: string;
};

export function USCoverageMap({ variant = "homepage", className }: USCoverageMapProps) {
  const titleId = useId();
  const interactive = variant === "coverage";
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [pinnedCode, setPinnedCode] = useState<string | null>(null);
  const activeCode = pinnedCode ?? hoveredCode;

  const activeState = US_STATE_PATHS.find((state) => state.code === activeCode);
  const isMarket = activeCode ? MARKET_CODES.has(activeCode) : false;

  return (
    <div className={className}>
      <div className="min-w-0 overflow-hidden border border-white/10 bg-[#14171a] p-3 sm:p-5">
        <svg
          viewBox="0 0 959 593"
          role="img"
          aria-labelledby={titleId}
          className="h-auto w-full max-w-full overflow-visible"
          onMouseLeave={interactive ? () => setHoveredCode(null) : undefined}
        >
          <title id={titleId}>
            Map of the United States. North Carolina, Texas, Georgia, Ohio, and Washington are
            highlighted as TrueFix360 active and growing markets. Coverage still varies by county
            and service category.
          </title>
          <rect width="959" height="593" fill="#14171a" />
          {US_STATE_PATHS.map((state) => {
            const market = MARKET_CODES.has(state.code);
            const selected = interactive && activeCode === state.code;
            const fill = market ? "#f35a18" : "#3a4148";
            const hoverFill = market ? "#ff6a2b" : "#4a525a";
            return (
              <g key={state.code}>
                {state.d.map((d, index) => (
                  <path
                    key={`${state.code}-${index}`}
                    d={d}
                    fill={selected ? hoverFill : fill}
                    stroke="#14171a"
                    strokeWidth="1"
                    className={interactive ? "cursor-pointer transition-colors duration-150" : undefined}
                    tabIndex={interactive && index === 0 ? 0 : undefined}
                    role={interactive && index === 0 ? "button" : undefined}
                    aria-label={
                      market
                        ? `${state.name}. Active / growing market. Coverage varies by county and service.`
                        : `${state.name}. Expansion / request-based market.`
                    }
                    aria-pressed={interactive && index === 0 ? selected : undefined}
                    onMouseEnter={interactive ? () => setHoveredCode(state.code) : undefined}
                    onFocus={interactive && index === 0 ? () => setHoveredCode(state.code) : undefined}
                    onBlur={interactive && index === 0 ? () => setHoveredCode(null) : undefined}
                    onClick={
                      interactive
                        ? () => setPinnedCode((current) => (current === state.code ? null : state.code))
                        : undefined
                    }
                    onKeyDown={
                      interactive && index === 0
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setPinnedCode((current) => (current === state.code ? null : state.code));
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </g>
            );
          })}
          {MARKET_STATES.map((state) => {
            const point = LABEL_POSITIONS[state.code];
            if (!point) return null;
            return (
              <text
                key={`${state.code}-label`}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="700"
                className="pointer-events-none select-none"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                {state.code}
              </text>
            );
          })}
        </svg>
        <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-dark sm:flex-row sm:flex-wrap sm:gap-5">
          <li className="inline-flex items-center gap-2">
            <span className="size-2.5 shrink-0 bg-brand" aria-hidden="true" />
            Orange — Active / growing market
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="size-2.5 shrink-0 bg-[#3a4148]" aria-hidden="true" />
            Gray — Expansion / request-based market
          </li>
        </ul>
      </div>
      {interactive ? (
        <div className="mt-3 border border-line bg-white px-4 py-3 text-sm" aria-live="polite">
          {activeState ? (
            <>
              <p className="font-heading font-semibold text-ink">{activeState.name}</p>
              <p className="mt-1 text-muted">
                {isMarket
                  ? "Active / growing market. Coverage varies by county and service."
                  : "Expansion / request-based market. Use the coverage checker for a county and service."}
              </p>
            </>
          ) : (
            <p className="text-muted">
              Hover or tap a state for market context. County and service coverage is confirmed with the checker.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
