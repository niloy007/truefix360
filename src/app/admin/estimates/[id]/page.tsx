import { DetailList } from "@/components/app/RecordList";
import { publishClientEstimate } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function AdminEstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("estimates").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.reference_number}</h1>
      <DetailList
        rows={[
          ["Vendor amount", data.amount],
          ["Internal adjusted", data.internal_adjusted_amount],
          ["Client sell amount", data.client_sell_amount],
          ["Vendor description", data.description],
          ["Client scope", data.client_visible_scope],
          ["Status", data.status],
        ]}
      />
      <form action={publishClientEstimate} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Send client-facing estimate</h2>
        <input type="hidden" name="estimateId" value={id} />
        <label className="text-sm">Client amount
          <input name="clientSellAmount" type="number" step="0.01" className="input-field mt-1" required />
        </label>
        <label className="text-sm">Client-visible scope
          <textarea name="clientVisibleScope" className="input-field mt-1" rows={4} required />
        </label>
        <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">Send to client</button>
      </form>
    </div>
  );
}
