"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { FieldWrap } from "@/components/forms/FieldWrap";

type FileUploadFieldProps = {
  label: string;
  name: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

export function FileUploadField({
  label,
  name,
  hint = "JPG, PNG, WebP, or PDF. Up to 5 files, 10 MB each.",
  accept,
  multiple = true,
  onFiles,
}: FileUploadFieldProps) {
  const [names, setNames] = useState<string[]>([]);

  return (
    <FieldWrap label={label} htmlFor={name} required={false} hint={hint}>
      <label
        htmlFor={name}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-cream px-4 py-8 text-center hover:border-brand"
      >
        <Upload className="size-6 text-brand" aria-hidden="true" />
        <span className="text-sm font-medium text-ink">Choose files or drop them here</span>
        <span className="text-xs text-muted">JPG, PNG, WebP, or PDF — max 10 MB each.</span>
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            const next = Array.from(event.target.files ?? []).slice(0, 5);
            setNames(next.map((file) => file.name));
            onFiles(next);
          }}
        />
      </label>
      {names.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {names.map((fileName) => (
            <li key={fileName}>{fileName}</li>
          ))}
        </ul>
      ) : null}
    </FieldWrap>
  );
}
