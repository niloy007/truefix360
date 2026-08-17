import { decideClientEstimate } from "@/lib/portal/actions";
import { toClientEstimatePayload } from "@/lib/confidentiality";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function ClientEstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireClientUser();
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("estimates")
    .select("id, reference_number, work_order_id, status, client_sell_amount, client_visible_scope, client_comment, created_at, work_orders!inner(client_organization_id)")
    .eq("id", id)
    .eq("work_orders.client_organization_id", ctx.membership.organizationId)
    .maybeSingle();
  if (!data) notFound();
  const estimate = toClientEstimatePayload(data);
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{estimate.referenceNumber}</h1>
      <p className="text-lg">Amount: {estimate.amount ?? "Pending"}</p>
      <p className="text-sm leading-6">{estimate.scope}</p>
      {estimate.status === "sent_to_client" ? (
        <form action={async (formData) => {
          "use server";
          const decision = String(formData.get("decision")) as "approved" | "declined";
          await decideClientEstimate(id, decision, String(formData.get("comment") ?? ""));
        }} className="grid max-w-xl gap-3 border border-line bg-white p-4">
          <textarea name="comment" className="input-field" rows={3} placeholder="Comment (optional)" />
          <div className="flex gap-3">
            <button name="decision" value="approved" className="h-12 flex-1 bg-brand text-sm font-semibold text-white">Approve</button>
            <button name="decision" value="declined" className="h-12 flex-1 border border-ink text-sm font-semibold">Decline</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
