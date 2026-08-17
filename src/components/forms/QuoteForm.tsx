"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { SuccessState } from "@/components/forms/SuccessState";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";
import {
  quoteCategories,
  quoteSchema,
  stateOptions,
  type QuoteValues,
} from "@/lib/form-schemas";
import { submitForm } from "@/lib/submit";

const propertyTypes = [
  { value: "single-family", label: "Single Family" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "condo", label: "Condo / Townhome" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

const occupancyOptions = [
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "unknown", label: "Unknown" },
];

const urgencyOptions = [
  { value: "routine", label: "Routine" },
  { value: "priority", label: "Priority" },
  { value: "emergency", label: "Emergency" },
];

const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "either", label: "Either" },
];

export function QuoteForm() {
  const [result, setResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
  });

  if (result) {
    return (
      <SuccessState
        title="Quote request validated"
        message="Submitting a request does not constitute acceptance of work or final pricing. Once production delivery is connected, the team will review requests and follow up."
        note={result}
        primary={{ href: "/", label: "Return Home" }}
        secondary={{ href: "/contact", label: "Contact Our Team" }}
      />
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          const response = await submitForm("quote", {
            ...values,
            attachmentNames: fileNames,
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
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First Name" required registration={register("firstName")} error={errors.firstName?.message} autoComplete="given-name" />
        <FormField label="Last Name" required registration={register("lastName")} error={errors.lastName?.message} autoComplete="family-name" />
      </div>
      <FormField label="Company" registration={register("company")} error={errors.company?.message} autoComplete="organization" />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Email" type="email" required registration={register("email")} error={errors.email?.message} autoComplete="email" />
        <FormField label="Phone" type="tel" required registration={register("phone")} error={errors.phone?.message} autoComplete="tel" />
      </div>
      <FormField label="Property Address" required registration={register("propertyAddress")} error={errors.propertyAddress?.message} autoComplete="street-address" />
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="City" required registration={register("city")} error={errors.city?.message} autoComplete="address-level2" />
        <SelectField label="State" required registration={register("state")} error={errors.state?.message} options={stateOptions} />
        <FormField label="ZIP" required registration={register("zip")} error={errors.zip?.message} autoComplete="postal-code" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Property Type" required registration={register("propertyType")} error={errors.propertyType?.message} options={propertyTypes} />
        <SelectField label="Occupancy Status" required registration={register("occupancyStatus")} error={errors.occupancyStatus?.message} options={occupancyOptions} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Service Category" required registration={register("serviceCategory")} error={errors.serviceCategory?.message} options={quoteCategories} />
        <FormField label="Requested Service" required registration={register("requestedService")} error={errors.requestedService?.message} />
      </div>
      <TextareaField label="Description" required registration={register("description")} error={errors.description?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Urgency" required registration={register("urgency")} error={errors.urgency?.message} options={urgencyOptions} />
        <FormField label="Preferred Date" type="date" registration={register("preferredDate")} error={errors.preferredDate?.message} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Number of Properties" required registration={register("numberOfProperties")} error={errors.numberOfProperties?.message} />
        <SelectField label="Preferred Contact Method" required registration={register("preferredContactMethod")} error={errors.preferredContactMethod?.message} options={contactMethods} />
      </div>
      <FileUploadField
        label="Photos or files"
        name="quote-files"
        accept="image/*,.pdf"
        onFiles={(files) => setFileNames(files.map((file) => file.name))}
      />
      <p className="text-sm leading-6 text-muted">
        Submitting a request does not constitute acceptance of work or final pricing.
      </p>
      {submitError ? (
        <p role="alert" className="text-sm text-[#b42318]">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} arrow>
        {isSubmitting ? "Submitting…" : "Request a Quote"}
      </Button>
    </form>
  );
}
