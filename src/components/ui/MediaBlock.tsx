"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type MediaVariant =
  | "hero"
  | "preservation"
  | "maintenance"
  | "vendor"
  | "resident"
  | "about"
  | "field";

type ObjectFit = "cover" | "contain";

type MediaBlockProps = {
  variant?: MediaVariant;
  alt: string;
  className?: string;
  src?: string;
  framed?: boolean;
  objectFit?: ObjectFit;
  objectPosition?: string;
  sizes?: string;
  priority?: boolean;
};

const captions: Record<MediaVariant, string> = {
  hero: "Property services in the field",
  preservation: "Vacant property care",
  maintenance: "Occupied property maintenance",
  vendor: "Vendor network",
  resident: "Resident service experience",
  about: "TrueFix360 field coordination",
  field: "Field execution",
};

export function MediaBlock({
  variant = "field",
  alt,
  className,
  src,
  framed = false,
  objectFit = "cover",
  objectPosition = "center",
  sizes = "100vw",
  priority = false,
}: MediaBlockProps) {
  const [failed, setFailed] = useState(false);
  const decorative = alt === "";
  const showPhoto = Boolean(src) && !failed;
  const fallbackLabel = alt || captions[variant];

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-ink",
        framed && "ring-1 ring-white/10 shadow-[18px_18px_0_0_#F35A18]",
        className,
      )}
      aria-hidden={decorative ? true : undefined}
      role={!showPhoto && !decorative ? "img" : undefined}
      aria-label={!showPhoto && !decorative ? fallbackLabel : undefined}
    >
      {showPhoto ? (
        <Image
          src={src!}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="pointer-events-none select-none"
          style={{ objectFit, objectPosition }}
          onError={() => setFailed(true)}
        />
      ) : (
        <PlaceholderArt variant={variant} />
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-near-black/80 via-ink/20 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-1.5 bg-brand"
        aria-hidden="true"
      />
      {!showPhoto ? (
        <p
          className="pointer-events-none absolute bottom-5 left-5 right-5 font-heading text-sm font-medium tracking-wide text-white/85"
          aria-hidden="true"
        >
          {fallbackLabel}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Subtle fallback when photography is unavailable.
 * Must NEVER scale a house/check mark to the full media frame — that caused the
 * production homepage giant-icon regression (SVG with h-full/w-full in hero).
 */
function PlaceholderArt({ variant }: { variant: MediaVariant }) {
  const tint = {
    hero: "from-near-black via-ink to-[#243038]",
    preservation: "from-near-black via-[#1c242a] to-[#243038]",
    maintenance: "from-near-black via-[#1e2622] to-[#2c3430]",
    vendor: "from-near-black via-[#1c222c] to-[#2a2f38]",
    resident: "from-near-black via-[#22261f] to-[#2d322c]",
    about: "from-near-black via-ink to-[#262c32]",
    field: "from-near-black via-ink to-[#283038]",
  }[variant];

  return (
    <div className={cn("absolute inset-0 bg-linear-to-br", tint)} aria-hidden="true">
      <div className="absolute inset-0 pattern-grid opacity-40" />
      <div className="absolute inset-0 grid place-items-center">
        <svg
          viewBox="0 0 32 32"
          width={64}
          height={64}
          className="size-16 shrink-0 text-white/25"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M5 14.5L16 6l11 8.5V26a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 5 26V14.5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M11.5 18.5 14.8 21.8 21 14.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute inset-y-0 left-0 w-1.5 bg-brand" />
    </div>
  );
}
