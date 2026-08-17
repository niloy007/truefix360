import type { SelectHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldWrap } from "@/components/forms/FieldWrap";

type SelectFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  registration: UseFormRegisterReturn;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "name">;

export function SelectField({
  label,
  error,
  required,
  hint,
  registration,
  options,
  placeholder = "Select an option",
  ...selectProps
}: SelectFieldProps) {
  const id = registration.name;

  return (
    <FieldWrap label={label} htmlFor={id} error={error} required={required} hint={hint}>
      <select
        id={id}
        className="input-field"
        aria-invalid={Boolean(error)}
        {...selectProps}
        {...registration}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}
