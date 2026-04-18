// Supabase Edge Function: send-push
// Sends a push notification to all tokens for a given user via the Expo push API.
// Invoke with the service role (server-side) or as a signed-in user targeting self.
//
// Request body: { user_id: string; title: string; body: string; data?: Record<string, unknown> }
//
// Deno runtime (supabase edge functions).

// deno-lint-ignore-file no-explicit-any
// @ts-expect-error: remote import resolved by Deno
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-expect-error: remote import resolved by Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.3";

declare const Deno: { env: { get(key: string): string | undefined } };

interface PushRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", { status: 500 });
  }

  let payload: PushRequest;
  try {
    payload = (await req.json()) as PushRequest;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!payload.user_id || !payload.title || !payload.body) {
    return new Response("user_id, title, body required", { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: tokens, error: tokensErr } = await admin
    .from("push_tokens")
    .select("expo_token")
    .eq("user_id", payload.user_id);
  if (tokensErr) {
    return new Response(`Failed to load tokens: ${tokensErr.message}`, { status: 500 });
  }
  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0, tickets: [] }), {
      headers: { "content-type": "application/json" },
    });
  }

  const messages = tokens.map((t: { expo_token: string }) => ({
    to: t.expo_token,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    sound: "default",
  }));

  const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(messages),
  });
  const expoJson = (await expoRes.json()) as { data?: ExpoTicket[]; errors?: unknown };
  const tickets: ExpoTicket[] = expoJson.data ?? [];

  const logRows = tickets.map((ticket, i) => ({
    user_id: payload.user_id,
    expo_token: messages[i].to,
    status: ticket.status,
    message_id: ticket.id ?? null,
    error: ticket.status === "error" ? (ticket.message ?? null) : null,
  }));
  if (logRows.length > 0) {
    await admin.from("push_logs").insert(logRows);
  }

  return new Response(JSON.stringify({ sent: tickets.length, tickets }), {
    headers: { "content-type": "application/json" },
  });
});
