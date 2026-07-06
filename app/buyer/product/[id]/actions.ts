"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";

export async function createOrderAndPay(input: {
  productId: string;
  farmerId: string;
  cropName: string;
  quantityLabel: string;
  goodsTotal: number;
  transportOptionId: string;
  transportName: string;
  transportCost: number;
  grandTotal: number;
  buyerEmail: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" as const };
  }

  // Generate the order id and Paystack reference up front so both the DB
  // row and the payment request agree on the same reference — this avoids
  // needing a client-writable UPDATE policy on orders (see the RLS notes
  // in supabase/migrations/0001_init.sql).
  const orderId = randomUUID();
  const reference = `agrilink_${orderId}_${Date.now()}`;

  const { error: insertError } = await supabase.from("orders").insert({
    id: orderId,
    product_id: input.productId,
    buyer_id: user.id,
    farmer_id: input.farmerId,
    crop_name: input.cropName,
    quantity_label: input.quantityLabel,
    goods_total: input.goodsTotal,
    transport_option_id: input.transportOptionId,
    transport_name: input.transportName,
    transport_cost: input.transportCost,
    grand_total: input.grandTotal,
    buyer_email: input.buyerEmail,
    paystack_reference: reference,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  try {
    const payment = await initializeTransaction({
      email: input.buyerEmail,
      amountNaira: input.grandTotal,
      orderId,
      reference,
      metadata: { cropName: input.cropName },
    });
    return { authorizationUrl: payment.authorization_url };
  } catch (err: any) {
    return { error: err.message };
  }
}
