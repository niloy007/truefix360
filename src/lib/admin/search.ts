"use server";

import { requireInternalStaff } from "@/lib/auth/guards";
import { searchAdminRecords, type AdminSearchHit } from "@/lib/admin/queries";

export async function searchAdminAction(query: string): Promise<AdminSearchHit[]> {
  await requireInternalStaff();
  return searchAdminRecords(query);
}
