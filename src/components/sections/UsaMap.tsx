import { coverageCopy, coverageLegend, coverageMarkets } from "@/data/coverage";

export function UsaMap() {
  const active = coverageMarkets.filter((market) => market.status === "active");
  const expanding = coverageMarkets.filter((market) => market.status === "expanding");

  return (
    <div className="relative border border-white/10 bg-near-black p-4 sm:p-6">
      <p className="eyebrow mb-4">U.S. field network</p>
      <svg
        viewBox="0 0 960 600"
        role="img"
        aria-label="Map of the United States. Confirmed service markets are listed when coverage data is published. No states are marked active until that data is provided."
        className="h-auto w-full"
      >
        <rect width="960" height="600" fill="#101214" />
        <path
          fill="#2a3138"
          stroke="#F35A18"
          strokeWidth="2"
          d="M140 90l70-24 88 8 62-18 70 10 84 4 90-14 76 16 62 28 48 46v38l36 22 22 40-10 34 24 28-16 40 10 26-28 24-34 8-22 30 8 22-40 12-24-16-32 14-48-8-26 20-56 6-32-18-42 8-34-20-64 4-26-24-44-8-22 16-40-10-30 8-26-22 10-32-20-30 6-24-22-30 16-28-12-34 28-24z"
        />
        <path
          fill="#2a3138"
          stroke="#AEB4BA"
          strokeWidth="1.5"
          d="M70 430l54 10 28 36-14 28 36 18v30l-40 14-48-8-28-30 6-36-24-28 16-34z"
        />
        <path
          fill="#2a3138"
          stroke="#AEB4BA"
          strokeWidth="1.5"
          d="M168 500h70v42H168z"
        />
        <path d="M760 70h90M805 70v90" stroke="#F35A18" strokeWidth="3" opacity="0.35" />
      </svg>
      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {coverageLegend.map((item) => (
          <li key={item.status} className="flex items-start gap-2 text-xs text-muted-dark">
            <span
              className={
                item.status === "active"
                  ? "mt-1 size-2.5 shrink-0 bg-brand"
                  : item.status === "expanding"
                    ? "mt-1 size-2.5 shrink-0 border border-brand bg-transparent"
                    : "mt-1 size-2.5 shrink-0 bg-white/25"
              }
              aria-hidden="true"
            />
            <span>
              <span className="block font-semibold text-white">{item.label}</span>
              {item.description}
            </span>
          </li>
        ))}
      </ul>
      {coverageMarkets.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-dark">{coverageCopy.emptyState}</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {[...active, ...expanding].map((market) => (
            <span
              key={market.id}
              className="border border-white/15 px-2 py-1 text-xs text-white"
            >
              {market.state} · {market.status}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
