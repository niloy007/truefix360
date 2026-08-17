import { DetailList } from "@/components/app/RecordList";
import { convertQuoteToServiceRequest, updateQuoteStatus } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/format";
import { createSignedUrl } from "@/lib/storage";
import { STORAGE_BUCKETS } from "@/config/platform";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

const statuses = ["new", "reviewing", "contacted", "qualified", "converted", "declined", "closed"];

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("quote_requests").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const { data: files } = await admin.from("quote_attachments").select("*").eq("quote_request_id", id);
  const signed = await Promise.all(
    (files ?? []).map(async (file) => ({
      ...file,
      url: await createSignedUrl(STORAGE_BUCKETS.quoteAttachments, file.storage_path, 300),
    })),
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <div className="flex flex-wrap gap-3">
        <form action={async (formData) => {
          "use server";
          await updateQuoteStatus(id, String(formData.get("status")));
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
        <form action={async () => {
          "use server";
          await convertQuoteToServiceRequest(id);
        }}>
          <button type="submit" className="h-12 border border-ink px-4 text-sm font-semibold">Convert to Service Request</button>
        </form>
      </div>
      <DetailList
        rows={[
          ["Reference", data.reference_number],
          ["Name", `${data.first_name} ${data.last_name}`],
          ["Company", data.company],
          ["Email", data.email],
          ["Phone", data.phone],
          ["Property", `${data.property_address}, ${data.city}, ${data.state} ${data.zip}`],
          ["Property type", data.property_type],
          ["Occupancy", data.occupancy_status],
          ["Service", data.service_category],
          ["Requested work", data.requested_service],
          ["Description", data.description],
          ["Urgency", data.urgency],
          ["Preferred date", data.preferred_date],
          ["Properties", data.number_of_properties],
          ["Contact method", data.preferred_contact_method],
          ["Submitted", formatDateTime(data.created_at)],
        ]}
      />
      <section>
        <h2 className="font-heading text-xl font-semibold">Attachments</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {signed.length === 0 ? <li className="text-muted">No files.</li> : signed.map((file) => (
            <li key={file.id}>
              {file.url ? <a href={file.url} className="font-semibold text-brand">{file.original_name}</a> : file.original_name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
