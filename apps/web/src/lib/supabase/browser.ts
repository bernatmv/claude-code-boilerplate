import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";
import type { Database } from "@repo/database-types";

import { env } from "@/env";

export function createBrowserClient() {
  return createSsrBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
