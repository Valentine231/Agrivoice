import { NextRequest, NextResponse } from "next/server";
import { releaseTransfer } from "@/lib/paystack";

/**
 * Kept for flexibility, but app/buyer/order/[id]/actions.ts's
 * confirmDeliveryAction is the primary path — it checks the buyer actually
 * owns the order, then calls this same releaseTransfer() helper and updates
 * Supabase in one server-side step.
 */
export async function POST(req: NextRequest) {
  const { orderId, amountNaira, farmerRecipientCode, reason } = await req.json();

  if (!orderId || !amountNaira || !farmerRecipientCode) {
    return NextResponse.json(
      { error: "orderId, amountNaira and farmerRecipientCode are required" },
      { status: 400 }
    );
  }

  try {
    const data = await releaseTransfer({ orderId, amountNaira, farmerRecipientCode, reason });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
