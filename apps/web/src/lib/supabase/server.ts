import { createServerClient as createSsrServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@repo/database-types";

import { env } from "@/env";

export async function createServerClient() {
  const cookieStore = await cookies();
  return createSsrServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — Next forbids writes here.
            // The middleware refresh path handles cookie writes.
          }
        },
      },
    },
  );
}
