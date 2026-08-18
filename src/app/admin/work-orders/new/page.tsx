import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { createWorkOrder } from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { services } from "@/data/services";

export default async function NewWorkOrderPage() {
  const admin = createAdminClient();
  const [{ data: clients }, { data: properties }] = await Promise.all([
    admin.from("organizations").select("id, name").eq("type", "client").eq("status", "active").order("name"),
    admin.from("properties").select("id, address1, city, state, client_organization_id").eq("active", true).order("address1"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New work order"
        description="Create a work order from an existing client and property. This does not generate sample records."
        actions={
          <Link href="/admin/work-orders" className="inline-flex h-11 items-center border border-line px-4 text-sm font-semibold">
            Back to work orders
          </Link>
        }
      />
      <form action={createWorkOrder} className="grid max-w-3xl gap-4 border border-line bg-white p-5">
        <label className="text-sm font-medium">
          Client
          <select name="clientOrganizationId" className="input-field mt-1" required>
            <option value="">Select client</option>
            {(clients ?? []).map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Property
          <select name="propertyId" className="input-field mt-1">
            <option value="">Select property</option>
            {(properties ?? []).map((property) => (
              <option key={property.id} value={property.id}>
                {property.address1}, {property.city} {property.state}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Title
          <input name="title" className="input-field mt-1" required />
        </label>
        <label className="text-sm font-medium">
          Service category
          <select name="serviceCategory" className="input-field mt-1" required>
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Priority
          <select name="priority" className="input-field mt-1" defaultValue="routine">
            <option value="routine">Routine</option>
            <option value="priority">Priority</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Scope
          <textarea name="scope" className="input-field mt-1" rows={5} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Scheduled start
            <input name="scheduledStart" type="datetime-local" className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium">
            Scheduled end
            <input name="scheduledEnd" type="datetime-local" className="input-field mt-1" />
          </label>
        </div>
        <button type="submit" className="h-11 bg-brand text-sm font-semibold text-white">
          Create work order
        </button>
      </form>
    </div>
  );
}
