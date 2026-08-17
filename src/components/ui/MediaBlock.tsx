"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const decorative = alt === "";
  const showPhoto = Boolean(src) && loadedSrc === src;
  const fallbackLabel = alt || captions[variant];

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setLoadedSrc(src);
    };
    probe.onerror = () => {
      if (!cancelled) setLoadedSrc(null);
    };
    probe.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

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
          onError={() => setLoadedSrc(null)}
        />
      ) : (
        <>
          <div className="absolute inset-0 pattern-grid opacity-50" aria-hidden="true" />
          <PlaceholderArt variant={variant} />
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-near-black/80 via-ink/20 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-1.5 bg-brand"
        aria-hidden="true"
      />
      <p
        className="pointer-events-none absolute bottom-5 left-5 right-5 font-heading text-sm font-medium tracking-wide text-white/85"
        aria-hidden="true"
      >
        {fallbackLabel}
      </p>
    </div>
  );
}

function PlaceholderArt({ variant }: { variant: MediaVariant }) {
  const palette = {
    hero: { a: "#2a3036", b: "#F35A18" },
    preservation: { a: "#243038", b: "#d97a3a" },
    maintenance: { a: "#2c3430", b: "#F35A18" },
    vendor: { a: "#2a2f38", b: "#e07a3a" },
    resident: { a: "#2d322c", b: "#F35A18" },
    about: { a: "#262c32", b: "#F35A18" },
    field: { a: "#283038", b: "#F35A18" },
  }[variant];

  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full object-cover"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="800" height="560" fill={palette.a} />
      <rect x="0" y="330" width="800" height="230" fill="#1a1f24" />
      <polygon points="90,330 250,170 410,330" fill="#3a424a" />
      <rect x="170" y="250" width="70" height="80" fill="#171a1d" />
      <rect x="430" y="210" width="220" height="120" fill="#323940" />
      <rect x="470" y="250" width="46" height="80" fill="#171a1d" />
      <circle cx="640" cy="120" r="46" fill="#cfd5da" opacity="0.28" />
      <rect x="540" y="360" width="170" height="90" fill="#2f363d" />
      <rect x="80" y="390" width="140" height="70" fill="#2b3238" />
      <path d="M120 430h40M140 410v40" stroke={palette.b} strokeWidth="6" />
      <rect x="0" y="0" width="18" height="560" fill={palette.b} />
    </svg>
  );
}
