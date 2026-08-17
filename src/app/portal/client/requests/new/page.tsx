import { createClientServiceRequest } from "@/lib/portal/actions";
import { requireClientUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { quoteCategories } from "@/lib/form-schemas";

export default async function NewClientRequestPage() {
  const ctx = await requireClientUser();
  const admin = createAdminClient();
  const { data: properties } = await admin
    .from("properties")
    .select("id, address1, city, state")
    .eq("client_organization_id", ctx.membership.organizationId)
    .eq("active", true);

  return (
    <form action={createClientServiceRequest} className="grid max-w-2xl gap-4">
      <h1 className="font-heading text-3xl font-semibold">New Service Request</h1>
      <label className="text-sm">Property
        <select name="propertyId" required className="input-field mt-1">
          <option value="">Select property</option>
          {(properties ?? []).map((property) => (
            <option key={property.id} value={property.id}>
              {property.address1}, {property.city}, {property.state}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">Service category
        <select name="serviceCategory" required className="input-field mt-1">
          {quoteCategories.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">Issue
        <input name="issue" required className="input-field mt-1" />
      </label>
      <label className="text-sm">Description
        <textarea name="description" required rows={5} className="input-field mt-1" />
      </label>
      <label className="text-sm">Priority
        <select name="priority" className="input-field mt-1">
          <option value="routine">Routine</option>
          <option value="priority">Priority</option>
          <option value="emergency">Emergency</option>
        </select>
      </label>
      <label className="text-sm">Preferred scheduling
        <input name="preferredSchedule" className="input-field mt-1" />
      </label>
      <label className="text-sm">Your reference / work order number
        <input name="clientReference" className="input-field mt-1" />
      </label>
      <label className="text-sm">Budget / NTE (confidential)
        <input name="clientNte" type="number" step="0.01" className="input-field mt-1" />
      </label>
      <label className="text-sm">Photos or documents
        <input name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-1" />
      </label>
      <button type="submit" className="h-12 bg-brand text-sm font-semibold text-white">Submit request</button>
    </form>
  );
}
