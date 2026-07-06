"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABELS, Product } from "@/lib/mockData";
import { ProductCategory } from "@/lib/transport";
import { fetchActiveProducts, fetchDemoProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

const FILTERS: (ProductCategory | "all")[] = ["all", "cashCrop", "perishable", "grain", "tuber", "livestock"];

export default function MarketplacePage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<ProductCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<Product[]>([]);
  const [isDemoData, setIsDemoData] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        try {
          const real = await fetchActiveProducts();
          if (real.length > 0) {
            setListings(real);
            setIsDemoData(false);
            setLoading(false);
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
      setLoading(false);
    }
    load();
  }, []);

  const products = useMemo(() => {
    return listings.filter((p) => {
      const matchesFilter = filter === "all" || p.category === filter;
      const matchesQuery =
        query.trim() === "" ||
        p.cropName.toLowerCase().includes(query.toLowerCase()) ||
        p.state.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [listings, filter, query]);

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h1 className="font-display text-4xl font-semibold text-ink">{t("marketplace")}</h1>
        <p className="mt-2 font-body text-ink/60">Fresh listings straight from farmers across Nigeria.</p>

        {isDemoData && !loading && (
          <p className="mt-4 rounded-xl border border-harvest/30 bg-harvest/5 px-4 py-3 font-body text-sm text-ink/70">
            Showing sample listings — connect Supabase in <code>.env.local</code> to see real ones.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`tap-target rounded-full px-4 py-2 font-body text-sm font-semibold transition ${
                  filter === f
                    ? "bg-forest text-parchment"
                    : "border border-forest/20 bg-white text-forest hover:bg-forest/5"
                }`}
              >
                {f === "all" ? "All" : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crop or state…"
            className="tap-target w-full rounded-full border border-forest/20 bg-white px-5 font-body text-sm text-ink placeholder:text-ink/40 sm:w-64"
          />
        </div>

        {loading ? (
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/60" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="mt-16 text-center font-body text-ink/50">No listings match your search yet.</p>
        )}
      </section>
    </main>
  );
}
