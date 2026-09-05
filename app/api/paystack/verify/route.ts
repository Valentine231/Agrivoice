import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  try {
    const result = await verifyTransaction(reference);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You need to be signed in to confirm this payment." }, { status: 401 });
    }

    const updatePayload = { status: "in_escrow" as const, paid_at: result.paidAt };

    // Scoped to buyer_id as well as paystack_reference — this is the
    // ownership check version 2 added: only the buyer who placed this
    // specific order can move it into escrow, even if someone else
    // somehow got hold of the reference string.
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("paystack_reference", reference)
      .eq("buyer_id", user.id)
      .select("id");

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Same check as before, kept from the working version: a zero-row
    // match is silent, not an error, so we still have to look for it
    // ourselves. This covers both "reference doesn't exist" and "this
    // reference exists but belongs to a different buyer" in one check.
    if (!updated || updated.length === 0) {
      // Fall back to the admin client once, for the one legitimate case
      // this can happen without foul play: the order row was created
      // correctly and does belong to this user, but RLS blocked the
      // authenticated update for some other reason (e.g. a policy gap).
      // If it *still* matches nothing here, the reference genuinely
      // doesn't belong to this buyer's account and we report that.
      const adminSupabase = createAdminClient();
      const { data: adminUpdated, error: adminUpdateError } = await adminSupabase
        .from("orders")
        .update(updatePayload)
        .eq("paystack_reference", reference)
        .eq("buyer_id", user.id)
        .select("id");

      if (adminUpdateError) {
        throw new Error(adminUpdateError.message);
      }

      if (!adminUpdated || adminUpdated.length === 0) {
        throw new Error(
          `No order found for this account with paystack_reference = "${reference}". Either the reference doesn't match anything in the orders table, or it belongs to a different buyer.`
        );
      }
    }

    return NextResponse.json({ status: "in_escrow", ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 402 });
  }
}
