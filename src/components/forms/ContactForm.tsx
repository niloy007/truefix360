"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { SuccessState } from "@/components/forms/SuccessState";
import { TextareaField } from "@/components/forms/TextareaField";
import { contactSchema, contactTopics, type ContactValues } from "@/lib/form-schemas";
import { submitForm } from "@/lib/submit";

export function ContactForm() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const defaultTopic =
    topicParam === "coverage"
      ? "other"
      : topicParam === "resident"
        ? "resident"
        : topicParam ?? "";
  const [result, setResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      topic: defaultTopic,
    },
  });

  if (result) {
    return (
      <SuccessState
        title="Message received by the website"
        message="Thank you for contacting TrueFix360. Your details were validated."
        note={result}
        primary={{ href: "/", label: "Return Home" }}
        secondary={{ href: "/get-a-quote", label: "Request a Quote" }}
      />
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          const response = await submitForm("contact", values);
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
        <FormField
          label="Name"
          required
          registration={register("name")}
          error={errors.name?.message}
          autoComplete="name"
        />
        <FormField
          label="Company"
          registration={register("company")}
          error={errors.company?.message}
          autoComplete="organization"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Email"
          type="email"
          required
          registration={register("email")}
          error={errors.email?.message}
          autoComplete="email"
        />
        <FormField
          label="Phone"
          type="tel"
          required
          registration={register("phone")}
          error={errors.phone?.message}
          autoComplete="tel"
        />
      </div>
      <SelectField
        label="Topic"
        required
        registration={register("topic")}
        error={errors.topic?.message}
        options={contactTopics}
      />
      <TextareaField
        label="Message"
        required
        registration={register("message")}
        error={errors.message?.message}
      />
      {submitError ? (
        <p role="alert" className="text-sm text-[#b42318]">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} arrow>
        {isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
