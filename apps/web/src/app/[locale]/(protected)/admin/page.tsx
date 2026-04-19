import { createClient } from "@supabase/supabase-js";
import type { Database } from "@repo/database-types";

export default async function AdminPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let userCount = 0;
  let subCount = 0;
  let configured = false;

  if (url && serviceKey) {
    configured = true;
    const admin = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });
    const [{ count: u }, { count: s }] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("subscriptions").select("id", { count: "exact", head: true }),
    ]);
    userCount = u ?? 0;
    subCount = s ?? 0;
  }

  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">Admin</h1>
      {!configured ? (
        <p className="text-sm text-neutral-600">
          Set <code>SUPABASE_SERVICE_ROLE_KEY</code> to surface counts.
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-md border p-4">
            <dt className="text-sm text-neutral-600">Users</dt>
            <dd className="text-2xl font-semibold">{userCount}</dd>
          </div>
          <div className="rounded-md border p-4">
            <dt className="text-sm text-neutral-600">Subscriptions</dt>
            <dd className="text-2xl font-semibold">{subCount}</dd>
          </div>
        </dl>
      )}
    </>
  );
}
