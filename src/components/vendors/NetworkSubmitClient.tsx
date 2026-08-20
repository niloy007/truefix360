"use client";

import Link from "next/link";
import { VendorForm } from "@/components/vendors/VendorForm";
import { submitNetworkVendorAction } from "@/lib/vendor-network/actions";
import type { ActionResult } from "@/lib/vendors/actions";

export function NetworkSubmitClient({ token }: { token: string }) {
  const base = `/vendor-network/${encodeURIComponent(token)}`;

  async function action(formData: FormData): Promise<ActionResult> {
    const result = await submitNetworkVendorAction(token, formData);
    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        duplicates: result.duplicates,
      };
    }
    return { ok: true, message: result.message ?? "Vendor submitted for admin review." };
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={base} className="text-sm font-semibold text-brand hover:text-brand-hover">
          ← Back to directory
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold">Add Vendor</h1>
        <p className="mt-2 text-sm text-muted">
          Submissions require admin review before becoming official TrueFix360 vendors.
        </p>
      </div>
      <VendorForm
        mode="network"
        showInternalFields={false}
        submitLabel="Submit for Review"
        cancelHref={base}
        action={action}
      />
    </div>
  );
}
