"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/database.types";
import { saveBankDetailsAction } from "./actions";

interface Bank {
  name: string;
  code: string;
}

export default function FarmerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          setProfile(null);
          return;
        }
        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (error) throw error;
        setProfile(data ?? null);
      } catch (err) {
        console.error("Farmer settings auth check failed:", err);
        setProfile(null);
      }
    }
    load();

    fetch("/api/paystack/banks")
      .then((res) => res.json())
      .then((data) => setBanks(data.banks ?? []))
      .catch(() => setBanks([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!bankCode || !accountNumber) {
      setError("Choose a bank and enter your account number.");
      return;
    }

    setLoading(true);
    const bank = banks.find((b) => b.code === bankCode);
    const result = await saveBankDetailsAction({
      accountNumber,
      bankCode,
      bankName: bank?.name ?? "",
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(`Saved — payouts will go to ${result.accountName}.`);
  }

  if (profile === undefined) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center font-body text-ink/50">Loading…</div>
      </main>
    );
  }

  if (profile === null) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">🔑</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Log in first</h1>
          <a
            href="/login?next=/farmer/settings"
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
      <section className="mx-auto max-w-lg px-4 py-8 sm:px-5 sm:py-12">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Payout details</h1>
        <p className="mt-2 font-body text-sm text-ink/60 sm:text-base">
          Add your bank account so AgriLink can pay you once a buyer confirms delivery.
        </p>

        {profile.paystack_recipient_code && !success && (
          <p className="mt-4 rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
            ✓ Bank details already on file. Submitting the form below will replace them.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink sm:text-sm">Bank</label>
            <select
              required
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="tap-target w-full rounded-xl border border-forest/20 px-4 py-2.5 font-body text-sm text-ink sm:py-3"
            >
              <option value="">{banks.length ? "Choose your bank" : "Loading banks…"}</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink sm:text-sm">Account number</label>
            <input
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="10-digit NUBAN"
              maxLength={10}
              className="tap-target w-full rounded-xl border border-forest/20 px-4 py-2.5 font-mono text-sm text-ink sm:py-3"
            />
          </div>

          {error && <p className="font-body text-xs text-clay sm:text-sm">{error}</p>}
          {success && <p className="font-body text-xs text-forest sm:text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="tap-target w-full rounded-full bg-forest px-6 py-3 font-body text-sm font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:opacity-60 sm:py-3.5 sm:text-base"
          >
            {loading ? "Verifying account…" : "Save bank details"}
          </button>
        </form>
      </section>
    </main>
  );
}
