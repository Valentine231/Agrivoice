import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SESSION_COOKIE_MAX_AGE_SECONDS } from "@/lib/supabase/isConfigured";

/**
 * Supabase auth tokens expire and need refreshing. Doing that refresh in
 * middleware (rather than only in Server Components) is what keeps a
 * user's session alive across page navigations without random logouts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Runs on every request — if Supabase isn't configured yet, skip straight
  // through instead of throwing, so the rest of the site (landing page,
  // sample listings, etc.) still works before .env.local is set up.
  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { maxAge: SESSION_COOKIE_MAX_AGE_SECONDS },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  let isRedirecting = false;
  let redirectUrl = request.nextUrl.clone();

  // Route protection rules
  const isFarmerRoute = path.startsWith("/farmer");
  const isBuyerOrderRoute = path.startsWith("/buyer/order");

  if (isFarmerRoute || isBuyerOrderRoute) {
    if (!user) {
      isRedirecting = true;
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", path);
    } else {
      const role = user.user_metadata?.role;
      if (isFarmerRoute && role !== "farmer") {
        isRedirecting = true;
        redirectUrl.pathname = role === "buyer" ? "/buyer/marketplace" : "/";
      } else if (isBuyerOrderRoute && role !== "buyer") {
        isRedirecting = true;
        redirectUrl.pathname = role === "farmer" ? "/farmer/dashboard" : "/";
      }
    }
  }

  if (isRedirecting) {
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy cookies that were just refreshed by Supabase
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return response;
}
