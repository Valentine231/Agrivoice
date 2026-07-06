import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";

/**
 * Kept as a route handler for flexibility (e.g. calling from outside a
 * Server Action context), but app/buyer/product/[id]/actions.ts is the
 * primary path used by the UI now — it creates the order row *and* calls
 * this same initializeTransaction() helper in one server-side step.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, amountNaira, orderId, metadata } = body;

  if (!email || !amountNaira || !orderId) {
    return NextResponse.json({ error: "email, amountNaira and orderId are required" }, { status: 400 });
  }

  try {
    const data = await initializeTransaction({ email, amountNaira, orderId, metadata });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
