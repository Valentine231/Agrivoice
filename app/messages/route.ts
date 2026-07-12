import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/messages", request.url));
  }
  
  const role = user.user_metadata?.role;
  const target = role === "farmer" ? "/farmer/messages" : "/buyer/messages";
  
  return NextResponse.redirect(new URL(target, request.url));
}
