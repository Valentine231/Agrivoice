const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;
const PLATFORM_FEE_PERCENT = 5;

export async function initializeTransaction(params: {
  email: string;
  amountNaira: number;
  orderId: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}) {
  const reference = params.reference ?? `agrilink_${params.orderId}_${Date.now()}`;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),
      reference,
      metadata: { orderId: params.orderId, ...params.metadata },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/buyer/order/${params.orderId}/confirm`,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Paystack initialization failed");
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Payment verification request failed");
  }

  if (data.data?.status !== "success") {
    const status = data.data?.status || "unknown";
    if (status === "abandoned") {
      throw new Error("Payment was abandoned or not completed.");
    }
    throw new Error(`Payment not successful (status: ${status})`);
  }

  return {
    amount: data.data.amount / 100,
    reference: data.data.reference as string,
    paidAt: data.data.paid_at as string,
  };
}

export async function releaseTransfer(params: {
  orderId: string;
  amountNaira: number;
  farmerRecipientCode: string;
  reason?: string;
}) {
  const payoutAmount = Math.round(params.amountNaira * (1 - PLATFORM_FEE_PERCENT / 100));

  const res = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: payoutAmount * 100,
      recipient: params.farmerRecipientCode,
      reason: params.reason || `AgriLink order ${params.orderId} — delivery confirmed`,
      reference: `agrilink_payout_${params.orderId}_${Date.now()}`,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Transfer failed");
  return data.data;
}

/**
 * Verifies a farmer's bank account with Paystack and creates a Transfer
 * Recipient — the recipient_code returned here is what gets stored on
 * their profile and used by releaseTransfer() at payout time.
 */
export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) {
  const res = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: "NGN",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Couldn't verify that bank account");
  return data.data as { recipient_code: string; details: { account_name: string } };
}
