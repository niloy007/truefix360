import { DetailList } from "@/components/app/RecordList";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function ClientRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireClientUser();
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("service_requests")
    .select("id, reference_number, issue, description, status, service_category, priority")
    .eq("id", id)
    .eq("client_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <DetailList
        rows={[
          ["Issue", data.issue],
          ["Category", data.service_category],
          ["Priority", data.priority],
          ["Status", data.status],
          ["Description", data.description],
        ]}
      />
    </div>
  );
}
