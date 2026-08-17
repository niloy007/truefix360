import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldWrap } from "@/components/forms/FieldWrap";

type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  registration: UseFormRegisterReturn;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name">;

export function FormField({
  label,
  error,
  required,
  hint,
  registration,
  ...inputProps
}: FormFieldProps) {
  const id = registration.name;

  return (
    <FieldWrap label={label} htmlFor={id} error={error} required={required} hint={hint}>
      <input
        id={id}
        className="input-field"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
        {...registration}
      />
    </FieldWrap>
  );
}
