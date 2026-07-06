"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABELS, Product } from "@/lib/mockData";
import { ProductCategory } from "@/lib/transport";
import { fetchActiveProducts, fetchDemoProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

const CATEGORY_META: { key: ProductCategory; emoji: string; blurb: string }[] = [
  { key: "cashCrop", emoji: "🌰", blurb: "Cocoa, cotton, groundnut, sesame and other export-grade crops." },
  { key: "perishable", emoji: "🍅", blurb: "Tomatoes, peppers, leafy greens — moved fast, kept cold." },
  { key: "grain", emoji: "🌾", blurb: "Maize, rice, millet, sorghum sold by the bag or in bulk." },
  { key: "tuber", emoji: "🍠", blurb: "Cassava, yam, potatoes and other root crops." },
  { key: "livestock", emoji: "🐐", blurb: "Goats, cattle, poultry moved in ventilated, humane transport." },
];

export default function CategoriesPage() {
  const { t } = useI18n();
  const [listings, setListings] = useState<Product[]>([]);
  const [isDemoData, setIsDemoData] = useState(true);

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        try {
          const real = await fetchActiveProducts();
          if (real.length > 0) {
            setListings(real);
            setIsDemoData(false);
            return;
          }
        } catch {
          // fall through to demo data below
        }
      }
      try {
        setListings(await fetchDemoProducts());
      } catch {
        setListings([]);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl md:text-4xl">{t("categories")}</h1>
        <p className="mt-2 max-w-xl font-body text-xs text-ink/60 sm:text-sm md:text-base">
          Browse what farmers are selling right now, grouped by category.
        </p>

        {isDemoData && (
          <p className="mt-3 rounded-xl border border-harvest/30 bg-harvest/5 px-3 py-2.5 font-body text-xs text-ink/70 sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
            Showing sample listings — connect Supabase in <code className="mx-1 bg-forest/5 px-1">.env.local</code> to see real ones.
          </p>
        )}

        <div className="mt-10 space-y-12 sm:mt-14 sm:space-y-16">
          {CATEGORY_META.map((cat) => {
            const items = listings.filter((p) => p.category === cat.key);
            return (
              <div key={cat.key} id={cat.key} className="scroll-mt-20 sm:scroll-mt-24">
                <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-soft sm:h-14 sm:w-14 sm:text-3xl" aria-hidden>
                    {cat.emoji}
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink sm:text-2xl">{CATEGORY_LABELS[cat.key]}</h2>
                    <p className="font-body text-xs text-ink/60 sm:text-sm">{cat.blurb}</p>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-forest/20 bg-white/60 p-4 font-body text-xs text-ink/50 sm:p-6 sm:text-sm">
                    No listings in this category yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
