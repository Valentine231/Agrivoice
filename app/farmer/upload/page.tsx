"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";
import { ProductCategory } from "@/lib/transport";
import { CATEGORY_LABELS } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createProductAction } from "./actions";

const CATEGORY_OPTIONS: { key: ProductCategory; emoji: string }[] = [
  { key: "cashCrop", emoji: "🌰" },
  { key: "perishable", emoji: "🍅" },
  { key: "grain", emoji: "🌾" },
  { key: "tuber", emoji: "🍠" },
  { key: "livestock", emoji: "🐐" },
];

type UploadState = "idle" | "uploading" | "done" | "error";
type AuthState = "checking" | "signed_out" | "wrong_role" | "ready" | "check_failed";

export default function FarmerUploadPage() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authState, setAuthState] = useState<AuthState>(isSupabaseConfigured() ? "checking" : "ready");
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [cropName, setCropName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return; // demo mode — skip the auth gate

    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setAuthState("signed_out");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setAuthState(profile?.role === "farmer" ? "ready" : "wrong_role");
      } catch (err) {
        console.error("Farmer upload auth check failed:", err);
        setAuthState("check_failed");
      }
    }
    checkAuth();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadState("uploading");

    try {
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      const sign = await signRes.json();
      if (!sign.cloudName) throw new Error("missing-config");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sign.apiKey);
      formData.append("timestamp", sign.timestamp);
      formData.append("signature", sign.signature);
      formData.append("folder", sign.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const uploaded = await uploadRes.json();
      if (!uploaded.secure_url) throw new Error("upload-failed");

      setCloudinaryUrl(uploaded.secure_url);
      setUploadState("done");
    } catch {
      setUploadState("error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setSubmitError(null);

    if (!isSupabaseConfigured()) {
      // Demo mode without a database wired up — just show the success screen.
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    const result = await createProductAction({
      category,
      cropName,
      quantityLabel: quantity,
      unit: unit || quantity.split(" ").pop() || "unit",
      pricePerUnit: Number(price),
      state: location,
      imageUrl: cloudinaryUrl,
    });
    setSubmitting(false);

    if (result.error === "not_authenticated") {
      window.location.href = "/login?next=/farmer/upload";
      return;
    }
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (authState === "checking") {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center font-body text-ink/50">Checking your account…</div>
      </main>
    );
  }

  if (authState === "check_failed") {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">⚠️</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Couldn't check your account</h1>
          <p className="mt-3 font-body text-ink/60">
            This usually means Supabase isn't reachable right now — check your internet connection, or that
            <code className="mx-1 rounded bg-forest/5 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>
            in <code>.env.local</code> is correct.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (authState === "signed_out") {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">🔑</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Log in to list your harvest</h1>
          <p className="mt-3 font-body text-ink/60">You'll need a farmer account to upload produce for sale.</p>
          <a
            href="/login?next=/farmer/upload"
            className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
          >
            Log in
          </a>
          <p className="mt-4 font-body text-sm text-ink/50">
            New here?{" "}
            <a href="/signup" className="font-semibold text-sky">
              Create a farmer account
            </a>
          </p>
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
          <h1 className="font-display text-2xl font-semibold text-ink">Farmer accounts only</h1>
          <p className="mt-3 font-body text-ink/60">
            Your account is set up as a buyer or transporter, so it can't list produce for sale.
          </p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <div className="mb-6 text-6xl">✅</div>
          <h1 className="font-display text-3xl font-semibold text-ink">Your harvest is live!</h1>
          <p className="mt-3 font-body text-ink/60">Buyers can now see {cropName || "your harvest"} on the marketplace.</p>
          <a
            href="/farmer/dashboard"
            className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
          >
            Go to my listings
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">{t("uploadHarvest")}</h1>
        <p className="mt-2 font-body text-ink/60">Fill in a few simple details — it only takes a minute.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div>
            <p className="mb-3 font-body text-sm font-semibold text-ink">{t("categories")}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`tap-target flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition ${
                    category === c.key ? "border-forest bg-forest/5" : "border-forest/10 bg-white"
                  }`}
                >
                  <span className="text-3xl" aria-hidden>
                    {c.emoji}
                  </span>
                  <span className="text-center font-body text-xs font-semibold text-ink">{CATEGORY_LABELS[c.key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-body text-sm font-semibold text-ink">{t("takePhoto")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="tap-target flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-forest/30 bg-white py-10 text-forest"
            >
              {imagePreview ? (
                <div className="relative h-40 w-40 overflow-hidden rounded-xl">
                  <Image src={imagePreview} alt="Your harvest" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <>
                  <span className="text-4xl" aria-hidden>
                    📷
                  </span>
                  <span className="font-body text-sm font-semibold">{t("takePhoto")}</span>
                </>
              )}
            </button>
            {uploadState === "uploading" && <p className="mt-2 font-body text-sm text-sky">Uploading photo…</p>}
            {uploadState === "done" && <p className="mt-2 font-body text-sm text-forest">Photo uploaded ✓</p>}
            {uploadState === "error" && (
              <p className="mt-2 font-body text-sm text-clay">
                Couldn't upload — add your Cloudinary keys in .env.local to enable this in production.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-body text-sm font-semibold text-ink">{t("cropName")}</label>
              <input
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Tomatoes"
                className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-lg text-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-body text-sm font-semibold text-ink">{t("quantity")}</label>
                <input
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 20 baskets"
                  className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-lg text-ink"
                />
              </div>
              <div>
                <label className="mb-1 block font-body text-sm font-semibold text-ink">Sold per</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. basket"
                  className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-lg text-ink"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-body text-sm font-semibold text-ink">{t("price")} (₦)</label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 18000"
                className="tap-target w-full rounded-xl border border-forest/20 px-4 font-mono text-lg text-ink"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-sm font-semibold text-ink">{t("location")}</label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kaduna"
                className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-lg text-ink"
              />
            </div>
          </div>

          {submitError && <p className="font-body text-sm text-clay">{submitError}</p>}

          <button
            type="submit"
            disabled={!category || submitting}
            className="tap-target w-full rounded-full bg-harvest px-6 py-4 font-body text-lg font-semibold text-forest-dark shadow-soft hover:bg-harvest-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Publishing…" : t("submit")}
          </button>
        </form>
      </section>
    </main>
  );
}
