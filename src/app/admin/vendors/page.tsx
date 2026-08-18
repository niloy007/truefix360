import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminInput, PageHeader, StatusBadge } from "@/components/admin/ui";
import { unwrap } from "@/lib/admin/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from("organizations")
    .select("id, name, status, vendor_profiles(service_categories, coverage, onboarding_status)")
    .eq("type", "vendor")
    .order("name");
  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);
  const { data } = await query;
  const ids = (data ?? []).map((row) => row.id);
  const { data: assignments } = ids.length
    ? await admin.from("work_order_assignments").select("id, vendor_organization_id, status").in("vendor_organization_id", ids)
    : { data: [] };

  return (
    <div className="space-y-6">
      <PageHeader title="Vendors" description="Vendor organizations, services, coverage, and currently open assignments." />
      <FilterBar>
        <AdminInput name="q" defaultValue={params.q} placeholder="Search vendor name" />
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Search</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No vendors yet" body="Approved vendor applications create vendor organizations here." />
      ) : (
        <AdminTable headers={["Vendor", "Services", "Coverage", "Open jobs", "Status"]}>
          {(data ?? []).map((row) => {
            const profile = unwrap<{ service_categories?: string[]; coverage?: string; onboarding_status?: string }>(row.vendor_profiles as never);
            const openJobs = (assignments ?? []).filter((item) => item.vendor_organization_id === row.id && ["offered", "accepted"].includes(item.status)).length;
            return (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2"><Link href={`/admin/vendors/${row.id}`} className="font-semibold hover:text-brand">{row.name}</Link></td>
                <td className="px-3 py-2">{(profile?.service_categories ?? []).slice(0, 4).join(", ") || "—"}</td>
                <td className="px-3 py-2 text-muted">{profile?.coverage || "—"}</td>
                <td className="px-3 py-2">{openJobs}</td>
                <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
