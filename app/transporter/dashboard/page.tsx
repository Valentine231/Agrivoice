"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { OrderRow } from "@/lib/database.types";
import { STATE_COORDS } from "@/lib/mockData";
import { haversineDistanceKm } from "@/lib/transport";
import { claimJobAction, markShippedByTransporterAction } from "./actions";
import { useI18n } from "@/lib/i18n";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount
  );
}

// Same state-centroid distance approach used at buyer checkout, including
// the 30km floor so a same-state trip never reads as "0 km".
function routeDistanceKm(pickup: string | null, dropoff: string | null): number | null {
  if (!pickup || !dropoff) return null;
  const from = STATE_COORDS[pickup];
  const to = STATE_COORDS[dropoff];
  if (!from || !to) return null;
  return Math.max(30, Math.round(haversineDistanceKm(from, to)));
}

const VEHICLE_EMOJI: Record<string, string> = {
  "mini-van": "🚐",
  "refrigerated-van": "🧊",
  "flatbed-truck": "🚛",
  "livestock-truck": "🐄",
  trailer: "🚚",
};

function JobCard({
  order,
  t,
  action,
}: {
  order: OrderRow;
  t: (key: string) => string;
  action: React.ReactNode;
}) {
  const distance = routeDistanceKm(order.pickup_state, order.dropoff_state);
  const vehicleEmoji = VEHICLE_EMOJI[order.transport_option_id ?? ""] ?? "🚚";

  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-ink sm:text-lg">
            {order.crop_name} ({order.quantity_label})
          </p>
          <div className="mt-2 flex items-center gap-2 font-body text-xs text-ink/60 sm:text-sm">
            <span className="font-semibold text-forest">{order.pickup_state ?? t("notSpecified")}</span>
            <span aria-hidden>→</span>
            <span className="font-semibold text-sky">{order.dropoff_state ?? t("notSpecified")}</span>
            {distance !== null && <span className="text-ink/40">· ≈{distance} {t("kmLabel")}</span>}
          </div>
        </div>
        <span className="text-2xl sm:text-3xl" aria-hidden>
          {vehicleEmoji}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-forest/10 pt-3">
        <div className="font-body text-xs text-ink/50 sm:text-sm">
          {t("vehicleNeededLabel")}: <span className="text-ink/70">{order.transport_name ?? t("notSpecified")}</span>
        </div>
        <div className="font-mono text-sm font-semibold text-forest sm:text-base">
          {formatNaira(Number(order.transport_cost))}
        </div>
      </div>

      <div className="mt-3">{action}</div>
    </div>
  );
}

