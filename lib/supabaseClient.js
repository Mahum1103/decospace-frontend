import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic guard so we don't crash on build if envs are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
