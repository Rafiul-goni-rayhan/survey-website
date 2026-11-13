import { createClient } from "@supabase/supabase-js";

let supabaseClient;

// Only public/publishable credentials belong here. Never use service_role key.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publicKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart npm run dev."
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, publicKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }

  return supabaseClient;
}
