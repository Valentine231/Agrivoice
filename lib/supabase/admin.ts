import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * SERVER-ONLY. This key bypasses every Row Level Security policy — never
 * import this file into a "use client" component, and never send this key
 * to the browser. It exists for the small number of operations that must
 * cross ownership boundaries by design:
 *
 *   - Marking an order in_escrow after a Paystack webhook confirms payment
 *     (the buyer's own session shouldn't be able to write that directly).
 *   - Releasing funds / marking an order completed after delivery is
 *     confirmed (same reasoning).
 *
 * Every function that uses this client MUST check ownership/authorization
 * in application code first, since RLS won't do it for you here.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
