import { DetailList } from "@/components/app/RecordList";
import { updateContactStatus } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

const statuses = ["new", "reviewing", "responded", "closed"];

export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("contact_submissions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <form action={async (formData) => {
        "use server";
        await updateContactStatus(id, String(formData.get("status")));
      }} className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Status
          <select name="status" defaultValue={data.status} className="input-field mt-1">
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-12 bg-brand px-4 text-sm font-semibold text-white">Save status</button>
      </form>
      <DetailList
        rows={[
          ["Reference", data.reference_number],
          ["Name", `${data.first_name} ${data.last_name}`.trim()],
          ["Company", data.company],
          ["Email", data.email],
          ["Phone", data.phone],
          ["Topic", data.topic],
          ["Status", data.status],
          ["Submitted", formatDateTime(data.created_at)],
          ["Message", data.message],
        ]}
      />
    </div>
  );
}
