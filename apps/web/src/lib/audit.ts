import { createClient } from "@supabase/supabase-js";
import type { Database } from "@repo/database-types";

export type AuditEntry = {
  action: string;
  userId?: string | null;
  resource?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;

  const admin = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });
  await admin.from("audit_logs").insert({
    user_id: entry.userId ?? null,
    action: entry.action,
    resource: entry.resource ?? null,
    metadata: entry.metadata ?? {},
    ip: entry.ip ?? null,
    user_agent: entry.userAgent ?? null,
  });
}
