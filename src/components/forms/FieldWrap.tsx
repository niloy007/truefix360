import { cn } from "@/lib/utils";

type FieldWrapProps = {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function FieldWrap({
  label,
  htmlFor,
  error,
  required,
  hint,
  className,
  children,
}: FieldWrapProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="text-brand" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs leading-5 text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-[#b42318]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
