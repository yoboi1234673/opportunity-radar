import { createClient } from "@supabase/supabase-js";

// Replit secrets may be stored in swapped variables.
// Detect the URL by checking which value looks like an HTTP URL.
const val1 = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const val2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabaseUrl = val1.startsWith("http") ? val1 : val2;
const supabaseAnonKey = val1.startsWith("http") ? val2 : val1;

let _client: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export const supabase = {
  get auth() { return getSupabase().auth; },
  get from() { return getSupabase().from.bind(getSupabase()); },
  get storage() { return getSupabase().storage; },
  get channel() { return getSupabase().channel.bind(getSupabase()); },
};
