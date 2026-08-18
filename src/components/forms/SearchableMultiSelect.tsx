"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldWrap } from "@/components/forms/FieldWrap";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type SearchableMultiSelectProps = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  values: string[];
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (values: string[]) => void;
  onRemoveRequest?: (value: string) => boolean | Promise<boolean>;
};

export function SearchableMultiSelect({
  id,
  label,
  hint,
  error,
  required,
  values,
  options,
  placeholder = "Search and select",
  disabled,
  onChange,
  onRemoveRequest,
}: SearchableMultiSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => values.map((value) => options.find((option) => option.value === value) ?? { value, label: value }),
    [options, values],
  );

  const available = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return options.filter((option) => {
      if (values.includes(option.value)) return false;
      if (!needle) return true;
      return option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle);
    });
  }, [options, query, values]);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  const boundedActiveIndex = available.length === 0 ? 0 : Math.min(activeIndex, available.length - 1);

  async function removeValue(value: string) {
    if (onRemoveRequest) {
      const allowed = await onRemoveRequest(value);
      if (!allowed) return;
    }
    onChange(values.filter((item) => item !== value));
  }

  function selectValue(value: string) {
    if (disabled || values.includes(value)) return;
    onChange([...values, value]);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  return (
    <FieldWrap label={label} htmlFor={inputId} error={error} required={required} hint={hint}>
      <div ref={rootRef} className="relative">
        <div
          className={cn(
            "input-field flex min-h-12 flex-wrap items-center gap-2 py-2",
            disabled && "bg-cream text-muted",
          )}
        >
          {selected.map((item) => (
            <span
              key={item.value}
              className="inline-flex max-w-full items-center gap-1 bg-cream px-2 py-1 text-sm text-ink"
            >
              <span className="truncate">{item.label}</span>
              <button
                type="button"
                className="shrink-0 rounded-sm text-muted hover:text-brand focus-visible:outline-none"
                aria-label={`Remove ${item.label}`}
                disabled={disabled}
                onClick={() => void removeValue(item.value)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm outline-none"
            placeholder={selected.length === 0 ? placeholder : "Add another"}
            disabled={disabled}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={Boolean(error)}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => {
              setOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => Math.min(index + 1, Math.max(available.length - 1, 0)));
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
                return;
              }
              if (event.key === "Enter" && open && available[boundedActiveIndex]) {
                event.preventDefault();
                selectValue(available[boundedActiveIndex].value);
                return;
              }
              if (event.key === "Backspace" && query === "" && selected.length > 0) {
                void removeValue(selected[selected.length - 1].value);
              }
            }}
          />
        </div>
        {open && !disabled ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto border border-line bg-white shadow-sm"
          >
            {available.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            ) : (
              available.map((option, index) => (
                <li key={option.value} role="option" aria-selected={index === boundedActiveIndex}>
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm",
                      index === boundedActiveIndex ? "bg-cream text-ink" : "text-ink hover:bg-cream",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectValue(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </FieldWrap>
  );
}
