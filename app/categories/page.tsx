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
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h1 className="font-display text-4xl font-semibold text-ink">{t("categories")}</h1>
        <p className="mt-2 max-w-xl font-body text-ink/60">
          Browse what farmers are selling right now, grouped by category.
        </p>

        {isDemoData && (
          <p className="mt-4 rounded-xl border border-harvest/30 bg-harvest/5 px-4 py-3 font-body text-sm text-ink/70">
            Showing sample listings — connect Supabase in <code>.env.local</code> to see real ones.
          </p>
        )}

        <div className="mt-14 space-y-16">
          {CATEGORY_META.map((cat) => {
            const items = listings.filter((p) => p.category === cat.key);
            return (
              <div key={cat.key} id={cat.key} className="scroll-mt-24">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft" aria-hidden>
                    {cat.emoji}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">{CATEGORY_LABELS[cat.key]}</h2>
                    <p className="font-body text-sm text-ink/60">{cat.blurb}</p>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-forest/20 bg-white/60 p-6 font-body text-sm text-ink/50">
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
