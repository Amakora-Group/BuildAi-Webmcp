import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isConfigValid, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!isConfigValid()) {
    throw new Error("Supabase is not configured");
  }

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return client;
}
