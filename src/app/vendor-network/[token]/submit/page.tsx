import Link from "next/link";
import {
  canSubmitVendors,
  inactiveLinkMessage,
  resolveNetworkLinkAccess,
} from "@/lib/vendor-network/access";
import { NetworkSubmitClient } from "@/components/vendors/NetworkSubmitClient";

export default async function SubmitNetworkVendorPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const access = await resolveNetworkLinkAccess(token);
  const base = `/vendor-network/${encodeURIComponent(token)}`;

  if (!access.ok) {
    return (
      <div className="mx-auto max-w-lg border border-line bg-white px-6 py-12 text-center">
        <h1 className="font-heading text-2xl font-semibold">Vendor Network</h1>
        <p className="mt-3 text-sm text-muted">{inactiveLinkMessage(access.reason)}</p>
      </div>
    );
  }

  if (!canSubmitVendors(access.link.permission)) {
    return (
      <div className="mx-auto max-w-lg border border-line bg-white px-6 py-12 text-center">
        <h1 className="font-heading text-2xl font-semibold">Permission required</h1>
        <p className="mt-3 text-sm text-muted">
          You don&apos;t have permission to perform this action. Viewer links cannot submit vendors.
        </p>
        <Link href={base} className="mt-6 inline-flex h-11 items-center border border-line px-4 text-sm font-semibold">
          Back to directory
        </Link>
      </div>
    );
  }

  return <NetworkSubmitClient token={token} />;
}
