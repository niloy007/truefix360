import Link from "next/link";
import { AdminTable, EmptyState, FilterBar, AdminInput, AdminSelect, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; topic?: string; q?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const statuses = ["new", "reviewing", "responded", "closed"] as const;
  const counts = Object.fromEntries(
    await Promise.all(
      statuses.map(async (status) => {
        const { count } = await admin.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", status);
        return [status, count ?? 0];
      }),
    ),
  ) as Record<string, number>;

  let query = admin
    .from("contact_submissions")
    .select("id, reference_number, first_name, last_name, company, topic, email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status);
  if (params.topic) query = query.eq("topic", params.topic);
  if (params.q) query = query.or(`email.ilike.%${params.q}%,reference_number.ilike.%${params.q}%,first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%`);
  const { data } = await query;

  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Treat this as the public inquiry inbox. Public Contact form submissions appear here." />
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Link key={status} href={`/admin/contacts?status=${status}`} className="border border-line bg-white px-3 py-2 text-sm">
            {status} <strong>{counts[status]}</strong>
          </Link>
        ))}
      </div>
      <FilterBar>
        <AdminInput name="q" defaultValue={params.q} placeholder="Search name, email, or reference" />
        <AdminSelect name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </AdminSelect>
        <button className="h-10 bg-ink px-4 text-sm font-semibold text-white" type="submit">Filter</button>
      </FilterBar>
      {(data ?? []).length === 0 ? (
        <EmptyState title="No contact submissions yet" body="Public Contact form messages will appear here." action={<Link href="/contact" className="text-sm font-semibold text-brand">View Contact page</Link>} />
      ) : (
        <AdminTable headers={["Reference", "Name", "Company", "Topic", "Email", "Received", "Status"]}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2"><Link href={`/admin/contacts/${row.id}`} className="font-semibold hover:text-brand">{row.reference_number}</Link></td>
              <td className="px-3 py-2">{row.first_name} {row.last_name}</td>
              <td className="px-3 py-2">{row.company || "—"}</td>
              <td className="px-3 py-2">{row.topic}</td>
              <td className="px-3 py-2">{row.email}</td>
              <td className="px-3 py-2 text-muted">{formatDateTime(row.created_at)}</td>
              <td className="px-3 py-2"><StatusBadge value={row.status} /></td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
