import type { Database } from "@repo/database-types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AppSupabaseClient = SupabaseClient<Database>;

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export function createSupabaseMobileClient(
  url: string,
  anonKey: string,
  storage: StorageAdapter,
): AppSupabaseClient {
  if (!url) throw new Error("SUPABASE_URL is required");
  if (!anonKey) throw new Error("SUPABASE_ANON_KEY is required");
  return createClient<Database>(url, anonKey, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseBrowserClient(url: string, anonKey: string): AppSupabaseClient {
  if (!url) throw new Error("SUPABASE_URL is required");
  if (!anonKey) throw new Error("SUPABASE_ANON_KEY is required");
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
