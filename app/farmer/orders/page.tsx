"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { OrderRow } from "@/lib/database.types";
import { markOrderShippedAction } from "./actions";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-parchment-dim text-ink/50",
  in_escrow: "bg-sky/10 text-sky",
  shipped: "bg-harvest/10 text-harvest-dark",
  completed: "bg-forest/10 text-forest",
  disputed: "bg-clay/10 text-clay",
  cancelled: "bg-parchment-dim text-ink/40",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  in_escrow: "Paid — ready to ship",
  shipped: "Shipped",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setSignedIn(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("farmer_id", session.user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
    } catch (err) {
      console.error("Farmer orders load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkShipped(orderId: string) {
    setShippingId(orderId);
    setError(null);
    const result = await markOrderShippedAction(orderId);
    if (result.error) {
      setError(result.error);
    } else {
      await load();
    }
    setShippingId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center font-body text-ink/50">Loading…</div>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">🔑</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Log in to see your orders</h1>
          <a
            href="/login?next=/farmer/orders"
            className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
          >
            Log in
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">My Orders</h1>
        <p className="mt-1 font-body text-ink/60">Orders buyers have placed on your listings.</p>

        {error && <p className="mt-4 font-body text-sm text-clay">{error}</p>}

        {orders.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-forest/20 bg-white/60 p-8 text-center font-body text-ink/50">
            No orders yet.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-forest/10 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      {order.crop_name} ({order.quantity_label})
                    </p>
                    <p className="font-body text-sm text-ink/50">{order.buyer_email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-forest">
                    {formatNaira(Number(order.goods_total))}
                  </span>

                  {order.status === "in_escrow" && (
                    <button
                      onClick={() => handleMarkShipped(order.id)}
                      disabled={shippingId === order.id}
                      className="tap-target rounded-full bg-forest px-5 py-2.5 font-body text-sm font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:opacity-60"
                    >
                      {shippingId === order.id ? "Marking…" : "🚚 Mark as shipped"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}