"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";
import { Product } from "@/lib/mockData";
import { fetchMyProducts, fetchDemoProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/database.types";

export default function FarmerDashboard() {
  const { t } = useI18n();
  const [listings, setListings] = useState<Product[]>([]);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [isDemoData, setIsDemoData] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.user) {
            setProfile(null);
            return;
          }

          const { data: profileRow } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(profileRow ?? null);

          const mine = await fetchMyProducts(session.user.id);
          if (mine.length > 0) {
            setListings(mine);
            setIsDemoData(false);
            return;
          }
          // Real farmer account, but nothing listed yet — fall through to
          // the same sample data buyers see, rather than a blank dashboard.
        }

        setListings(await fetchDemoProducts());
      } catch (err) {
        console.error("Farmer dashboard load failed:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center font-body text-xs text-ink/50 sm:px-5 sm:py-24 sm:text-sm">Loading…</div>
      </main>
    );
  }

  if (profile === null) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-5 sm:py-24">
          <div className="mb-6 text-4xl sm:text-5xl">🔑</div>
          <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">Log in to see your listings</h1>
          <a
            href="/login?next=/farmer/dashboard"
            className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 font-body text-sm font-semibold text-parchment shadow-soft hover:bg-forest-dark sm:mt-8 sm:px-8 sm:py-3.5 sm:text-base"
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
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">My Listings</h1>
            <p className="mt-1 font-body text-xs text-ink/60 sm:text-sm">Everything you've put up for sale.</p>
          </div>
          <Link
            href="/farmer/upload"
            className="tap-target inline-flex items-center rounded-full bg-forest px-5 py-2.5 font-body text-xs font-semibold text-parchment shadow-soft hover:bg-forest-dark sm:px-6 sm:py-3 sm:text-sm"
          >
            + {t("uploadHarvest")}
          </Link>
        </div>

        {isDemoData && (
          <p className="mt-3 rounded-xl border border-harvest/30 bg-harvest/5 px-3 py-2.5 font-body text-xs text-ink/70 sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
            {profile
              ? "You haven't listed anything yet — here's what buyers see on the marketplace right now. Upload your harvest to replace these with your own."
              : <>Showing sample listings — connect Supabase in <code className="mx-1 bg-forest/5 px-1">.env.local</code> to manage real ones.</>}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {profile && !profile.paystack_recipient_code && (
          <div className="mt-8 rounded-2xl border border-harvest/30 bg-harvest/5 p-4 sm:mt-10 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">⚠️ Add your bank details</h2>
            <p className="mt-1 font-body text-xs text-ink/70 sm:text-sm">
              You need to add your bank account before buyers' payments can be released to you.
            </p>
            <Link
              href="/farmer/settings"
              className="tap-target mt-3 inline-flex items-center rounded-full bg-forest px-5 py-2.5 font-body text-xs font-semibold text-parchment shadow-soft hover:bg-forest-dark sm:mt-4 sm:px-6 sm:py-3 sm:text-sm"
            >
              Add bank details
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-sky/20 bg-sky/5 p-4 sm:mt-10 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">Payments</h2>
          <p className="mt-1 font-body text-xs text-ink/70 sm:text-sm">
            When a buyer pays, the money is held safely by Paystack. You'll be paid out as soon as the buyer confirms
            the delivery arrived.
          </p>
        </div>
      </section>
    </main>
  );
}
