"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";
import { MOCK_PRODUCTS, STATE_COORDS, CATEGORY_LABELS, Product } from "@/lib/mockData";
import { suggestTransport, haversineDistanceKm, TransportSuggestion } from "@/lib/transport";
import { fetchProductById } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/client";
import { createOrderAndPay } from "./actions";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount
  );
}

type Stage = "browse" | "negotiate" | "transport" | "pay" | "done";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();

  const [product, setProduct] = useState<Product | null>(null);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null); // null = still checking

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        const result = await fetchProductById(id);
        if (result) {
          setProduct(result.product);
          setFarmerId(result.farmerId);
          setIsDemoData(false);
          setProductLoading(false);

          try {
            const supabase = createClient();
            const {
              data: { session },
            } = await supabase.auth.getSession();
            setIsSignedIn(!!session?.user);
          } catch (err) {
            console.error("Sign-in check failed:", err);
            setIsSignedIn(false);
          }
          return;
        }
      }
      // Fall back to demo data if Supabase isn't configured or the id isn't a real row
      setProduct(MOCK_PRODUCTS.find((p) => p.id === id) ?? MOCK_PRODUCTS[0]);
      setIsDemoData(true);
      setProductLoading(false);
      setIsSignedIn(!isSupabaseConfigured() ? true : false);
    }
    load();
  }, [id]);

  const [stage, setStage] = useState<Stage>("browse");
  const [offer, setOffer] = useState(0);
  const [units, setUnits] = useState(1);
  const [buyerState, setBuyerState] = useState("Lagos");
  const [transportChoice, setTransportChoice] = useState<TransportSuggestion | null>(null);
  const [email, setEmail] = useState("");
  const [loadingPay, setLoadingPay] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (product) setOffer(product.pricePerUnit);
  }, [product]);

  const distanceKm = useMemo(() => {
    if (!product) return 250;
    const from = STATE_COORDS[product.state];
    const to = STATE_COORDS[buyerState];
    if (!from || !to) return 250;
    return Math.max(30, Math.round(haversineDistanceKm(from, to)));
  }, [product, buyerState]);

  const transportOptions = useMemo(
    () => (product ? suggestTransport(product.category, distanceKm) : []),
    [product, distanceKm]
  );

  const goodsTotal = offer * units;
  const transportCost = transportChoice?.estimatedCostNaira ?? 0;
  const grandTotal = goodsTotal + transportCost;

  async function handlePay() {
    setPayError(null);
    if (!email) {
      setPayError("Enter an email to receive your payment receipt.");
      return;
    }
    if (!product) return;

    if (isDemoData) {
      setPayError(
        "This is a sample listing — connect Supabase so real listings and orders can be created."
      );
      return;
    }

    if (!isSignedIn) {
      window.location.href = `/login?next=/buyer/product/${id}`;
      return;
    }

    setLoadingPay(true);
    try {
      const result = await createOrderAndPay({
        productId: product.id,
        farmerId: farmerId!,
        cropName: product.cropName,
        quantityLabel: `${units} × ${product.unit}`,
        goodsTotal,
        transportOptionId: transportChoice?.id ?? "",
        transportName: transportChoice?.name ?? "",
        transportCost,
        grandTotal,
        buyerEmail: email,
      });

      if (result.error === "not_authenticated") {
        window.location.href = `/login?next=/buyer/product/${id}`;
        return;
      }
      if (result.error || !result.authorizationUrl) {
        throw new Error(result.error || "Could not start payment");
      }

      window.location.href = result.authorizationUrl;
    } catch (e: any) {
      setPayError(
        e.message === "Failed to fetch"
          ? "Payment isn't wired up in this preview — add your Paystack keys in .env.local to go live."
          : e.message
      );
    } finally {
      setLoadingPay(false);
    }
  }

  if (productLoading || !product) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-6xl px-5 py-24 text-center font-body text-ink/50">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
        <div>
          <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-soft">
            <Image src={product.imageUrl} alt={product.cropName} fill className="object-cover" unoptimized />
          </div>
          <div className="mt-6">
            <span className="rounded-full bg-forest/10 px-3 py-1 font-body text-xs font-semibold text-forest">
              {CATEGORY_LABELS[product.category]}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{product.cropName}</h1>
            <p className="mt-2 font-body text-ink/60">
              {product.quantity} available · {product.state} State · Listed by {product.farmerName}
            </p>
            <p className="mt-4 font-mono text-2xl font-semibold text-forest">
              {formatNaira(product.pricePerUnit)}
              <span className="ml-1 font-body text-sm font-normal text-ink/50">/ {product.unit}</span>
            </p>
            {isDemoData && (
              <p className="mt-4 rounded-xl border border-harvest/30 bg-harvest/5 px-4 py-3 font-body text-sm text-ink/70">
                Sample listing — connect Supabase to browse and buy real produce.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-forest/10 bg-white p-6 shadow-soft sm:p-8">
          <ol className="mb-8 flex flex-wrap gap-2 font-body text-xs font-semibold text-ink/40">
            {["negotiate", "transport", "pay"].map((s, i) => (
              <li
                key={s}
                className={`rounded-full px-3 py-1 ${stage === s ? "bg-forest text-parchment" : "bg-parchment-dim"}`}
              >
                {i + 1}. {s === "negotiate" ? t("agreePrice") : s === "transport" ? t("chooseTransport") : t("payNow")}
              </li>
            ))}
          </ol>

          {stage === "browse" && (
            <div className="space-y-5">
              <p className="font-body text-ink/70">Interested in this harvest? Start by agreeing a price with the farmer.</p>
              <button
                onClick={() => setStage("negotiate")}
                className="tap-target w-full rounded-full bg-forest px-6 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
              >
                {t("agreePrice")}
              </button>
            </div>
          )}

          {stage === "negotiate" && (
            <div className="space-y-5">
              <div>
                <label className="mb-1 block font-body text-sm font-semibold text-ink">How many {product.unit}s?</label>
                <input
                  type="number"
                  min={1}
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
                  className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
                />
              </div>
              <div>
                <label className="mb-1 block font-body text-sm font-semibold text-ink">{t("price")} (per {product.unit})</label>
                <input
                  type="number"
                  min={0}
                  value={offer}
                  onChange={(e) => setOffer(Number(e.target.value))}
                  className="tap-target w-full rounded-xl border border-forest/20 px-4 font-mono text-ink"
                />
                <p className="mt-1 font-body text-xs text-ink/50">
                  Listed price: {formatNaira(product.pricePerUnit)}. Adjust to the price you and the farmer agreed on.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-parchment-dim px-4 py-3">
                <span className="font-body text-sm font-semibold text-ink">Goods total</span>
                <span className="font-mono font-semibold text-forest">{formatNaira(goodsTotal)}</span>
              </div>
              <button
                onClick={() => setStage("transport")}
                className="tap-target w-full rounded-full bg-forest px-6 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
              >
                {t("chooseTransport")}
              </button>
            </div>
          )}

          {stage === "transport" && (
            <div className="space-y-5">
              <div>
                <label className="mb-1 block font-body text-sm font-semibold text-ink">{t("location")} (delivery state)</label>
                <select
                  value={buyerState}
                  onChange={(e) => {
                    setBuyerState(e.target.value);
                    setTransportChoice(null);
                  }}
                  className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
                >
                  {Object.keys(STATE_COORDS).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-1 font-body text-xs text-ink/50">≈ {distanceKm} km from {product.state}</p>
              </div>

              <div className="space-y-3">
                {transportOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTransportChoice(opt)}
                    className={`tap-target flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition ${
                      transportChoice?.id === opt.id
                        ? "border-sky bg-sky/5"
                        : "border-forest/10 bg-white hover:border-forest/30"
                    }`}
                  >
                    <div>
                      <p className="font-body font-semibold text-ink">
                        {opt.name} {opt.refrigerated && <span className="ml-1 text-xs text-sky">❄️ cold chain</span>}
                      </p>
                      <p className="font-body text-xs text-ink/50">{opt.description}</p>
                      <p className="font-body text-xs text-ink/50">ETA ≈ {opt.estimatedEtaHours} hrs</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-forest">{formatNaira(opt.estimatedCostNaira)}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={!transportChoice}
                onClick={() => setStage("pay")}
                className="tap-target w-full rounded-full bg-forest px-6 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("payNow")}
              </button>
            </div>
          )}

          {stage === "pay" && (
            <div className="space-y-5">
              <div className="space-y-2 rounded-xl bg-parchment-dim p-4 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/60">Goods ({units} × {product.unit})</span>
                  <span className="font-mono text-ink">{formatNaira(goodsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Transport ({transportChoice?.name})</span>
                  <span className="font-mono text-ink">{formatNaira(transportCost)}</span>
                </div>
                <div className="flex justify-between border-t border-forest/10 pt-2 font-semibold">
                  <span className="text-ink">Total</span>
                  <span className="font-mono text-forest">{formatNaira(grandTotal)}</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-body text-sm font-semibold text-ink">Your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-sky/30 bg-sky/5 p-4">
                <span className="text-lg">🔒</span>
                <p className="font-body text-sm text-ink/70">{t("escrowNote")}</p>
              </div>

              {payError && <p className="font-body text-sm text-clay">{payError}</p>}

              <button
                onClick={handlePay}
                disabled={loadingPay}
                className="tap-target w-full rounded-full bg-harvest px-6 py-3.5 font-body font-semibold text-forest-dark shadow-soft hover:bg-harvest-light disabled:opacity-60"
              >
                {loadingPay ? "Starting payment…" : `${t("payNow")} — ${formatNaira(grandTotal)}`}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
