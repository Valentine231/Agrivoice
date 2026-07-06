"use server";

import { createClient } from "@/lib/supabase/server";
import { createTransferRecipient } from "@/lib/paystack";

export async function saveBankDetailsAction(input: { accountNumber: string; bankCode: string; bankName: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" as const };
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role !== "farmer") {
    return { error: "Only farmer accounts have payout settings." };
  }

  let recipient;
  try {
    recipient = await createTransferRecipient({
      name: profile.full_name,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
    });
  } catch (err: any) {
    return { error: err.message };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ paystack_recipient_code: recipient.recipient_code })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true as const, accountName: recipient.details.account_name };
}
