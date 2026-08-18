import Link from "next/link";
import {
  AdminTable,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { addManualCoverageAction, verifyVendorCoverageAction } from "@/lib/coverage/actions";
import { MARKET_STATE_CODES, serviceLabel, stateName } from "@/lib/coverage/logic";
import { services } from "@/data/services";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCoveragePage() {
  const admin = createAdminClient();
  const [
    marketStates,
    effective,
    pending,
    gaps,
    requests,
  ] = await Promise.all([
    admin.from("market_states").select("*").order("display_order"),
    admin.from("v_effective_coverage").select("*"),
    admin
      .from("vendor_coverage")
      .select("id, state_code, county_name, service_category, created_at, organizations:vendor_organization_id(name)")
      .eq("verification_status", "unverified")
      .order("created_at", { ascending: false })
      .limit(12),
    admin.from("coverage_gaps").select("id", { count: "exact", head: true }).in("status", ["open", "sourcing"]),
    admin.from("coverage_requests").select("id", { count: "exact", head: true }).in("status", ["new", "reviewing"]),
  ]);

  const rows = effective.data ?? [];
  const verifiedCounties = new Set(rows.filter((row) => row.coverage_status === "active").map((row) => `${row.state_code}:${row.normalized_county_name}`)).size;
  const vendorIds = new Set(rows.filter((row) => (row.vendor_count ?? 0) > 0).map((row) => row.state_code));

  const byState = (MARKET_STATE_CODES as readonly string[]).map((code) => {
    const stateRows = rows.filter((row) => row.state_code === code);
    return {
      code,
      counties: new Set(stateRows.filter((row) => row.coverage_status === "active").map((row) => row.normalized_county_name)).size,
      services: new Set(stateRows.map((row) => row.service_category)).size,
      vendors: stateRows.reduce((sum, row) => sum + (row.vendor_count ?? 0), 0),
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Coverage intelligence"
        description="Understand active network capability, vendor depth, and service gaps. Market states are not statewide coverage guarantees."
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Market states" value={(marketStates.data ?? []).length} />
        <MetricCard label="Verified counties" value={verifiedCounties} />
        <MetricCard label="Active coverage vendors" value={vendorIds.size} hint="States with at least one verified vendor source" />
        <MetricCard label="Open coverage gaps" value={gaps.count ?? 0} href="/admin/coverage/gaps" />
        <MetricCard label="Coverage requests" value={requests.count ?? 0} href="/admin/coverage/requests" />
      </section>
      <section>
        <h2 className="font-heading text-xl font-semibold">Market overview</h2>
        <div className="mt-3">
          <AdminTable headers={["State", "Verified counties", "Vendor sources", "Service categories", "Status"]}>
            {byState.map((row) => (
              <tr key={row.code} className="border-t border-line">
                <td className="px-3 py-2">
                  <Link href={`/admin/coverage/${row.code}`} className="font-semibold hover:text-brand">
                    {row.code} · {stateName(row.code)}
                  </Link>
                </td>
                <td className="px-3 py-2">{row.counties}</td>
                <td className="px-3 py-2">{row.vendors}</td>
                <td className="px-3 py-2">{row.services}</td>
                <td className="px-3 py-2"><StatusBadge value="growing" /></td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl font-semibold">Coverage awaiting verification</h2>
          <div className="mt-3 divide-y divide-line border border-line bg-white">
            {(pending.data ?? []).length === 0 ? (
              <EmptyState title="No proposed coverage" body="Approved vendor applications will create proposed coverage for review. Approval alone does not publish coverage." />
            ) : (
              (pending.data ?? []).map((row) => {
                const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
                return (
                  <form key={row.id} action={verifyVendorCoverageAction} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-semibold">{org?.name ?? "Vendor"}</p>
                      <p className="text-sm text-muted">{row.county_name}, {row.state_code} · {serviceLabel(row.service_category)}</p>
                    </div>
                    <input type="hidden" name="coverageId" value={row.id} />
                    <button className="h-9 bg-brand px-3 text-sm font-semibold text-white" type="submit">Verify</button>
                  </form>
                );
              })
            )}
          </div>
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold">Add manual coverage</h2>
          <form action={addManualCoverageAction} className="mt-3 grid gap-3 border border-line bg-white p-4">
            <select name="state" className="input-field" required defaultValue="">
              <option value="">State</option>
              {MARKET_STATE_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <input name="county" className="input-field" placeholder="County" required />
            <select name="service" className="input-field" required defaultValue="">
              <option value="">Service</option>
              {services.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
            <select name="status" className="input-field" defaultValue="active">
              <option value="active">Active</option>
              <option value="limited">Limited</option>
            </select>
            <label className="text-sm">
              <input type="checkbox" name="publicVisible" value="true" defaultChecked className="mr-2" />
              Public visible
            </label>
            <textarea name="notes" className="input-field" placeholder="Internal note" rows={3} />
            <button type="submit" className="h-11 bg-ink text-sm font-semibold text-white">Save manual coverage</button>
          </form>
        </div>
      </section>
      <p className="text-sm">
        <Link href="/admin/coverage/gaps" className="font-semibold text-brand">Open gaps</Link>
        {" · "}
        <Link href="/admin/coverage/requests" className="font-semibold text-brand">Coverage requests</Link>
      </p>
    </div>
  );
}
