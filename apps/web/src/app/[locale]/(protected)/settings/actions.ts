"use server";

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
