import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { VendorForm } from "@/components/vendors/VendorForm";
import { createVendorAction } from "@/lib/vendors/actions";

export default function NewVendorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Vendor"
        description="Manually create an official vendor record. Source will be recorded as manual."
        actions={
          <Link href="/admin/vendors" className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold">
            Back to vendors
          </Link>
        }
      />
      <VendorForm
        mode="create"
        submitLabel="Create Vendor"
        cancelHref="/admin/vendors"
        action={createVendorAction}
      />
    </div>
  );
}
