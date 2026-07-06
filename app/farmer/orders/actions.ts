"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markOrderShippedAction(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" as const };
  }

  const { data: order, error: fetchError } = await supabase.from("orders").select("*").eq("id", orderId).single();

  if (fetchError || !order) {
    return { error: "Order not found." };
  }
  if (order.farmer_id !== user.id) {
    return { error: "Only the farmer on this order can mark it shipped." };
  }
  if (order.status !== "in_escrow") {
    return { error: `This order is currently "${order.status}" — can't mark it shipped from here.` };
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "shipped", shipped_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true as const };
}