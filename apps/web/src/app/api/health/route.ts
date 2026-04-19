import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@repo/database-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult = { ok: boolean; skipped?: true; durationMs?: number; error?: string };

async function pingSupabase(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: true, skipped: true };
  const client = createClient<Database>(url, anon, { auth: { persistSession: false } });
  const started = Date.now();
  try {
    const { error } = await client.from("profiles").select("id", { count: "exact", head: true });
    const durationMs = Date.now() - started;
    if (error) return { ok: false, durationMs, error: error.message };
    return { ok: true, durationMs };
  } catch (e) {
    return { ok: false, durationMs: Date.now() - started, error: (e as Error).message };
  }
}

export async function GET() {
  const supabase = await pingSupabase();
  const ok = supabase.ok;
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      checks: { supabase },
    },
    { status: ok ? 200 : 503 },
  );
}
