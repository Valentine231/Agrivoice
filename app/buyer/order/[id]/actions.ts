"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseTransfer } from "@/lib/paystack";

export async function confirmDeliveryAction(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" as const };
  }

  // RLS already restricts this select to the buyer or farmer on the order,
  // but we explicitly re-check buyer_id below too — never trust a single
  // layer of defense for something that moves money.
  const { data: order, error: fetchError } = await supabase.from("orders").select("*").eq("id", orderId).single();

  if (fetchError || !order) {
    return { error: "Order not found." };
  }
  if (order.buyer_id !== user.id) {
    return { error: "Only the buyer on this order can confirm delivery." };
  }
 if (order.status !== "in_escrow" && order.status !== "shipped") {
  return { error: `This order is currently "${order.status}" — nothing to release.` };
}

  const { data: farmerProfile } = await supabase
    .from("profiles")
    .select("paystack_recipient_code")
    .eq("id", order.farmer_id)
    .single();

  if (!farmerProfile?.paystack_recipient_code) {
    return {
      error:
        "This farmer hasn't added their bank details yet, so we can't release payment. Please try again shortly, or contact support.",
    };
  }

  try {
    await releaseTransfer({
      orderId: order.id,
      amountNaira: Number(order.goods_total),
      farmerRecipientCode: farmerProfile.paystack_recipient_code,
      reason: `AgriLink order ${order.id} — ${order.crop_name}`,
    });
  } catch (err: any) {
    return { error: err.message };
  }

  // Regular users have no UPDATE policy on orders by design (see the RLS
  // notes in the migration) — this admin write is the one place that's
  // allowed to move an order to "completed", and only after everything
  // above has been checked.
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ status: "completed", delivered_confirmed_at: new Date().toISOString() })
    .eq("id", orderId);

  return { success: true as const };
}
