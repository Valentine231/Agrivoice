"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/database.types";

const ROLES: { key: UserRole; emoji: string; label: string; blurb: string }[] = [
  { key: "farmer", emoji: "🌾", label: "Farmer", blurb: "I want to sell my harvest" },
  { key: "buyer", emoji: "🏢", label: "Buyer", blurb: "I want to buy produce" },
  { key: "transporter", emoji: "🚚", label: "Transporter", blurb: "I move goods for AgriLink" },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setError("Choose whether you're a farmer, buyer, or transporter.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
        data: { role, full_name: fullName, phone, state },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // Email confirmation is off in your Supabase project — signed in immediately.
      router.push(next || (role === "farmer" ? "/farmer/dashboard" : "/buyer/marketplace"));
      router.refresh();
    } else {
      // Email confirmation is on — they need to click the link we just sent.
      setCheckEmail(true);
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-6xl">📩</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Check your email</h1>
          <p className="mt-3 font-body text-ink/60">
            We sent a confirmation link to <strong>{email}</strong>. Tap it to finish setting up your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-lg px-5 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
        <p className="mt-2 font-body text-ink/60">It only takes a minute.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <p className="mb-3 font-body text-sm font-semibold text-ink">I am a…</p>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`tap-target flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition ${
                    role === r.key ? "border-forest bg-forest/5" : "border-forest/10 bg-white"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {r.emoji}
                  </span>
                  <span className="font-body text-xs font-semibold text-ink">{r.label}</span>
                  <span className="font-body text-[11px] text-ink/50">{r.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-body text-sm font-semibold text-ink">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
            />
          </div>

          <div>
            <label className="mb-1 block font-body text-sm font-semibold text-ink">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-body text-sm font-semibold text-ink">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="080…"
                className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-sm font-semibold text-ink">State</label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Kaduna"
                className="tap-target w-full rounded-xl border border-forest/20 px-4 font-body text-ink"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-body text-sm font-semibold text-ink">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="tap-target w-full rounded-xl border border-forest/20 px-4 pr-14 font-body text-ink"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-body text-xs font-semibold text-forest/60 hover:text-forest"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="font-body text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="tap-target w-full rounded-full bg-forest px-6 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center font-body text-sm text-ink/60">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-sky">
              Log in
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}

export default SignupForm;
