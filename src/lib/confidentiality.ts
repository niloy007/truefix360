export type VendorWorkOrderPayload = {
  id: string;
  referenceNumber: string;
  serviceCategory: string;
  title: string;
  priority: string;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  vendorVisibleNotes: string | null;
  accessInstructions: string | null;
  residentContactName: string | null;
  residentContactPhone: string | null;
  property: {
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    zip: string;
    propertyType: string | null;
    occupancyStatus: string | null;
  } | null;
  mapsUrl: string | null;
};

export type ClientEstimatePayload = {
  id: string;
  referenceNumber: string;
  workOrderId: string;
  status: string;
  amount: number | null;
  scope: string | null;
  comment: string | null;
  createdAt: string;
};

export type VendorEstimatePayload = {
  id: string;
  referenceNumber: string;
  workOrderId: string;
  status: string;
  amount: number | null;
  description: string | null;
  laborMaterialExplanation: string | null;
  createdAt: string;
};

const FINANCIAL_KEYS = [
  "client_nte",
  "clientNte",
  "internal_notes",
  "internalNotes",
  "client_sell_amount",
  "clientSellAmount",
  "internal_adjusted_amount",
  "internalAdjustedAmount",
  "amount",
] as const;

export function omitKeys<T extends Record<string, unknown>>(
  record: T,
  keys: readonly string[],
): Partial<T> {
  const copy: Record<string, unknown> = { ...record };
  for (const key of keys) {
    delete copy[key];
  }
  return copy as Partial<T>;
}

export function assertNoConfidentialVendorFields(payload: object): void {
  const json = JSON.stringify(payload);
  const forbidden = [
    "client_nte",
    "clientNte",
    "client_sell_amount",
    "clientSellAmount",
    "internal_adjusted_amount",
    "internalAdjustedAmount",
    "internal_notes",
    "internalNotes",
  ];
  for (const key of forbidden) {
    if (json.includes(`"${key}"`)) {
      throw new Error(`Vendor payload leaked confidential field: ${key}`);
    }
  }
}

export function assertNoVendorCostOnClientEstimate(payload: object): void {
  const record = payload as Record<string, unknown>;
  if ("vendorAmount" in record || "vendor_cost" in record) {
    throw new Error("Client estimate payload leaked vendor cost.");
  }
  if ("amount" in record && "clientSellAmount" in record) {
    throw new Error("Client estimate payload should expose only the client-facing amount.");
  }
}

export function toVendorWorkOrderPayload(input: {
  id: string;
  reference_number: string;
  service_category: string;
  title: string;
  priority: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  vendor_visible_notes: string | null;
  access_instructions: string | null;
  resident_contact_name: string | null;
  resident_contact_phone: string | null;
  properties?: {
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    zip: string;
    property_type: string | null;
    occupancy_status: string | null;
  } | null;
}): VendorWorkOrderPayload {
  const property = input.properties
    ? {
        address1: input.properties.address1,
        address2: input.properties.address2,
        city: input.properties.city,
        state: input.properties.state,
        zip: input.properties.zip,
        propertyType: input.properties.property_type,
        occupancyStatus: input.properties.occupancy_status,
      }
    : null;

  const mapsUrl = property
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${property.address1}, ${property.city}, ${property.state} ${property.zip}`,
      )}`
    : null;

  const payload: VendorWorkOrderPayload = {
    id: input.id,
    referenceNumber: input.reference_number,
    serviceCategory: input.service_category,
    title: input.title,
    priority: input.priority,
    status: input.status,
    scheduledStart: input.scheduled_start,
    scheduledEnd: input.scheduled_end,
    vendorVisibleNotes: input.vendor_visible_notes,
    accessInstructions: input.access_instructions,
    residentContactName: input.resident_contact_name,
    residentContactPhone: input.resident_contact_phone,
    property,
    mapsUrl,
  };

  assertNoConfidentialVendorFields(payload);
  return payload;
}

export function toClientEstimatePayload(input: {
  id: string;
  reference_number: string;
  work_order_id: string;
  status: string;
  client_sell_amount: number | string | null;
  client_visible_scope: string | null;
  client_comment: string | null;
  created_at: string;
}): ClientEstimatePayload {
  const payload: ClientEstimatePayload = {
    id: input.id,
    referenceNumber: input.reference_number,
    workOrderId: input.work_order_id,
    status: input.status,
    amount:
      input.client_sell_amount === null || input.client_sell_amount === undefined
        ? null
        : Number(input.client_sell_amount),
    scope: input.client_visible_scope,
    comment: input.client_comment,
    createdAt: input.created_at,
  };
  assertNoVendorCostOnClientEstimate(payload);
  return payload;
}

export function toVendorEstimatePayload(input: {
  id: string;
  reference_number: string;
  work_order_id: string;
  status: string;
  amount: number | string | null;
  description: string | null;
  labor_material_explanation: string | null;
  created_at: string;
}): VendorEstimatePayload {
  const payload: VendorEstimatePayload = {
    id: input.id,
    referenceNumber: input.reference_number,
    workOrderId: input.work_order_id,
    status: input.status,
    amount: input.amount === null || input.amount === undefined ? null : Number(input.amount),
    description: input.description,
    laborMaterialExplanation: input.labor_material_explanation,
    createdAt: input.created_at,
  };
  assertNoConfidentialVendorFields(payload);
  return payload;
}

export function stripVendorProfileForVendor<T extends Record<string, unknown>>(
  profile: T,
): Omit<T, "internal_notes" | "internalNotes"> {
  return omitKeys(profile, ["internal_notes", "internalNotes"]) as Omit<
    T,
    "internal_notes" | "internalNotes"
  >;
}

export { FINANCIAL_KEYS };
