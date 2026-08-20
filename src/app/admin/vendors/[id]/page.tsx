import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailList } from "@/components/app/RecordList";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { inviteUserAction } from "@/lib/admin/actions";
import { humanizeAuditAction, humanizeKey } from "@/lib/admin/status";
import { formatDate, formatDateTime } from "@/lib/format";
import { setVendorStatusAction } from "@/lib/vendors/actions";
import { STORAGE_BUCKETS } from "@/config/platform";
import { createSignedUrl } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminVendorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string; approved?: string }>;
}) {
  const { id } = await params;
  const flash = await searchParams;
  const admin = createAdminClient();
  const { data } = await admin.from("organizations").select("*").eq("id", id).eq("type", "vendor").maybeSingle();
  if (!data) notFound();

  const [{ data: profile }, { data: coverage }, { data: docs }, { data: assignments }, { data: audits }] =
    await Promise.all([
      admin.from("vendor_profiles").select("*").eq("organization_id", id).maybeSingle(),
      admin
        .from("vendor_coverage")
        .select("id, state_code, county_name, service_category, status, verification_status, travel_radius_miles")
        .eq("vendor_organization_id", id)
        .order("state_code"),
      admin.from("vendor_documents").select("*").eq("vendor_organization_id", id),
      admin
        .from("work_order_assignments")
        .select("id, status, created_at, updated_at, work_orders(id, reference_number, title, status, updated_at)")
        .eq("vendor_organization_id", id)
        .order("updated_at", { ascending: false })
        .limit(20),
      admin
        .from("audit_logs")
        .select("id, action, actor_user_id, created_at, metadata")
        .or(`entity_id.eq.${id},and(entity_type.eq.organizations,entity_id.eq.${id})`)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

  const actorIds = [...new Set((audits ?? []).map((a) => a.actor_user_id).filter(Boolean))] as string[];
  const { data: actors } = actorIds.length
    ? await admin.from("profiles").select("id, display_name, first_name, last_name").in("id", actorIds)
    : { data: [] };

  const signed = await Promise.all(
    (docs ?? []).map(async (doc) => ({
      ...doc,
      url: await createSignedUrl(STORAGE_BUCKETS.vendorDocuments, doc.storage_path, 300),
    })),
  );

  const openCount = (assignments ?? []).filter((a) => ["offered", "accepted"].includes(a.status)).length;
  const completedCount = (assignments ?? []).filter((a) => a.status === "completed").length;
  const lastJob = assignments?.[0]?.updated_at ?? null;

  const flashMessage = flash.created
    ? "Vendor created successfully."
    : flash.updated
      ? "Vendor updated successfully."
      : flash.approved
        ? "Network submission approved and vendor created."
        : null;

  return (
    <div className="space-y-6">
      {flashMessage ? (
        <p role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {flashMessage}
        </p>
      ) : null}

      <PageHeader
        title={data.name}
        description={[profile?.city, profile?.state].filter(Boolean).join(", ") || "Vendor profile"}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/vendors/${id}/edit`}
              className="inline-flex h-11 items-center bg-brand px-4 text-sm font-semibold text-white"
            >
              Edit Vendor
            </Link>
            <Link
              href={`/admin/dispatch?vendor=${id}`}
              className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold"
            >
              Assign Work
            </Link>
            {profile?.primary_phone ? (
              <a
                href={`tel:${profile.primary_phone}`}
                className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold"
              >
                Call
              </a>
            ) : null}
            {profile?.primary_email ? (
              <a
                href={`mailto:${profile.primary_email}`}
                className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold"
              >
                Email
              </a>
            ) : null}
            <form action={setVendorStatusAction.bind(null, id, "inactive")}>
              <button type="submit" className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold">
                Disable
              </button>
            </form>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge value={profile?.vendor_status ?? data.status} />
        {profile?.preferred ? <StatusBadge value="preferred" /> : null}
        {profile?.shared_network_visible ? <StatusBadge value="shared" label="Shared" /> : null}
        {profile?.source ? <StatusBadge value={profile.source} label={humanizeKey(profile.source)} /> : null}
      </div>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Overview</h2>
        <DetailList
          rows={[
            ["Company", data.name],
            ["Legal name", profile?.legal_name],
            ["Contact", profile?.primary_contact_name],
            ["Phone", profile?.primary_phone],
            ["Alternate phone", profile?.alternate_phone],
            ["Email", profile?.primary_email],
            ["Website", profile?.website],
            ["Address", [profile?.address, profile?.city, profile?.state, profile?.zip].filter(Boolean).join(", ")],
            ["Services", (profile?.service_categories ?? []).join(" · ")],
            ["Status", humanizeKey(profile?.vendor_status)],
            ["Public notes", profile?.public_notes],
          ]}
        />
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Coverage</h2>
        <DetailList
          rows={[
            ["States", (profile?.coverage_states ?? []).join(", ")],
            ["Counties", (profile?.coverage_counties ?? []).join(", ")],
            ["Cities", (profile?.coverage_cities ?? []).join(", ")],
            ["ZIPs", (profile?.coverage_zips ?? []).join(", ")],
            ["Radius (miles)", profile?.service_radius_miles],
            ["Home ZIP", profile?.home_zip],
            ["Trip fee", profile?.trip_fee_enabled ? (profile.trip_fee_notes || `$${profile.trip_fee_amount ?? 0}`) : "No"],
            ["Summary", profile?.coverage],
          ]}
        />
        <p className="mt-4 text-sm text-muted">Verified county coverage records:</p>
        <ul className="mt-2 divide-y divide-line border border-line text-sm">
          {(coverage ?? []).length === 0 ? (
            <li className="px-4 py-3 text-muted">No coverage records yet.</li>
          ) : (
            (coverage ?? []).map((row) => (
              <li key={row.id} className="px-4 py-3">
                {row.county_name}, {row.state_code} · {row.service_category} · {row.status} / {row.verification_status}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Availability</h2>
        <DetailList
          rows={[
            ["Standard", profile?.standard_availability],
            ["Emergency", profile?.emergency_available ? "Available" : "No"],
            ["After hours", profile?.after_hours_available ? "Available" : "No"],
            ["Weekend", profile?.weekend_available ? "Available" : "No"],
          ]}
        />
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Work History</h2>
        <DetailList
          rows={[
            ["Total assignments (loaded)", (assignments ?? []).length],
            ["Open", openCount],
            ["Completed (in recent list)", completedCount],
            ["Last job", lastJob ? formatDate(lastJob) : "—"],
          ]}
        />
        <ul className="mt-3 divide-y divide-line border border-line text-sm">
          {(assignments ?? []).length === 0 ? (
            <li className="px-4 py-3 text-muted">No assignments yet.</li>
          ) : (
            (assignments ?? []).slice(0, 8).map((row) => {
              const wo = Array.isArray(row.work_orders) ? row.work_orders[0] : row.work_orders;
              return (
                <li key={row.id} className="px-4 py-3">
                  {wo ? (
                    <Link href={`/admin/work-orders/${wo.id}`} className="font-semibold hover:text-brand">
                      {wo.reference_number}
                    </Link>
                  ) : (
                    "Assignment"
                  )}{" "}
                  · {humanizeKey(row.status)} · {formatDate(row.updated_at)}
                  {wo?.title ? <span className="text-muted"> — {wo.title}</span> : null}
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Compliance</h2>
        <DetailList
          rows={[
            ["License", [profile?.license_number, profile?.license_state].filter(Boolean).join(" · ")],
            ["License expiration", profile?.license_expires_on],
            ["Insurance", profile?.insurance_status],
            ["Insurance expiration", profile?.insurance_expires_on],
            ["Workers comp", profile?.workers_comp_status],
            ["W-9 status", profile?.w9_status],
          ]}
        />
        <h3 className="mt-4 font-heading text-base font-semibold">Documents</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {signed.length === 0 ? (
            <li className="text-muted">No documents uploaded.</li>
          ) : (
            signed.map((doc) => (
              <li key={doc.id}>
                {doc.category}:{" "}
                {doc.url ? (
                  <a className="font-semibold text-brand" href={doc.url}>
                    {doc.original_name}
                  </a>
                ) : (
                  doc.original_name
                )}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Internal Notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{profile?.internal_notes || "No internal notes."}</p>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="font-heading text-xl font-semibold">Activity</h2>
        <ul className="mt-3 divide-y divide-line border border-line text-sm">
          {(audits ?? []).length === 0 ? (
            <li className="px-4 py-3 text-muted">No activity recorded yet.</li>
          ) : (
            (audits ?? []).map((row) => {
              const actor = (actors ?? []).find((a) => a.id === row.actor_user_id);
              const actorName =
                actor?.display_name ||
                [actor?.first_name, actor?.last_name].filter(Boolean).join(" ") ||
                "System";
              return (
                <li key={row.id} className="px-4 py-3">
                  <p className="font-semibold">
                    {humanizeAuditAction(row.action, actorName, id)}
                  </p>
                  <p className="text-muted">{formatDateTime(row.created_at)}</p>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <form action={inviteUserAction} className="grid max-w-xl gap-3 border border-line bg-white p-4">
        <h2 className="font-heading text-lg font-semibold">Invite vendor user</h2>
        <input type="hidden" name="organizationId" value={id} />
        <select name="role" className="input-field">
          <option value="vendor_admin">Vendor admin</option>
          <option value="crew">Crew</option>
        </select>
        <input name="firstName" className="input-field" placeholder="First name" />
        <input name="lastName" className="input-field" placeholder="Last name" />
        <input name="email" type="email" required className="input-field" placeholder="Email" />
        <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">
          Send invitation
        </button>
      </form>
    </div>
  );
}
