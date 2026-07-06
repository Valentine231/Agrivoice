import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

// Paystack signs every webhook body with your secret key so you can trust it
// really came from Paystack. Always verify this before acting on an event —
// treat unverified webhook calls the way you'd treat an unsigned cheque.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expected = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminClient();

  switch (event.event) {
    case "charge.success": {
      const reference = event.data.reference;
      await supabase
        .from("orders")
        .update({ status: "in_escrow", paid_at: event.data.paid_at })
        .eq("paystack_reference", reference);
      break;
    }
    case "transfer.success": {
      // Fires once a held payment is released to a farmer's bank account —
      // the order should already be "completed" from confirmDeliveryAction,
      // this is just belt-and-braces confirmation for your own records.
      break;
    }
    case "transfer.failed":
    case "transfer.reversed": {
      // TODO: alert an admin — a farmer payout didn't go through, and the
      // order may need to be flagged for manual follow-up.
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
