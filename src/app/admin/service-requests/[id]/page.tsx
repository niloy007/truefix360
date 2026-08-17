import { DetailList } from "@/components/app/RecordList";
import { createWorkOrderFromRequest } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function AdminServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("service_requests").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <form action={async () => {
        "use server";
        await createWorkOrderFromRequest(id);
      }}>
        <button type="submit" className="h-12 bg-brand px-4 text-sm font-semibold text-white">Create work order</button>
      </form>
      <DetailList
        rows={[
          ["Issue", data.issue],
          ["Category", data.service_category],
          ["Priority", data.priority],
          ["Description", data.description],
          ["Client NTE", data.client_nte],
          ["Status", data.status],
        ]}
      />
    </div>
  );
}
