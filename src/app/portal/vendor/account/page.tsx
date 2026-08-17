import { requireVendorUser } from "@/lib/auth/guards";

export default async function VendorAccountPage() {
  const ctx = await requireVendorUser();
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Account</h1>
      <p className="text-sm">Signed in as {ctx.email}</p>
      <p className="text-sm">Organization: {ctx.membership.organizationName}</p>
      <p className="text-sm">Role: {ctx.membership.role}</p>
    </div>
  );
}
