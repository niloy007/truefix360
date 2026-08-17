/**
 * Development-only seed. Never runs in production.
 *
 *   npx tsx scripts/seed-dev.ts --confirm
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production.");
  }
  if (!process.argv.includes("--confirm")) {
    throw new Error("Pass --confirm to seed development data.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  await admin.from("organizations").upsert({
    id: "a0000000-0000-4000-8000-000000000001",
    name: "TrueFix360",
    type: "internal",
    status: "active",
  });
  console.log("Internal organization ensured. Invite the first admin in /admin/users after creating the Auth user.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed.");
  process.exit(1);
});
