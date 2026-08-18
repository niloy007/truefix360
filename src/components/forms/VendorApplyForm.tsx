"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/forms/CheckboxField";
import { FormField } from "@/components/forms/FormField";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { SearchableMultiSelect } from "@/components/forms/SearchableMultiSelect";
import { SelectField } from "@/components/forms/SelectField";
import { SuccessState } from "@/components/forms/SuccessState";
import { TagInput } from "@/components/forms/TagInput";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";
import { getCountiesByState } from "@/data/us-counties";
import { usStates } from "@/data/us-states";
import {
  BUSINESS_HOURS_PRESETS,
  EMERGENCY_OPTIONS,
  TRAVEL_RADIUS_PRESETS,
  WEEKEND_OPTIONS,
  YES_NO_DEPENDS,
  stateHasChildCoverage,
  stateName,
  syncCoverageGroups,
  type CoverageGroup,
} from "@/lib/vendor-application/coverage";
import {
  stateOptions,
  vendorSchema,
  vendorServiceChoices,
  type VendorValues,
} from "@/lib/form-schemas";
import { submitForm } from "@/lib/submit";
import { cn } from "@/lib/utils";

const steps = [
  "Business Information",
  "Business Details",
  "Services",
  "Coverage",
  "Availability",
  "Documents & Agreements",
] as const;

const stepFields: Array<Array<keyof VendorValues>> = [
  ["companyName", "firstName", "lastName", "email", "phone", "address", "city", "state", "zip"],
  ["businessType", "yearsInBusiness", "crewCount", "insuranceStatus", "workersCompStatus"],
  ["services"],
  ["coverageStates", "coverageGroups", "travelRadiusPreset", "travelRadiusCustom", "willingToTravel", "tripCharge"],
  ["businessHoursPreset", "businessHoursCustom", "emergencyAvailability", "weekendAvailability", "experience"],
  ["accurate", "independentContractor", "permissionToContact", "terms"],
];

