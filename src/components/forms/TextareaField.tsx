import type { TextareaHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldWrap } from "@/components/forms/FieldWrap";

type TextareaFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  registration: UseFormRegisterReturn;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "name">;

export function TextareaField({
  label,
  error,
  required,
  hint,
  registration,
  rows = 5,
  ...textareaProps
}: TextareaFieldProps) {
  const id = registration.name;

  return (
    <FieldWrap label={label} htmlFor={id} error={error} required={required} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        className="input-field resize-y"
        aria-invalid={Boolean(error)}
        {...textareaProps}
        {...registration}
      />
    </FieldWrap>
  );
}
