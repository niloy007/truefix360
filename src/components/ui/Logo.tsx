"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { brandAssets } from "@/config/company";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  inverted?: boolean;
};

export function Logo({ className, inverted = false }: LogoProps) {
  const [showFile, setShowFile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      if (!cancelled) setShowFile(true);
    };
    image.src = brandAssets.logo;
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-11 min-w-[148px] items-center gap-2.5 no-underline",
        className,
      )}
      aria-label="TrueFix360 home"
    >
      {showFile ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brandAssets.logo}
          alt="TrueFix360"
          width={168}
          height={48}
          className="h-10 w-auto object-contain sm:h-11"
        />
      ) : (
        <span className="inline-flex items-center gap-2.5">
          <span
            className="grid size-10 place-items-center rounded-md bg-brand text-white"
            aria-hidden="true"
          >
            <svg viewBox="0 0 32 32" className="size-6" fill="none">
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
          </span>
          <span className="leading-none">
            <span
              className={cn(
                "block font-heading text-[0.95rem] font-extrabold tracking-[0.14em]",
                inverted ? "text-white" : "text-ink",
              )}
            >
              TRUE FIX
            </span>
            <span className="block font-heading text-lg font-extrabold tracking-[0.22em] text-brand">
              360
            </span>
          </span>
        </span>
      )}
    </Link>
  );
}
