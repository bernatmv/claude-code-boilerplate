import type { AppSupabaseClient } from "@repo/api-client";
import type { Database } from "@repo/database-types";
import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";

import { env } from "@/env";

export function createBrowserClient(): AppSupabaseClient {
  return createSsrBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ) as unknown as AppSupabaseClient;
}
