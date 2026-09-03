import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../backend/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("example"));
}

export async function createServerSupabaseClient(): Promise<any | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Ignore when cookie writes are unavailable in this server context.
        }
      },
    },
  });
}
