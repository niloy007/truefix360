"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { SuccessState } from "@/components/forms/SuccessState";
import { TextareaField } from "@/components/forms/TextareaField";
import { Button } from "@/components/ui/Button";
import {
  coverageInquirySchema,
  type CoverageInquiryValues,
} from "@/lib/form-schemas";
import { submitForm } from "@/lib/submit";

export function CoverageInquiryForm() {
  const [result, setResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoverageInquiryValues>({
    resolver: zodResolver(coverageInquirySchema),
  });

  if (result) {
    return (
      <SuccessState
        title="Coverage inquiry validated"
        message="Thank you. The team can review this location once production delivery is connected."
        note={result}
        primary={{ href: "/contact", label: "Contact Our Team" }}
        secondary={{ href: "/get-a-quote", label: "Get a Quote" }}
      />
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          const response = await submitForm("coverage-inquiry", values);
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
        <FormField label="Name" required registration={register("name")} error={errors.name?.message} />
        <FormField label="Email" type="email" required registration={register("email")} error={errors.email?.message} />
      </div>
      <FormField
        label="City, county, or state"
        required
        registration={register("location")}
        error={errors.location?.message}
      />
      <TextareaField
        label="Additional details"
        registration={register("message")}
        error={errors.message?.message}
        rows={4}
      />
      {submitError ? (
        <p role="alert" className="text-sm text-[#b42318]">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} arrow>
        {isSubmitting ? "Submitting…" : "Request Coverage Information"}
      </Button>
    </form>
  );
}
