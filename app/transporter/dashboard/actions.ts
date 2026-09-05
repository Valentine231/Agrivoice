"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Claims an open, unclaimed job for the signed-in transporter. Mirrors the
// same manual-ownership-check + admin-client-write pattern already used in
// app/farmer/orders/actions.ts, for consistency across the codebase.
export async function claimJobAction(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" as const };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "transporter") {
    return { error: "Only transporter accounts can claim jobs." };
  }

  const { data: order, error: fetchError } = await supabase.from("orders").select("*").eq("id", orderId).single();

  if (fetchError || !order) {
    return { error: "This job is no longer available." };
  }
  if (order.transporter_id) {
    return { error: "This job has already been claimed by another transporter." };
  }
  if (order.status !== "in_escrow") {
    return { error: `This order is currently "${order.status}" — it can't be claimed from here.` };
  }

  const admin = createAdminClient();
  // .select("id") is what actually lets us see how many rows the update
  // touched — Supabase does not error on an update that matches zero rows,
  // it just silently does nothing, so without this the claim can "succeed"
  // while never actually writing anything.
  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({ transporter_id: user.id })
    .eq("id", orderId)
    .is("transporter_id", null) // extra guard against a race with another transporter claiming it first
    .select("id");

  if (updateError) {
    return { error: updateError.message };
  }

  if (!updated || updated.length === 0) {
    return {
      error: "This job was just claimed by another transporter — refresh to see what's still available.",
    };
  }

  return { success: true as const };
}

// Marks a job the transporter already holds as shipped/picked-up. This
// replaces the farmer doing this step directly once a real transporter is
// assigned — the farmer's own markOrderShippedAction still exists for the
// case where no transporter has claimed the job yet.
export async function markShippedByTransporterAction(orderId: string) {
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
  if (order.transporter_id !== user.id) {
    return { error: "Only the transporter who claimed this job can mark it shipped." };
  }
  if (order.status !== "in_escrow") {
    return { error: `This order is currently "${order.status}" — can't mark it shipped from here.` };
  }

  const admin = createAdminClient();
  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({ status: "shipped", shipped_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("transporter_id", user.id)
    .select("id");

  if (updateError) {
    return { error: updateError.message };
  }

  if (!updated || updated.length === 0) {
    return { error: "Couldn't update this order — it may no longer belong to you." };
  }

  return { success: true as const };
}
