import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

export { getSupabaseAdmin as supabaseAdmin };
