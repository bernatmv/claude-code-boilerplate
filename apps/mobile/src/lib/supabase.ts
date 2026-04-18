import Constants from "expo-constants";

import { createSupabaseMobileClient } from "@repo/api-client";

import { secureStoreAdapter } from "./secure-store-adapter";

const extra = Constants.expoConfig?.extra as
  | { supabaseUrl?: string; supabaseAnonKey?: string }
  | undefined;

const url = extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey =
  extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabase = createSupabaseMobileClient(url, anonKey, secureStoreAdapter);
