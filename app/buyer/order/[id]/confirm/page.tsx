"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { OrderRow, OrderStatusDb } from "@/lib/database.types";
import { confirmDeliveryAction } from "../actions";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount
  );
}

type Stage = "verifying" | "tracking" | "confirming" | "completed" | "error";

const TRACKING_STEPS: { status: OrderStatusDb; label: string; emoji: string }[] = [
  { status: "in_escrow", label: "Paid & secured", emoji: "🔒" },
  { status: "shipped", label: "On the way", emoji: "🚚" },
  { status: "completed", label: "Delivered", emoji: "📦" },
];

function TrackingTimeline({ currentStatus }: { currentStatus: OrderStatusDb }) {
  const currentIndex = TRACKING_STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between">
      {TRACKING_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step.status} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                  reached ? "bg-forest text-parchment" : "bg-parchment-dim text-ink/30"
                }`}
              >
                {step.emoji}
              </span>
              <span
                className={`text-center font-body text-xs font-semibold ${
                  reached ? "text-forest" : "text-ink/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${i < currentIndex ? "bg-forest" : "bg-parchment-dim"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ConfirmDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [stage, setStage] = useState<Stage>("verifying");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setErrorMsg("Log in with the account you paid from to see this order.");
          setStage("error");
          return;
        }

        const { data: orderRow } = await supabase.from("orders").select("*").eq("id", id).single();
        if (!orderRow) {
          setErrorMsg("We couldn't find this order.");
          setStage("error");
          return;
        }
        setOrder(orderRow);

        if (orderRow.status === "completed") {
          setStage("completed");
          return;
        }
        if (orderRow.status === "in_escrow" || orderRow.status === "shipped") {
          setStage("tracking");
          return;
        }

        if (!reference && !orderRow.paystack_reference) {
          setErrorMsg("No payment reference found for this order yet.");
          setStage("error");
          return;
        }

        const res = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference || orderRow.paystack_reference!)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "We couldn't confirm this payment yet.");
        setOrder({ ...orderRow, status: "in_escrow" });
        setStage("tracking");
      } catch (err: any) {
        setErrorMsg(
          err.message === "Failed to fetch"
            ? "Payment verification isn't wired up in this preview — add your Paystack keys in .env.local to go live."
            : err.message
        );
        setStage("error");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reference]);

  async function handleConfirmDelivery() {
    if (!order) return;
    setStage("confirming");
    setErrorMsg(null);

    const result = await confirmDeliveryAction(order.id);

    if (result.error) {
      setErrorMsg(result.error);
      setStage("tracking");
      return;
    }
    setStage("completed");
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-xl px-5 py-16">
        <div className="rounded-2xl border border-forest/10 bg-white p-6 shadow-soft sm:p-8">
          {stage === "verifying" && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-forest/20 border-t-forest" />
              <p className="font-body text-ink/70">Confirming your payment…</p>
            </div>
          )}

          {stage === "error" && (
            <div className="py-6 text-center">
              <div className="mb-4 text-4xl">⚠️</div>
              <h1 className="font-display text-2xl font-semibold text-ink">We hit a snag</h1>
              <p className="mt-2 font-body text-ink/60">{errorMsg}</p>
            </div>
          )}

          {(stage === "tracking" || stage === "confirming") && order && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="font-display text-2xl font-semibold text-ink">Order status</h1>
                <p className="mt-1 font-body text-sm text-ink/60">{t("escrowNote")}</p>
              </div>

              <TrackingTimeline currentStatus={order.status} />

              <div className="space-y-2 rounded-xl bg-parchment-dim p-4 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/60">Item</span>
                  <span className="text-ink">{order.crop_name} ({order.quantity_label})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Transport</span>
                  <span className="text-ink">{order.transport_name}</span>
                </div>
                <div className="flex justify-between border-t border-forest/10 pt-2 font-semibold">
                  <span className="text-ink">Total paid</span>
                  <span className="font-mono text-forest">{formatNaira(Number(order.grand_total))}</span>
                </div>
              </div>

              {order.status === "shipped" ? (
                <div className="rounded-xl border border-sky/30 bg-sky/5 p-4">
                  <p className="font-body text-sm text-ink/70">
                    The farmer has marked this order as on the way. Once it arrives and you've checked it
                    matches what you agreed, confirm delivery below to release their payment.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-harvest/30 bg-harvest/5 p-4">
                  <p className="font-body text-sm text-ink/70">
                    Only tap the button below once your delivery has actually arrived and you've checked it
                    matches what you agreed with the farmer. This releases their payment immediately.
                  </p>
                </div>
              )}

              {errorMsg && <p className="font-body text-sm text-clay">{errorMsg}</p>}

              <button
                onClick={handleConfirmDelivery}
                disabled={stage === "confirming"}
                className="tap-target w-full rounded-full bg-forest px-6 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:opacity-60"
              >
                {stage === "confirming" ? "Releasing payment…" : "✅ Confirm delivery & pay farmer"}
              </button>
            </div>
          )}

          {stage === "completed" && order && (
            <div className="py-6 text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <h1 className="font-display text-2xl font-semibold text-ink">Delivery confirmed</h1>
              <p className="mt-2 font-body text-ink/60">
                The farmer has been paid {formatNaira(Number(order.goods_total))}. Thanks for using AgriLink.
              </p>
              
              <a
                href="/buyer/marketplace"
                className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
              >
                Back to marketplace
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}