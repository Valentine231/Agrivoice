export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * How long a signed-in session lasts before someone has to log in again.
 * Without an explicit value, session cookie lifetime is inconsistent across
 * browsers (some clear it as soon as the tab closes), which makes farmers
 * and buyers re-login far more often than they should have to. 5 days is a
 * reasonable middle ground — long enough that people aren't nagged
 * constantly, short enough that a lost/shared device isn't signed in
 * for too long. Adjust to taste.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 days
