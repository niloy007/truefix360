import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireUser();
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, first_name, last_name")
    .eq("id", ctx.userId)
    .maybeSingle();
  const name =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    ctx.email;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f1_0%,#f7f6f2_28%,#f7f6f2_100%)] text-ink">
      <header className="border-b border-line/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
            TrueFix360
          </Link>
          <p className="text-xs text-muted sm:text-sm">Signed in as {name}</p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
