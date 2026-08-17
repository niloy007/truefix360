"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckboxField } from "@/components/forms/CheckboxField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { SuccessState } from "@/components/forms/SuccessState";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";
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
  ["statesCovered", "countiesCities", "travelRadius", "willingToTravel", "tripCharge"],
  ["businessHours", "emergencyAvailability", "weekendAvailability", "experience"],
  ["accurate", "independentContractor", "permissionToContact", "terms"],
];

const businessTypes = [
  { value: "sole-proprietor", label: "Sole Proprietor" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
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

export function VendorApplyForm() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<VendorValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      services: [],
      accurate: false,
      independentContractor: false,
      permissionToContact: false,
      terms: false,
    },
  });

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  if (result) {
    return (
      <SuccessState
        title="Application details validated"
        message="Submitting an application does not guarantee assignments or work volume. Secure storage and team notification will be connected in a later phase."
        note={result}
        primary={{ href: "/vendors", label: "Vendor Information" }}
        secondary={{ href: "/", label: "Return Home" }}
      />
    );
  }

  return (
    <form
      className="grid gap-8"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          const response = await submitForm("vendor-application", {
            ...values,
            documentNames,
            taxIdNote:
              "EIN / Tax ID is collected later during secure onboarding and was not requested here.",
          });
          setResult(response.message);
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          );
        }
      })}
      noValidate
    >
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
            <span className="block text-[0.65rem] tracking-wide uppercase">
              Step {index + 1}
            </span>
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
                <input
                  type="checkbox"
                  value={option.value}
                  className="accent-brand"
                  {...register("services")}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-5">
          <FormField label="States Covered" required registration={register("statesCovered")} error={errors.statesCovered?.message} hint="List state names or codes." />
          <TextareaField label="Counties / Cities Covered" required registration={register("countiesCities")} error={errors.countiesCities?.message} rows={4} />
          <FormField label="Travel Radius" required registration={register("travelRadius")} error={errors.travelRadius?.message} hint="Example: 50 miles" />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Willing to travel?" required registration={register("willingToTravel")} error={errors.willingToTravel?.message} options={yesNo} />
            <SelectField label="Trip charge required?" required registration={register("tripCharge")} error={errors.tripCharge?.message} options={yesNo} />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-5">
          <FormField label="Normal business hours" required registration={register("businessHours")} error={errors.businessHours?.message} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Emergency availability" required registration={register("emergencyAvailability")} error={errors.emergencyAvailability?.message} options={yesNo} />
            <SelectField label="Weekend availability" required registration={register("weekendAvailability")} error={errors.weekendAvailability?.message} options={yesNo} />
          </div>
          <TextareaField
            label="Tell us about your property preservation or maintenance experience."
            required
            registration={register("experience")}
            error={errors.experience?.message}
            rows={6}
          />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-5">
          <FileUploadField
            label="Documents"
            name="vendor-docs"
            accept=".pdf,.jpg,.jpeg,.png"
            hint="Display only: W-9, General Liability Insurance, Workers Compensation if applicable, and Business License if applicable. Permanent document storage is a future implementation point."
            onFiles={(files) => setDocumentNames(files.map((file) => file.name))}
          />
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
            label="I acknowledge the website Terms of Service and understand that submitting an application does not guarantee assignments or work volume."
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
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || isSubmitting}
          onClick={() => setStep((value) => Math.max(value - 1, 0))}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={goNext} arrow>
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
