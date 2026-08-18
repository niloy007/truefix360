import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTable, PageHeader, StatusBadge } from "@/components/admin/ui";
import { MARKET_STATE_CODES, serviceLabel, stateName } from "@/lib/coverage/logic";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCoverageStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const code = state.toUpperCase();
  if (!(MARKET_STATE_CODES as readonly string[]).includes(code)) notFound();
  const admin = createAdminClient();
  const [{ data: rows }, { data: gaps }, { count: requestCount }] = await Promise.all([
    admin.from("v_effective_coverage").select("*").eq("state_code", code),
    admin.from("coverage_gaps").select("*").eq("state_code", code).in("status", ["open", "sourcing"]),
    admin.from("coverage_requests").select("id", { count: "exact", head: true }).eq("state_code", code).in("status", ["new", "reviewing"]),
  ]);

  const counties = new Map<string, { name: string; services: number; vendors: number; manual: boolean; status: string }>();
  for (const row of rows ?? []) {
    const current = counties.get(row.normalized_county_name) ?? {
      name: row.county_name,
      services: 0,
      vendors: 0,
      manual: false,
      status: "not_established",
    };
    current.services += 1;
    current.vendors += row.vendor_count ?? 0;
    current.manual = current.manual || Boolean(row.manual_support);
    if (row.coverage_status === "active") current.status = "active";
    else if (row.coverage_status === "limited" && current.status !== "active") current.status = "limited";
    counties.set(row.normalized_county_name, current);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${stateName(code)} coverage`}
        description="County and service coverage is verified capability, not a statewide promise."
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase text-muted">Verified counties</p><p className="font-heading text-3xl">{[...counties.values()].filter((item) => item.status === "active").length}</p></div>
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase text-muted">Services</p><p className="font-heading text-3xl">{new Set((rows ?? []).map((row) => row.service_category)).size}</p></div>
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase text-muted">Open gaps</p><p className="font-heading text-3xl">{gaps?.length ?? 0}</p></div>
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase text-muted">Open requests</p><p className="font-heading text-3xl">{requestCount ?? 0}</p></div>
      </div>
      <AdminTable headers={["County", "Services", "Verified vendors", "Manual coverage", "Status"]}>
        {[...counties.entries()].map(([key, row]) => (
          <tr key={key} className="border-t border-line">
            <td className="px-3 py-2">
              <Link href={`/admin/coverage/${code}?county=${encodeURIComponent(key)}`} className="font-semibold hover:text-brand">{row.name}</Link>
            </td>
            <td className="px-3 py-2">{row.services}</td>
            <td className="px-3 py-2">{row.vendors}</td>
            <td className="px-3 py-2">{row.manual ? "Yes" : "No"}</td>
            <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
          </tr>
        ))}
      </AdminTable>
      <section>
        <h2 className="font-heading text-xl font-semibold">Service detail</h2>
        <div className="mt-3 divide-y divide-line border border-line bg-white">
          {(rows ?? []).map((row) => (
            <div key={`${row.normalized_county_name}-${row.service_category}`} className="px-4 py-3 text-sm">
              <p className="font-semibold">{row.county_name} · {serviceLabel(row.service_category)}</p>
              <p className="text-muted">
                {row.coverage_status} · {row.vendor_count ?? 0} verified vendor{row.vendor_count === 1 ? "" : "s"}
                {row.manual_support ? " · manual coverage" : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
