import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { homePathForRole } from "@/config/platform";

export const dynamic = "force-dynamic";

export default async function PortalSelectPage() {
  const ctx = await requireUser();
  const active = ctx.memberships.filter((item) => item.status === "active");
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-heading text-3xl font-semibold">Choose an organization</h1>
      <p className="mt-2 text-sm text-muted">Your account belongs to more than one TrueFix360 workspace.</p>
      <ul className="mt-8 space-y-3">
        {active.map((item) => (
          <li key={item.id}>
            <Link href={homePathForRole(item.role)} className="block border border-line bg-white px-4 py-4 hover:border-brand">
              <span className="block font-semibold">{item.organizationName}</span>
              <span className="text-sm text-muted">{item.role}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
