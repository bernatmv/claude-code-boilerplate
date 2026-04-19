"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { Database } from "@repo/database-types";

import { createServerClient } from "@/lib/supabase/server";
import { env } from "@/env";

export async function sendTestPush(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not authenticated" };

  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-push`;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY not configured" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      user_id: user.id,
      title: "Test push",
      body: "Hello from the boilerplate!",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: `Edge function ${res.status}: ${text}` };
  }
  const json = (await res.json()) as { sent: number };
  return { ok: true, message: `Sent ${json.sent} notification(s).` };
}

export type ExportResult =
  | { ok: true; filename: string; json: string }
  | { ok: false; message: string };

export async function exportUserData(): Promise<ExportResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not authenticated" };

  const [profile, items] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("items").select("*").eq("user_id", user.id),
  ]);
  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: profile.data,
    items: items.data ?? [],
  };
  return {
    ok: true,
    filename: `export-${user.id}-${Date.now()}.json`,
    json: JSON.stringify(payload, null, 2),
  };
}

export async function deleteAccount(): Promise<{ ok: false; message: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not authenticated" };

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey)
    return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY not configured on the server." };

  const admin = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, message: error.message };

  await supabase.auth.signOut();
  redirect("/");
}
