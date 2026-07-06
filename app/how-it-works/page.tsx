"use client";

import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { emoji: "📸", title: "1. List your harvest", body: "Take a photo, choose a category, set your price. Done in under a minute." },
  { emoji: "🤝", title: "2. Talk to a buyer", body: "Buyers message you directly. Agree on a price you're both happy with." },
  { emoji: "🚚", title: "3. Pick a ride for the goods", body: "AgriLink suggests the right vehicle — cold van for perishables, truck for bulk grain." },
  { emoji: "🔒", title: "4. Get paid safely", body: "The buyer's money is held by Paystack, a licensed payment company — not by AgriLink. You get paid once the buyer confirms the goods arrived." },
];

export default function HowItWorksPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-4xl font-semibold text-ink">{t("howItWorks")}</h1>
        <p className="mt-3 font-body text-ink/60">Four simple steps, from your farm to a buyer's warehouse.</p>

        <div className="mt-12 space-y-8">
          {STEPS.map((s) => (
            <div key={s.title} className="flex gap-5 rounded-2xl border border-forest/10 bg-white p-6 shadow-soft">
              <span className="text-4xl" aria-hidden>
                {s.emoji}
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{s.title}</h2>
                <p className="mt-1 font-body text-ink/70">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
