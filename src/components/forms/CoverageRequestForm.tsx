"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { SelectField } from "@/components/forms/SelectField";
import { SuccessState } from "@/components/forms/SuccessState";
import { TextareaField } from "@/components/forms/TextareaField";
import { FormLegalNotice } from "@/components/forms/FormLegalNotice";
import { Button } from "@/components/ui/Button";
import { services } from "@/data/services";
import {
  coverageRequestSchema,
  stateOptions,
  type CoverageRequestValues,
} from "@/lib/form-schemas";

export function CoverageRequestForm({
  defaults,
}: {
  defaults?: Partial<CoverageRequestValues>;
}) {
  const [result, setResult] = useState<{ referenceNumber?: string; warning?: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoverageRequestValues>({
    resolver: zodResolver(coverageRequestSchema),
    defaultValues: {
      urgency: "routine",
      ...defaults,
    },
  });

  if (result) {
    return (
      <SuccessState
        title="Coverage request received"
        message="Thank you. Operations will review this location. A request does not guarantee that coverage can be sourced."
        referenceNumber={result.referenceNumber}
        warning={result.warning}
        primary={{ href: "/coverage", label: "Back to Coverage" }}
        secondary={{ href: "/contact", label: "Contact Our Team" }}
      />
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        const response = await fetch("/api/coverage/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: values, idempotencyKey: crypto.randomUUID() }),
        });
        const body = (await response.json()) as { ok?: boolean; referenceNumber?: string; warning?: string; message?: string };
        if (!response.ok || !body.ok) {
          setSubmitError(body.message || "The request could not be submitted.");
          return;
        }
        setResult({ referenceNumber: body.referenceNumber, warning: body.warning });
      })}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First name" required registration={register("firstName")} error={errors.firstName?.message} />
        <FormField label="Last name" required registration={register("lastName")} error={errors.lastName?.message} />
      </div>
      <FormField label="Company" registration={register("company")} error={errors.company?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Email" type="email" required registration={register("email")} error={errors.email?.message} />
        <FormField label="Phone" required registration={register("phone")} error={errors.phone?.message} />
      </div>
      <FormField label="Property address" registration={register("propertyAddress")} error={errors.propertyAddress?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="City" required registration={register("city")} error={errors.city?.message} />
        <SelectField label="State" required registration={register("state")} options={stateOptions} error={errors.state?.message} placeholder="Select state" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="County" required registration={register("county")} error={errors.county?.message} />
        <FormField label="ZIP" registration={register("zip")} error={errors.zip?.message} />
      </div>
      <SelectField
        label="Service category"
        required
        registration={register("serviceCategory")}
        options={services.map((item) => ({ value: item.slug, label: item.name }))}
        error={errors.serviceCategory?.message}
        placeholder="Select service"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Number of properties" registration={register("numberOfProperties")} error={errors.numberOfProperties?.message} />
        <SelectField
          label="Urgency"
          required
          registration={register("urgency")}
          options={[
            { value: "routine", label: "Routine" },
            { value: "priority", label: "Priority" },
            { value: "emergency", label: "Emergency" },
          ]}
          error={errors.urgency?.message}
        />
      </div>
      <TextareaField label="Description" required registration={register("description")} error={errors.description?.message} />
      <HoneypotField registration={register("companyUrl")} />
      {submitError ? <p className="text-sm text-red-800">{submitError}</p> : null}
      <p className="text-sm leading-6 text-muted">
        A request does not guarantee that local coverage can be sourced.
      </p>
      <FormLegalNotice />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Request Coverage Review"}
      </Button>
    </form>
  );
}
