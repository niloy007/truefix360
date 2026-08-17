import Link from "next/link";
import { RecordList } from "@/components/app/RecordList";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientRequestsPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from("service_requests")
    .select("id, reference_number, issue, status, created_at, service_category")
    .eq("client_organization_id", ctx.membership.organizationId)
    .order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <Link href="/portal/client/requests/new" className="inline-flex h-12 items-center bg-brand px-4 text-sm font-semibold text-white">
        New Service Request
      </Link>
      <RecordList
        title="Service Requests"
        description="Requests for your organization only."
        empty="No service requests yet."
        rows={(data ?? []).map((row) => ({
          id: row.id,
          href: `/portal/client/requests/${row.id}`,
          title: `${row.reference_number} · ${row.issue}`,
          meta: row.service_category,
          status: row.status,
          createdAt: row.created_at,
        }))}
      />
    </div>
  );
}
