"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";

const JOURNEY = [
  {
    step: "01",
    en: { title: "Farmer lists harvest", body: "Snap a photo, set a price, done in under a minute." },
  },
  {
    step: "02",
    en: { title: "Buyer agrees a price", body: "Real buyers browse by category and message farmers directly." },
  },
  {
    step: "03",
    en: { title: "Transport is arranged", body: "We suggest the right vehicle for the crop and the distance." },
  },
  {
    step: "04",
    en: { title: "Payment is held safe", body: "Paystack holds the funds until the buyer confirms delivery." },
  },
];

const CATEGORY_TILES = [
  { key: "cashCrop", emoji: "🌰", href: "/categories#cashCrop" },
  { key: "perishable", emoji: "🍅", href: "/categories#perishable" },
  { key: "grain", emoji: "🌾", href: "/categories#grain" },
  { key: "tuber", emoji: "🍠", href: "/categories#tuber" },
  { key: "livestock", emoji: "🐐", href: "/categories#livestock" },
];

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-forest text-parchment">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden>
          <svg width="100%" height="100%">
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-20 md:py-28">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-harvest/15 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-harvest-light sm:px-4 sm:py-1.5">
                Farm → Buyer → Delivered
              </span>
              <h1 className="mt-4 font-display text-2xl font-semibold leading-[1.1] text-parchment sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
                {t("tagline")}
              </h1>
              <p className="mt-4 max-w-lg font-body text-sm text-parchment/80 sm:mt-6 sm:text-lg">{t("heroSub")}</p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:gap-4 sm:flex-row">
                <Link
                  href="/farmer/upload"
                  className="tap-target inline-flex items-center justify-center rounded-full bg-harvest px-6 py-3 font-body text-sm font-semibold text-forest-dark shadow-soft transition hover:bg-harvest-light sm:px-8 sm:py-4 sm:text-base"
                >
                  {t("getStartedFarmer")}
                </Link>
                <Link
                  href="/buyer/marketplace"
                  className="tap-target inline-flex items-center justify-center rounded-full border-2 border-parchment/30 px-6 py-3 font-body text-sm font-semibold text-parchment transition hover:bg-parchment/10 sm:px-8 sm:py-4 sm:text-base"
                >
                  {t("getStartedBuyer")}
                </Link>
              </div>
            </div>

            {/* Signature element: the farm-to-hand journey, a real sequence */}
            <div className="relative">
              <div className="rounded-2xl border border-parchment/15 bg-forest-light/60 p-4 shadow-soft backdrop-blur sm:p-6">
                <p className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-harvest-light sm:mb-5">
                  How a sale moves
                </p>
                <ol className="space-y-4 sm:space-y-5">
                  {JOURNEY.map((j, i) => (
                    <li key={j.step} className="flex gap-3 sm:gap-4">
                      <span className="font-mono text-xs text-harvest-light/80 sm:text-sm">{j.step}</span>
                      <div className="flex-1 border-l border-parchment/15 pb-1 pl-3 sm:pl-4">
                        <p className="font-display text-sm font-medium sm:text-lg">{j.en.title}</p>
                        <p className="mt-0.5 font-body text-xs text-parchment/70 sm:mt-1 sm:text-sm">{j.en.body}</p>
                      </div>
                      {i < JOURNEY.length - 1 && (
                        <span className="sr-only">then</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="grain-divider" />
      </section>

      {/* Categories preview */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink">{t("categories")}</h2>
            <p className="mt-2 font-body text-ink/60">Everything sold on AgriLink fits one of these.</p>
          </div>
          <Link href="/categories" className="hidden font-body text-sm font-semibold text-sky sm:block">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-forest/10 bg-white p-6 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-4xl" aria-hidden>
                {c.emoji}
              </span>
              <span className="font-body text-sm font-semibold text-ink">{t(c.key)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust / escrow explainer */}
      <section className="bg-forest-dark text-parchment">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 md:grid-cols-3">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky/20 text-sky-light">
              🔒
            </div>
            <h3 className="font-display text-xl font-semibold">{t("payNow")}</h3>
            <p className="mt-2 font-body text-sm text-parchment/70">{t("escrowNote")}</p>
          </div>
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-harvest/20 text-harvest-light">
              🚚
            </div>
            <h3 className="font-display text-xl font-semibold">Right transport, every time</h3>
            <p className="mt-2 font-body text-sm text-parchment/70">
              We match cold vans to perishables and trucks to bulk grain automatically.
            </p>
          </div>
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clay/20 text-clay-light">
              🗣️
            </div>
            <h3 className="font-display text-xl font-semibold">Built for every farmer</h3>
            <p className="mt-2 font-body text-sm text-parchment/70">
              Available in English, Igbo, Yoruba and Hausa — with a simple, uncluttered screen.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 py-10 text-center font-body text-sm text-ink/50">
        © 2026 AgriLink. Farm to buyer, made simple.
      </footer>
    </main>
  );
}
