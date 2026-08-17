import { requireClientUser } from "@/lib/auth/guards";

export default async function ClientAccountPage() {
  const ctx = await requireClientUser();
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Account</h1>
      <p className="text-sm">Signed in as {ctx.email}</p>
      <p className="text-sm">Organization: {ctx.membership.organizationName}</p>
    </div>
  );
}