const businessTypes = [
  { value: "sole-proprietor", label: "Sole Proprietor" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

const insuranceOptions = [
  { value: "insured", label: "Currently insured" },
  { value: "in-progress", label: "In progress" },
  { value: "not-yet", label: "Not yet" },
  { value: "discuss", label: "Prefer to discuss during onboarding" },
];

const workersCompOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-applicable", label: "Not applicable" },
  { value: "discuss", label: "Prefer to discuss during onboarding" },
];

const stateSelectOptions = usStates.map((state) => ({
  value: state.code,
  label: state.name,
}));

const travelRadiusOptions = TRAVEL_RADIUS_PRESETS.map((value) => ({
  value,
  label: value === "custom" ? "Custom" : `${value} miles`,
}));

export function VendorApplyForm() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{ referenceNumber?: string; warning?: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VendorValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      services: [],
      coverageStates: [],
      coverageGroups: [],
      travelRadiusPreset: "",
      travelRadiusCustom: "",
      businessHoursPreset: "",
      businessHoursCustom: "",
      accurate: false,
      independentContractor: false,
      permissionToContact: false,
      terms: false,
      companyUrl: "",
    },
  });

  const coverageStates = useWatch({ control, name: "coverageStates" }) ?? [];
  const coverageGroups = useWatch({ control, name: "coverageGroups" }) ?? [];
  const travelRadiusPreset = useWatch({ control, name: "travelRadiusPreset" });
  const businessHoursPreset = useWatch({ control, name: "businessHoursPreset" });

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function changeStates(next: string[]) {
    const removed = coverageStates.filter((code) => !next.includes(code));
    for (const code of removed) {
      const group = coverageGroups.find((item) => item.state === code);
      if (stateHasChildCoverage(group)) {
        const confirmed = window.confirm(
          `Removing ${stateName(code)} will also remove the counties and cities entered for that state. Continue?`,
        );
        if (!confirmed) return;
      }
    }
    setValue("coverageStates", next, { shouldValidate: true });
    setValue("coverageGroups", syncCoverageGroups(next, coverageGroups), { shouldValidate: true });
  }

  function updateGroup(state: string, patch: Partial<CoverageGroup>) {
    setValue(
      "coverageGroups",
      coverageGroups.map((group) => (group.state === state ? { ...group, ...patch } : group)),
      { shouldValidate: true },
    );
  }

  if (result) {
    return (
      <SuccessState
        title="We received your vendor application"
        message="Submitting an application does not guarantee work assignments or work volume."
        referenceNumber={result.referenceNumber}
        warning={result.warning}
        primary={{ href: "/vendors", label: "Vendor Information" }}
        secondary={{ href: "/", label: "Return Home" }}
      />
    );
  }

  return (
    <form
      className="relative grid gap-8"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          const response = await submitForm("vendor-application", values);
          setResult({
            referenceNumber: response.referenceNumber,
            warning: response.warning,
          });
        } catch (error) {
          setSubmitError(
            error instanceof Error ? error.message : "Something went wrong. Please try again.",
          );
        }
      })}
      noValidate
    >
      <HoneypotField registration={register("companyUrl")} />
      <div className="lg:hidden">
        <p className="text-sm font-semibold text-ink">
          Step {step + 1} of {steps.length} — {steps[step]}
        </p>
        <div className="mt-2 h-1.5 bg-line">
          <div className="h-full bg-brand" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="hidden gap-2 lg:grid lg:grid-cols-6">
        {steps.map((label, index) => (
          <li
            key={label}
            className={cn(
              "border px-3 py-2 text-xs font-semibold",
              index === step
                ? "border-brand bg-brand text-white"
                : index < step
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-muted",
            )}
          >
            <span className="block text-[0.65rem] tracking-wide uppercase">Step {index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid gap-5">
          <FormField label="Company / Business Name" required registration={register("companyName")} error={errors.companyName?.message} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Contact First Name" required registration={register("firstName")} error={errors.firstName?.message} />
            <FormField label="Contact Last Name" required registration={register("lastName")} error={errors.lastName?.message} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Email" type="email" required registration={register("email")} error={errors.email?.message} />
            <FormField label="Phone" type="tel" required registration={register("phone")} error={errors.phone?.message} />
          </div>
          <FormField label="Website" registration={register("website")} error={errors.website?.message} />
          <FormField label="Business Address" required registration={register("address")} error={errors.address?.message} />
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="City" required registration={register("city")} error={errors.city?.message} />
            <SelectField label="State" required registration={register("state")} error={errors.state?.message} options={stateOptions} />
            <FormField label="ZIP" required registration={register("zip")} error={errors.zip?.message} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-5">
          <SelectField label="Business Type" required registration={register("businessType")} error={errors.businessType?.message} options={businessTypes} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Years in Business" required registration={register("yearsInBusiness")} error={errors.yearsInBusiness?.message} />
            <FormField label="Number of Field Technicians / Crews" required registration={register("crewCount")} error={errors.crewCount?.message} />
          </div>
          <div className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
            EIN / Tax ID is not collected on this public form. Sensitive tax data is requested later during secure onboarding.
          </div>
          <SelectField label="Insurance Status" required registration={register("insuranceStatus")} error={errors.insuranceStatus?.message} options={insuranceOptions} />
          <SelectField label="Workers Compensation Status" required registration={register("workersCompStatus")} error={errors.workersCompStatus?.message} options={workersCompOptions} hint="Select Not applicable if it does not apply to your business." />
        </div>
      ) : null}

      {step === 2 ? (
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-sm font-medium text-ink">
            Services <span className="text-brand">*</span>
          </legend>
          {errors.services?.message ? (
            <p role="alert" className="text-sm text-[#b42318]">
              {errors.services.message}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {vendorServiceChoices.map((option) => (
              <label key={option.value} className="flex items-center gap-2 border border-line bg-white px-3 py-2 text-sm">
                <input type="checkbox" value={option.value} className="accent-brand" {...register("services")} />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-6">
          <SearchableMultiSelect
            label="States Covered"
            required
            values={coverageStates}
            options={stateSelectOptions}
            error={errors.coverageStates?.message}
            placeholder="Search states"
            onChange={(next) => void changeStates(next)}
          />
          {errors.coverageGroups?.message ? (
            <p role="alert" className="text-sm text-[#b42318]">
              {errors.coverageGroups.message}
            </p>
          ) : null}
          {coverageGroups.map((group) => (
            <section key={group.state} className="grid gap-4 border border-line bg-white p-4 sm:p-5">
              <h3 className="font-heading text-lg font-semibold uppercase tracking-wide">{stateName(group.state)}</h3>
              <label className="flex items-start gap-3 text-sm leading-6">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-brand"
                  checked={group.allCounties}
                  onChange={(event) =>
                    updateGroup(group.state, {
                      allCounties: event.target.checked,
                      counties: event.target.checked ? [] : group.counties,
                    })
                  }
                />
                <span>I cover all counties in this state. TrueFix360 still reviews and verifies coverage before it becomes public.</span>
              </label>
              {group.allCounties ? (
                <p className="border-l-2 border-brand bg-cream px-3 py-2 text-sm">All counties claimed for {stateName(group.state)}.</p>
              ) : (
                <SearchableMultiSelect
                  label="Counties Covered"
                  required
                  values={group.counties}
                  options={getCountiesByState(group.state).map((county) => ({ value: county, label: county }))}
                  placeholder="Search counties"
                  onChange={(counties) => updateGroup(group.state, { counties })}
                />
              )}
              <TagInput
                label="Cities / Service Areas"
                hint="Optional. Press Enter or comma to add a city."
                values={group.cities}
                onChange={(cities) => updateGroup(group.state, { cities })}
              />
              <label className="flex items-start gap-3 text-sm leading-6">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-brand"
                  checked={group.nearbyAreas}
                  onChange={(event) => updateGroup(group.state, { nearbyAreas: event.target.checked })}
                />
                <span>I can cover additional nearby areas upon request</span>
              </label>
            </section>
          ))}
          <SelectField
            label="Travel Radius"
            required
            registration={register("travelRadiusPreset")}
            error={errors.travelRadiusPreset?.message}
            options={travelRadiusOptions}
          />
          {travelRadiusPreset === "custom" ? (
            <FormField
              label="Custom Travel Radius"
              required
              type="number"
              min={1}
              max={500}
              hint="Miles"
              registration={register("travelRadiusCustom")}
              error={errors.travelRadiusCustom?.message}
            />
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Willing to travel?" required registration={register("willingToTravel")} error={errors.willingToTravel?.message} options={[...YES_NO_DEPENDS]} />
            <SelectField label="Trip charge required?" required registration={register("tripCharge")} error={errors.tripCharge?.message} options={[...YES_NO_DEPENDS]} />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-5">
          <SelectField
            label="Normal business hours"
            required
            registration={register("businessHoursPreset")}
            error={errors.businessHoursPreset?.message}
            options={BUSINESS_HOURS_PRESETS.map((item) => ({ value: item.value, label: item.label }))}
          />
          {businessHoursPreset === "custom" ? (
            <TextareaField
              label="Custom business hours"
              required
              registration={register("businessHoursCustom")}
              error={errors.businessHoursCustom?.message}
              rows={4}
              placeholder={"Mon–Fri: 7:00 AM–6:00 PM\nSaturday: 8:00 AM–2:00 PM\nSunday: On call"}
            />
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Emergency availability" required registration={register("emergencyAvailability")} error={errors.emergencyAvailability?.message} options={[...EMERGENCY_OPTIONS]} />
            <SelectField label="Weekend availability" required registration={register("weekendAvailability")} error={errors.weekendAvailability?.message} options={[...WEEKEND_OPTIONS]} />
          </div>
          <TextareaField
            label="Tell us about your property preservation or maintenance experience."
            hint="Briefly describe your experience, typical work types, years in the field, and the types of properties you service."
            required
            registration={register("experience")}
            error={errors.experience?.message}
            rows={6}
          />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-5">
          <div className="border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
            W-9, insurance certificates, and business licenses are collected later
            through the secure Vendor Portal after an application is approved.
            Do not email tax IDs or Social Security numbers.
          </div>
          <CheckboxField
            label="The information in this application is accurate to the best of my knowledge."
            registration={register("accurate")}
            error={errors.accurate?.message}
          />
          <CheckboxField
            label="I acknowledge that I am applying as an independent contractor or service company, not as an employee of TrueFix360."
            registration={register("independentContractor")}
            error={errors.independentContractor?.message}
          />
          <CheckboxField
            label="I give TrueFix360 permission to contact me about this application."
            registration={register("permissionToContact")}
            error={errors.permissionToContact?.message}
          />
          <CheckboxField
            label={
              <>
                I acknowledge the website{" "}
                <Link href="/terms" className="font-medium underline decoration-brand/40 underline-offset-2 hover:text-brand">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium underline decoration-brand/40 underline-offset-2 hover:text-brand">
                  Privacy Policy
                </Link>{" "}
                and understand that submitting an application does not guarantee assignments or work volume.
              </>
            }
            registration={register("terms")}
            error={errors.terms?.message}
          />
        </div>
      ) : null}

      {submitError ? (
        <p role="alert" className="text-sm text-[#b42318]">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" disabled={step === 0 || isSubmitting} onClick={() => setStep((value) => Math.max(value - 1, 0))}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={() => void goNext()} arrow>
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} arrow>
            {isSubmitting ? "Submitting…" : "Submit Vendor Application"}
          </Button>
        )}
      </div>
    </form>
  );
}
