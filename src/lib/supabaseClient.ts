import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase credentials: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
