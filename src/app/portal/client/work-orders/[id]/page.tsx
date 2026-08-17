import { DetailList } from "@/components/app/RecordList";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function ClientWorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireClientUser();
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("work_orders")
    .select("id, reference_number, service_category, scope, status, scheduled_start, client_visible_notes")
    .eq("id", id)
    .eq("client_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!data) notFound();
  const { data: events } = await admin
    .from("work_order_events")
    .select("id, event, created_at, note, visibility")
    .eq("work_order_id", id)
    .in("visibility", ["client", "shared"])
    .order("created_at", { ascending: true });
  const { data: files } = await admin
    .from("work_order_files")
    .select("id, original_name, category")
    .eq("work_order_id", id)
    .in("visibility", ["client", "shared"]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <DetailList
        rows={[
          ["Service", data.service_category],
          ["Scope", data.scope],
          ["Status", data.status],
          ["Schedule", data.scheduled_start],
          ["Notes", data.client_visible_notes],
        ]}
      />
      <section>
        <h2 className="font-heading text-xl font-semibold">Timeline</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(events ?? []).map((event) => (
            <li key={event.id}>{event.event}{event.note ? ` — ${event.note}` : ""}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-heading text-xl font-semibold">Files</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(files ?? []).map((file) => (
            <li key={file.id}>{file.category}: {file.original_name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
