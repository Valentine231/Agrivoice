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
      <section className="mx-auto max-w-sm px-4 py-10 sm:px-5 sm:py-16">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Welcome back</h1>
        <p className="mt-2 font-body text-xs text-ink/60 sm:text-sm">Log in to your AgriLink account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink sm:text-sm">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target w-full rounded-xl border border-forest/20 px-4 py-2.5 font-body text-sm text-ink sm:py-3"
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-xs font-semibold text-ink sm:text-sm">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="tap-target w-full rounded-xl border border-forest/20 px-4 py-2.5 pr-12 font-body text-sm text-ink sm:py-3"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-body text-xs font-semibold text-forest/60 hover:text-forest"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="font-body text-xs text-clay sm:text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="tap-target w-full rounded-full bg-forest px-6 py-3 font-body text-sm font-semibold text-parchment shadow-soft hover:bg-forest-dark disabled:opacity-60 sm:py-3.5 sm:text-base"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          <p className="text-center font-body text-xs text-ink/60 sm:text-sm">
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
