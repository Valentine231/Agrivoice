import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  try {
    const result = await verifyTransaction(reference);

    // Mark the order in_escrow. Uses the admin client because a buyer's own
    // session isn't allowed to write to orders directly (see the RLS
    // policies in supabase/migrations/0001_init.sql) — this route already
    // proved the payment is real via Paystack before writing anything.
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ status: "in_escrow", paid_at: result.paidAt })
      .eq("paystack_reference", reference);

    return NextResponse.json({ status: "in_escrow", ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 402 });
  }
}
