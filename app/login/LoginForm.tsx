"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Prefer wherever the user was trying to go before they got sent here
    // (e.g. /login?next=/farmer/upload). Otherwise, land role-appropriately
    // instead of always dropping everyone on the homepage.
    if (next) {
      router.push(next);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      router.push(profile?.role === "farmer" ? "/farmer/dashboard" : "/buyer/marketplace");
    }
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-sm px-5 py-16">
        <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 font-body text-ink/60">Log in to your AgriLink account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
          <div>
            <label className="mb-1 block font-body text-sm font-semibold text-ink">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
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
            {loading ? "Logging in…" : "Log in"}
          </button>

          <p className="text-center font-body text-sm text-ink/60">
            New to AgriLink?{" "}
            <a href="/signup" className="font-semibold text-sky">
              Create an account
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}

export default LoginForm;
