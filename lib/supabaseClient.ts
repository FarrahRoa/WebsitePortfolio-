import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../backend/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("example"));
}

export function createClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
