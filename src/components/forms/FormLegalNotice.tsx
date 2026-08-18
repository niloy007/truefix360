import Link from "next/link";
import { cn } from "@/lib/utils";

type FormLegalNoticeProps = {
  className?: string;
};

export function FormLegalNotice({ className }: FormLegalNoticeProps) {
  return (
    <p className={cn("text-sm leading-6 text-muted", className)}>
      By submitting this form, you acknowledge our{" "}
      <Link href="/privacy" className="font-medium text-ink underline decoration-brand/40 underline-offset-2 hover:text-brand">
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link href="/terms" className="font-medium text-ink underline decoration-brand/40 underline-offset-2 hover:text-brand">
        Terms of Service
      </Link>
      .
    </p>
  );
}
