import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let targetUrl = next;
      if (targetUrl === "/") {
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role;
        if (role === "farmer") targetUrl = "/farmer/dashboard";
        else if (role === "buyer") targetUrl = "/buyer/marketplace";
      }
      return NextResponse.redirect(`${origin}${targetUrl}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
