import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { SESSION_COOKIE_MAX_AGE_SECONDS } from "@/lib/supabase/isConfigured";

/**
 * Reads the signed-in user's session from cookies. Still respects Row Level
 * Security — this is "server-side, but as the logged-in user", not an
 * admin bypass. Use lib/supabase/admin.ts when you need to bypass RLS
 * (e.g. releasing escrow funds after checking ownership yourself).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { maxAge: SESSION_COOKIE_MAX_AGE_SECONDS },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component that can't set cookies (e.g. a
            // page render, not a Server Action/Route Handler) — safe to
            // ignore as long as middleware.ts is refreshing sessions.
          }
        },
      },
    }
  );
}
