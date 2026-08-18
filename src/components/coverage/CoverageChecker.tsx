"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { services } from "@/data/services";
import { usStates } from "@/data/us-states";
import { MARKET_STATE_CODES, publicCoverageCopy, type PublicCoverageStatus } from "@/lib/coverage/logic";

type CheckResponse = {
  status: PublicCoverageStatus;
  marketState: boolean;
  countyName: string;
  stateCode: string;
  serviceLabel: string;
  message?: string;
};

export function CoverageChecker({
  initialState = "",
  initialCounty = "",
  initialService = "",
}: {
  initialState?: string;
  initialCounty?: string;
  initialService?: string;
}) {
  const [state, setState] = useState(initialState);
  const [county, setCounty] = useState(initialCounty);
  const [service, setService] = useState(initialService);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const params = new URLSearchParams({ state, county, service });
      const response = await fetch(`/api/coverage/check?${params.toString()}`);
      const body = (await response.json()) as CheckResponse;
      if (!response.ok) {
        setError(body.message || "Coverage could not be checked.");
        setResult(null);
        return;
      }
      setResult(body);
    } catch {
      setError("Coverage could not be checked right now.");
    } finally {
      setPending(false);
    }
  }

  const copy = result ? publicCoverageCopy(result.status) : null;
  const requestHref = `/coverage/request?state=${encodeURIComponent(state)}&county=${encodeURIComponent(county)}&service=${encodeURIComponent(service)}`;

  return (
    <div className="border border-line bg-white p-5 sm:p-8">
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Check service coverage</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Coverage is determined by state, county, and service category. A highlighted market state is not the same as county-level coverage.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium">
          State
          <select className="input-field mt-1" value={state} onChange={(event) => setState(event.target.value)} required>
            <option value="">Select state</option>
            {usStates.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
                {(MARKET_STATE_CODES as readonly string[]).includes(item.code) ? " — active/growing market" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          County
          <input className="input-field mt-1" value={county} onChange={(event) => setCounty(event.target.value)} placeholder="Fulton County" required />
        </label>
        <label className="text-sm font-medium">
          Service
          <select className="input-field mt-1" value={service} onChange={(event) => setService(event.target.value)} required>
            <option value="">Select service</option>
            {services.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-3">
          <Button type="submit" disabled={pending}>{pending ? "Checking…" : "Check Coverage"}</Button>
        </div>
      </form>
      {error ? <p className="mt-4 text-sm text-red-800">{error}</p> : null}
      {result && copy ? (
        <div className="mt-6 border border-line bg-cream p-5">
          <p className="text-sm font-semibold text-ink">
            {result.countyName}, {result.stateCode}
          </p>
          <p className="text-sm text-muted">{result.serviceLabel}</p>
          <p className="mt-3 font-heading text-xl font-semibold">{copy.heading}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{copy.body}</p>
          {result.marketState && result.status === "not_established" ? (
            <p className="mt-2 text-sm text-muted">This state is an active/growing TrueFix360 market, but this county and service are not yet shown as established coverage.</p>
          ) : null}
          <div className="mt-4">
            <Button href={requestHref} variant="primary">
              {result.status === "not_established" ? "Request Coverage" : "Request Service"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
