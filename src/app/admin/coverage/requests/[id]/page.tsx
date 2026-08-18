import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { updateCoverageRequestStatusAction } from "@/lib/coverage/actions";
import { serviceLabel } from "@/lib/coverage/logic";
import { createAdminClient } from "@/lib/supabase/admin";

const statuses = ["new", "reviewing", "sourcing", "coverage_found", "unable_to_cover", "converted", "closed"];

export default async function AdminCoverageRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("coverage_requests").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={data.reference_number} description={`${data.county_name}, ${data.state_code} · ${serviceLabel(data.service_category)}`} />
      <StatusBadge value={data.status} />
      <dl className="grid gap-3 border border-line bg-white p-5 text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Name</dt><dd>{data.first_name} {data.last_name}</dd></div>
        <div><dt className="text-muted">Company</dt><dd>{data.company || "—"}</dd></div>
        <div><dt className="text-muted">Email</dt><dd>{data.email}</dd></div>
        <div><dt className="text-muted">Phone</dt><dd>{data.phone}</dd></div>
        <div><dt className="text-muted">Location</dt><dd>{data.city}, {data.county_name}, {data.state_code} {data.zip}</dd></div>
        <div><dt className="text-muted">Urgency</dt><dd>{data.urgency}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Description</dt><dd className="whitespace-pre-wrap">{data.description}</dd></div>
        <div><dt className="text-muted">Coverage at submission</dt><dd>{data.coverage_result_at_submission}</dd></div>
      </dl>
      <form action={updateCoverageRequestStatusAction} className="flex flex-wrap gap-3 border border-line bg-white p-4">
        <input type="hidden" name="requestId" value={id} />
        <select name="status" defaultValue={data.status} className="input-field">
          {statuses.map((status) => (
            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
          ))}
        </select>
        <button type="submit" className="h-11 bg-ink px-4 text-sm font-semibold text-white">Update status</button>
      </form>
    </div>
  );
}
