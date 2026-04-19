import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LogRow = {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  ip: string | null;
  created_at: string;
};

export default async function AdminLogsPage() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, user_id, action, resource, ip, created_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<LogRow[]>();

  const rows = data ?? [];
  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">Audit log</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-600">No entries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Resource</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 text-neutral-600">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono">{r.action}</td>
                  <td className="px-3 py-2 font-mono text-xs text-neutral-600">
                    {r.user_id ?? "—"}
                  </td>
                  <td className="px-3 py-2">{r.resource ?? "—"}</td>
                  <td className="px-3 py-2 text-neutral-600">{r.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
