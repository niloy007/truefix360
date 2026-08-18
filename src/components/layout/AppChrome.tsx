"use client";

import { usePathname } from "next/navigation";
import { LegacyRecoveryHashCatcher } from "@/components/auth/LegacyRecoveryHashCatcher";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/auth");

  if (isApp) {
    return (
      <>
        <LegacyRecoveryHashCatcher />
        {children}
      </>
    );
  }

  return (
    <>
      <LegacyRecoveryHashCatcher />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}
