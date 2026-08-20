import { Suspense } from "react";
import { MainNav } from "@/components/layout/MainNav";
import { TopBar } from "@/components/layout/TopBar";

function MainNavFallback() {
  return (
    <div className="border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-5 sm:px-6 lg:h-[4.25rem] lg:px-8" />
    </div>
  );
}

export function SiteHeader() {
  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50">
        <Suspense fallback={<MainNavFallback />}>
          <MainNav />
        </Suspense>
      </header>
    </>
  );
}
