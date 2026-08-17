import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

type CheckboxFieldProps = {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "type">;

export function CheckboxField({
  label,
  error,
  registration,
  className,
  ...inputProps
}: CheckboxFieldProps) {
  const id = registration.name;

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="flex items-start gap-3 text-sm leading-6 text-ink">
        <input
          id={id}
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-brand"
          aria-invalid={Boolean(error)}
          {...inputProps}
          {...registration}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p role="alert" className="mt-1 pl-7 text-sm text-[#b42318]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
