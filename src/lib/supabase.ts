import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Graceful fallback for development without credentials
const isDemoMode = !supabaseUrl || supabaseUrl === "your_supabase_project_url";

export { isDemoMode };

export const supabase = (isDemoMode
  ? null
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })) as unknown as import("@supabase/supabase-js").SupabaseClient<Database>;

// Helper: get current user id or throw
export async function requireUserId(): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}
