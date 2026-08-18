"use client";

import { useId, useState } from "react";
import { FieldWrap } from "@/components/forms/FieldWrap";
import { normalizeCityTags } from "@/lib/vendor-application/coverage";

type TagInputProps = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  values: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (values: string[]) => void;
};

export function TagInput({
  id,
  label,
  hint,
  error,
  required,
  values,
  placeholder = "Type a city and press Enter",
  disabled,
  onChange,
}: TagInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const next = normalizeCityTags([...values, ...raw.split(",")]);
    onChange(next);
    setDraft("");
  }

  return (
    <FieldWrap label={label} htmlFor={inputId} error={error} required={required} hint={hint}>
      <div className="input-field flex min-h-12 flex-wrap items-center gap-2 py-2">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 bg-cream px-2 py-1 text-sm">
            {value}
            <button
              type="button"
              className="text-muted hover:text-brand"
              aria-label={`Remove ${value}`}
              disabled={disabled}
              onClick={() => onChange(values.filter((item) => item !== value))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm outline-none"
          placeholder={values.length === 0 ? placeholder : "Add another"}
          disabled={disabled}
          value={draft}
          aria-invalid={Boolean(error)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setDraft("");
              return;
            }
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              if (draft.trim()) commit(draft);
            }
            if (event.key === "Backspace" && draft === "" && values.length > 0) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) commit(draft);
          }}
        />
      </div>
    </FieldWrap>
  );
}
