import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { SESSION_COOKIE_MAX_AGE_SECONDS } from "@/lib/supabase/isConfigured";

/**
 * Uses the public anon key — safe to expose in the browser. Row Level
 * Security policies (see supabase/migrations/0001_init.sql) are what
 * actually keep data safe, not this key being secret.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { maxAge: SESSION_COOKIE_MAX_AGE_SECONDS } }
  );
}
