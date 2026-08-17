import { DetailList } from "@/components/app/RecordList";
import { inviteUserAction } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("organizations").select("*").eq("id", id).eq("type", "client").maybeSingle();
  if (!data) notFound();
  const { data: account } = await admin.from("client_accounts").select("*").eq("organization_id", id).maybeSingle();
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">{data.name}</h1>
      <DetailList rows={[["Status", data.status], ["Billing email", account?.billing_email], ["Internal notes", account?.internal_notes]]} />
      <form action={inviteUserAction} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Invite client user</h2>
        <input type="hidden" name="organizationId" value={id} />
        <input type="hidden" name="role" value="client" />
        <input name="firstName" className="input-field" placeholder="First name" />
        <input name="lastName" className="input-field" placeholder="Last name" />
        <input name="email" type="email" required className="input-field" placeholder="Email" />
        <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">Send invitation</button>
      </form>
    </div>
  );
}
