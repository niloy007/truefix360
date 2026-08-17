import { MainNav } from "@/components/layout/MainNav";
import { TopBar } from "@/components/layout/TopBar";

export function SiteHeader() {
  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50">
        <MainNav />
      </header>
    </>
  );
}
