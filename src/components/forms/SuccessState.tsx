import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SuccessStateProps = {
  title: string;
  message: string;
  note?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export function SuccessState({
  title,
  message,
  note,
  primary,
  secondary,
}: SuccessStateProps) {
  return (
    <div className="border border-line bg-white p-8 sm:p-10" role="status">
      <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      <h2 className="mt-5 font-heading text-2xl font-semibold text-ink sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{message}</p>
      {note ? (
        <p className="mt-4 max-w-2xl border-l-2 border-brand bg-cream px-4 py-3 text-sm leading-6 text-ink">
          {note}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {primary ? (
          <Button href={primary.href} arrow>
            {primary.label}
          </Button>
        ) : null}
        {secondary ? (
          <Button href={secondary.href} variant="outline">
            {secondary.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
