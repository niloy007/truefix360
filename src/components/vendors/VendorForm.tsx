"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usStates } from "@/data/us-states";
import { TRADE_OPTIONS, type AdminVendorFormValues } from "@/lib/vendors/schema";
import type { DuplicateCandidate } from "@/lib/vendors/duplicates";
import type { ActionResult } from "@/lib/vendors/actions";

type VendorFormProps = {
  mode: "create" | "edit" | "network";
  initial?: Partial<AdminVendorFormValues>;
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
  showInternalFields?: boolean;
  successRedirectBase?: string;
};

export function VendorForm({
  mode,
  initial,
  action,
  submitLabel,
  cancelHref,
  showInternalFields = true,
  successRedirectBase,
}: VendorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [forceCreate, setForceCreate] = useState(false);
  const [services, setServices] = useState<string[]>(initial?.services ?? []);
  const [coverageStates, setCoverageStates] = useState<string[]>(initial?.coverageStates ?? []);
  const [tripFeeEnabled, setTripFeeEnabled] = useState(Boolean(initial?.tripFeeEnabled));
  const [message, setMessage] = useState<string | null>(null);

  const defaults = useMemo(
    () => ({
      companyName: initial?.companyName ?? "",
      contactName: initial?.contactName ?? "",
      phone: initial?.phone ?? "",
      alternatePhone: initial?.alternatePhone ?? "",
      email: initial?.email ?? "",
      website: initial?.website ?? "",
      address: initial?.address ?? "",
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      zip: initial?.zip ?? "",
      coverageCounties: (initial?.coverageCounties ?? []).join(", "),
      coverageCities: (initial?.coverageCities ?? []).join(", "),
      coverageZips: (initial?.coverageZips ?? []).join(", "),
      serviceRadiusMiles: initial?.serviceRadiusMiles ?? "",
      homeZip: initial?.homeZip ?? "",
      tripFeeAmount: initial?.tripFeeAmount ?? "",
      tripFeeNotes: initial?.tripFeeNotes ?? "",
      standardAvailability: initial?.standardAvailability ?? "",
      licenseNumber: initial?.licenseNumber ?? "",
      licenseState: initial?.licenseState ?? "",
      licenseExpiresOn: initial?.licenseExpiresOn ?? "",
      insuranceStatus: initial?.insuranceStatus ?? "",
      insuranceExpiresOn: initial?.insuranceExpiresOn ?? "",
      w9Status: initial?.w9Status ?? "",
      vendorStatus: initial?.vendorStatus ?? "active",
      internalNotes: initial?.internalNotes ?? "",
      publicNotes: initial?.publicNotes ?? "",
      preferred: Boolean(initial?.preferred),
      sharedNetworkVisible: Boolean(initial?.sharedNetworkVisible),
      emergencyAvailable: Boolean(initial?.emergencyAvailable),
      afterHoursAvailable: Boolean(initial?.afterHoursAvailable),
      weekendAvailable: Boolean(initial?.weekendAvailable),
    }),
    [initial],
  );

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  function toggleState(code: string) {
    setCoverageStates((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    formData.set("services", JSON.stringify(services));
    formData.set("coverageStates", JSON.stringify(coverageStates));
    formData.set(
      "coverageCounties",
      JSON.stringify(
        String(formData.get("coverageCounties") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
    formData.set(
      "coverageCities",
      JSON.stringify(
        String(formData.get("coverageCities") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
    formData.set(
      "coverageZips",
      JSON.stringify(
        String(formData.get("coverageZips") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
    if (forceCreate) formData.set("forceCreate", "true");
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        setDuplicates(result.duplicates ?? []);
        return;
      }
      setDuplicates([]);
      setMessage(result.message ?? "Saved.");
      if (mode === "network") {
        return;
      }
      if (result.organizationId) {
        const query = mode === "create" ? "created=1" : "updated=1";
        router.push(`/admin/vendors/${result.organizationId}?${query}`);
        router.refresh();
        return;
      }
      if (successRedirectBase) {
        router.push(successRedirectBase);
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      {duplicates.length > 0 ? (
        <div className="border border-amber-200 bg-amber-50 p-4">
          <p className="font-heading text-base font-semibold text-ink">Possible Existing Vendor</p>
          <ul className="mt-3 space-y-2 text-sm">
            {duplicates.map((item) => (
              <li key={`${item.organizationId}-${item.matchType}`} className="border border-amber-200 bg-white px-3 py-2">
                <p className="font-semibold">{item.companyName}</p>
                <p className="text-muted">
                  {[item.city, item.state].filter(Boolean).join(", ") || "—"}
                  {item.phone ? ` · ${item.phone}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mode !== "network" ? (
                    <Link
                      href={`/admin/vendors/${item.organizationId}`}
                      className="text-sm font-semibold text-brand hover:text-brand-hover"
                    >
                      View Existing Vendor
                    </Link>
                  ) : null}
                  <span className="text-xs uppercase tracking-wide text-muted">{item.matchType.replaceAll("_", " ")}</span>
                </div>
              </li>
            ))}
          </ul>
          {mode !== "network" || !duplicates.some((d) => d.strength === "exact") ? (
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={forceCreate}
                onChange={(e) => setForceCreate(e.target.checked)}
              />
              {mode === "network" ? "Submit anyway (fuzzy match only)" : "Add anyway"}
            </label>
          ) : (
            <p className="mt-3 text-sm text-muted">Exact phone/email matches cannot be force-submitted from the network.</p>
          )}
        </div>
      ) : null}

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-lg font-semibold">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">
            Company / Vendor Name *
            <input name="companyName" required defaultValue={defaults.companyName} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            Contact Person
            <input name="contactName" defaultValue={defaults.contactName} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            Primary Phone *
            <input name="phone" required defaultValue={defaults.phone} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            Secondary Phone
            <input name="alternatePhone" defaultValue={defaults.alternatePhone} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            Email
            <input name="email" type="email" defaultValue={defaults.email} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Website
            <input name="website" defaultValue={defaults.website} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Business Address
            <input name="address" defaultValue={defaults.address} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            City
            <input name="city" defaultValue={defaults.city} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            State
            <select name="state" defaultValue={defaults.state} className="input-field mt-1">
              <option value="">Select</option>
              {usStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code} — {state.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            ZIP Code
            <input name="zip" defaultValue={defaults.zip} className="input-field mt-1" />
          </label>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-lg font-semibold">Services</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TRADE_OPTIONS.map((trade) => (
            <label key={trade.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={services.includes(trade.value)}
                onChange={() => toggleService(trade.value)}
              />
              {trade.label}
            </label>
          ))}
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-lg font-semibold">Coverage</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium">States covered</p>
            <div className="mt-2 grid max-h-40 grid-cols-3 gap-1 overflow-y-auto border border-line p-2 sm:grid-cols-4 lg:grid-cols-6">
              {usStates.map((state) => (
                <label key={state.code} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={coverageStates.includes(state.code)}
                    onChange={() => toggleState(state.code)}
                  />
                  {state.code}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Counties covered
              <input
                name="coverageCounties"
                defaultValue={defaults.coverageCounties}
                className="input-field mt-1"
                placeholder="Comma-separated"
              />
            </label>
            <label className="text-sm font-medium">
              Cities / markets
              <input
                name="coverageCities"
                defaultValue={defaults.coverageCities}
                className="input-field mt-1"
                placeholder="Comma-separated"
              />
            </label>
            <label className="text-sm font-medium">
              ZIP codes
              <input
                name="coverageZips"
                defaultValue={defaults.coverageZips}
                className="input-field mt-1"
                placeholder="Comma-separated"
              />
            </label>
            <label className="text-sm font-medium">
              Service radius (miles)
              <input
                name="serviceRadiusMiles"
                type="number"
                min={0}
                defaultValue={defaults.serviceRadiusMiles}
                className="input-field mt-1"
              />
            </label>
            <label className="text-sm font-medium">
              Home / base ZIP
              <input name="homeZip" defaultValue={defaults.homeZip} className="input-field mt-1" />
            </label>
          </div>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-lg font-semibold">Travel / Trip Fees</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input
              type="checkbox"
              name="tripFeeEnabled"
              value="true"
              checked={tripFeeEnabled}
              onChange={(e) => setTripFeeEnabled(e.target.checked)}
            />
            Additional trip fee applicable
          </label>
          <label className="text-sm font-medium">
            Trip fee amount
            <input
              name="tripFeeAmount"
              type="number"
              min={0}
              step="0.01"
              disabled={!tripFeeEnabled}
              defaultValue={defaults.tripFeeAmount}
              className="input-field mt-1"
            />
          </label>
          <label className="text-sm font-medium">
            Trip fee notes
            <input
              name="tripFeeNotes"
              defaultValue={defaults.tripFeeNotes}
              className="input-field mt-1"
              placeholder="$75 beyond 40 miles"
            />
          </label>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-lg font-semibold">Availability</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium">
            Standard availability
            <input
              name="standardAvailability"
              defaultValue={defaults.standardAvailability}
              className="input-field mt-1"
              placeholder="Mon–Fri 8am–5pm"
            />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="emergencyAvailable" value="true" defaultChecked={defaults.emergencyAvailable} />
              Emergency service
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="afterHoursAvailable" value="true" defaultChecked={defaults.afterHoursAvailable} />
              After-hours service
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="weekendAvailable" value="true" defaultChecked={defaults.weekendAvailable} />
              Weekend service
            </label>
          </div>
        </div>
      </section>

      {showInternalFields ? (
        <>
          <section className="border border-line bg-white p-5">
            <h2 className="font-heading text-lg font-semibold">Business / Compliance</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                License number
                <input name="licenseNumber" defaultValue={defaults.licenseNumber} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium">
                License state
                <input name="licenseState" defaultValue={defaults.licenseState} className="input-field mt-1" maxLength={2} />
              </label>
              <label className="text-sm font-medium">
                License expiration
                <input name="licenseExpiresOn" type="date" defaultValue={defaults.licenseExpiresOn} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium">
                Insurance status
                <input name="insuranceStatus" defaultValue={defaults.insuranceStatus} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium">
                Insurance expiration
                <input name="insuranceExpiresOn" type="date" defaultValue={defaults.insuranceExpiresOn} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium">
                W-9 status
                <input name="w9Status" defaultValue={defaults.w9Status} className="input-field mt-1" />
              </label>
            </div>
          </section>

          <section className="border border-line bg-white p-5">
            <h2 className="font-heading text-lg font-semibold">Internal Management</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Status
                <select name="vendorStatus" defaultValue={defaults.vendorStatus} className="input-field mt-1">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="do_not_use">Do Not Use</option>
                </select>
              </label>
              <div className="flex flex-col gap-3 pt-6 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="preferred" value="true" defaultChecked={defaults.preferred} />
                  Preferred Vendor
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sharedNetworkVisible"
                    value="true"
                    defaultChecked={defaults.sharedNetworkVisible}
                  />
                  Visible in Shared Network
                </label>
              </div>
              <label className="text-sm font-medium sm:col-span-2">
                Public / operational notes
                <textarea name="publicNotes" rows={3} defaultValue={defaults.publicNotes} className="input-field mt-1" />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Internal notes
                <textarea name="internalNotes" rows={4} defaultValue={defaults.internalNotes} className="input-field mt-1" />
              </label>
            </div>
          </section>
        </>
      ) : (
        <section className="border border-line bg-white p-5">
          <h2 className="font-heading text-lg font-semibold">Notes</h2>
          <label className="mt-4 block text-sm font-medium">
            Notes for review
            <textarea name="notes" rows={4} defaultValue={defaults.publicNotes} className="input-field mt-1" />
          </label>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center bg-brand px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving vendor..." : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center border border-line px-5 text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
