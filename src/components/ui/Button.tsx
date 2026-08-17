import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover border border-brand hover:border-brand-hover",
  secondary:
    "bg-transparent text-white border border-white/70 hover:bg-white hover:text-ink",
  outline:
    "bg-transparent text-ink border border-ink/15 hover:border-ink hover:bg-ink hover:text-white",
  ghost: "bg-transparent text-ink hover:text-brand",
  dark: "bg-ink text-white border border-ink hover:bg-near-black",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "min-h-12 px-6 py-3 text-[0.95rem]",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    arrow = false,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-heading font-semibold tracking-wide transition-colors duration-200 disabled:opacity-55 disabled:pointer-events-none",
    variantClass[variant],
    sizeClass[size],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {arrow ? (
        <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : null}
    </>
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={cn("group", classes)} {...linkRest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cn("group", classes)} {...(rest as ButtonAsButton)}>
      {content}
    </button>
  );
}