export default function TransporterDashboardPage() {
  const { t } = useI18n();
  const [authState, setAuthState] = useState<"checking" | "signed_out" | "wrong_role" | "ready">("checking");
  const [openJobs, setOpenJobs] = useState<OrderRow[]>([]);
  const [myJobs, setMyJobs] = useState<OrderRow[]>([]);
  const [online, setOnline] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setAuthState("signed_out");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();

    if (profile?.role !== "transporter") {
      setAuthState("wrong_role");
      return;
    }

    setAuthState("ready");

    const [openRes, mineRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .is("transporter_id", null)
        .eq("status", "in_escrow")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("transporter_id", session.user.id)
        .order("created_at", { ascending: false }),
    ]);

    setOpenJobs(openRes.data ?? []);
    setMyJobs(mineRes.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const awaitingPickup = useMemo(() => myJobs.filter((o) => o.status === "in_escrow"), [myJobs]);
  const inTransit = useMemo(() => myJobs.filter((o) => o.status === "shipped"), [myJobs]);
  const completed = useMemo(() => myJobs.filter((o) => o.status === "completed"), [myJobs]);
  const totalEarned = useMemo(
    () => completed.reduce((sum, o) => sum + Number(o.transport_cost), 0),
    [completed]
  );

  async function handleClaim(orderId: string) {
    setClaimingId(orderId);
    setError(null);
    try {
      const result = await claimJobAction(orderId);
      if (result.error) {
        setError(result.error);
      } else {
        await load();
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong claiming this job.");
    } finally {
      setClaimingId(null);
    }
  }

  async function handleMarkShipped(orderId: string) {
    setShippingId(orderId);
    setError(null);
    try {
      const result = await markShippedByTransporterAction(orderId);
      if (result.error) {
        setError(result.error);
      } else {
        await load();
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong marking this job shipped.");
    } finally {
      setShippingId(null);
    }
  }

  if (authState === "checking") {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center font-body text-ink/50">{t("checkingAccount")}</div>
      </main>
    );
  }

  if (authState === "signed_out") {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">🔑</div>
          <h1 className="font-display text-2xl font-semibold text-ink">{t("loginToViewJobs")}</h1>
          <a
            href="/login?next=/transporter/dashboard"
            className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
          >
            {t("logIn")}
          </a>
        </div>
      </main>
    );
  }

  if (authState === "wrong_role") {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">🚫</div>
          <h1 className="font-display text-2xl font-semibold text-ink">{t("transporterOnlyTitle")}</h1>
          <p className="mt-3 font-body text-ink/60">{t("transporterOnlyBody")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        {/* Online toggle + earnings summary — the "driver app" header bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-forest/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${online ? "bg-forest" : "bg-ink/20"}`}
              aria-hidden
            />
            <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">{t("transporterDashboard")}</h1>
          </div>
          <button
            onClick={() => setOnline((v) => !v)}
            className={`tap-target rounded-full px-6 py-2.5 font-body text-sm font-semibold shadow-soft sm:px-8 sm:py-3 ${
              online ? "bg-forest text-parchment hover:bg-forest-dark" : "bg-parchment-dim text-ink hover:bg-forest/10"
            }`}
          >
            {online ? t("goOfflineBtn") : t("goOnlineBtn")}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5">
          <div className="rounded-2xl border border-forest/10 bg-white p-4 text-center shadow-soft sm:p-5">
            <p className="font-mono text-xl font-semibold text-forest sm:text-2xl">{completed.length}</p>
            <p className="mt-1 font-body text-xs text-ink/50 sm:text-sm">{t("deliveriesCompletedStat")}</p>
          </div>
          <div className="rounded-2xl border border-forest/10 bg-white p-4 text-center shadow-soft sm:p-5">
            <p className="font-mono text-xl font-semibold text-forest sm:text-2xl">{formatNaira(totalEarned)}</p>
            <p className="mt-1 font-body text-xs text-ink/50 sm:text-sm">{t("totalEarnedStat")}</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-clay/30 bg-clay/5 px-4 py-3 font-body text-sm text-clay">
            {error}
          </p>
        )}

        {!online ? (
          <div className="mt-10 rounded-2xl border border-dashed border-forest/20 bg-white/60 p-10 text-center">
            <div className="mb-4 text-4xl">💤</div>
            <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{t("offlineTitle")}</h2>
            <p className="mt-2 font-body text-sm text-ink/60">{t("offlineBody")}</p>
          </div>
        ) : (
          <>
            {/* Awaiting pickup — claimed jobs that still need the transporter's action */}
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{t("yourPickupsHeading")}</h2>
              {awaitingPickup.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-forest/20 bg-white/60 p-6 text-center font-body text-sm text-ink/50">
                  {t("noPickupsYet")}
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {awaitingPickup.map((order) => (
                    <JobCard
                      key={order.id}
                      order={order}
                      t={t}
                      action={
                        <button
                          onClick={() => handleMarkShipped(order.id)}
                          disabled={shippingId === order.id}
                          className="tap-target w-full rounded-full bg-forest px-5 py-2.5 font-body text-sm font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:opacity-60"
                        >
                          {shippingId === order.id ? t("markingShipped") : `🚚 ${t("markPickedUpBtn")}`}
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Open jobs — anyone can claim these */}
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{t("availableJobsHeading")}</h2>
              {openJobs.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-forest/20 bg-white/60 p-6 text-center font-body text-sm text-ink/50">
                  {t("noOpenJobs")}
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {openJobs.map((order) => (
                    <JobCard
                      key={order.id}
                      order={order}
                      t={t}
                      action={
                        <button
                          onClick={() => handleClaim(order.id)}
                          disabled={claimingId === order.id}
                          className="tap-target w-full rounded-full bg-harvest px-5 py-2.5 font-body text-sm font-semibold text-forest-dark shadow-soft hover:bg-harvest-light disabled:opacity-60"
                        >
                          {claimingId === order.id ? t("claimingJob") : t("acceptJobBtn")}
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* In transit — shipped, waiting on the buyer to confirm delivery */}
            {inTransit.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{t("inTransitHeading")}</h2>
                <div className="mt-3 space-y-3">
                  {inTransit.map((order) => (
                    <JobCard
                      key={order.id}
                      order={order}
                      t={t}
                      action={
                        <p className="font-body text-xs text-ink/50 sm:text-sm">⏳ {t("awaitingBuyerConfirm")}</p>
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed history */}
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{t("completedHeading")}</h2>
              {completed.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-forest/20 bg-white/60 p-6 text-center font-body text-sm text-ink/50">
                  {t("noCompletedYet")}
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {completed.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-forest/10 bg-white px-4 py-3 font-body text-sm"
                    >
                      <span className="text-ink/70">
                        {order.crop_name} · {order.pickup_state ?? t("notSpecified")} → {order.dropoff_state ?? t("notSpecified")}
                      </span>
                      <span className="font-mono font-semibold text-forest">
                        {formatNaira(Number(order.transport_cost))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
