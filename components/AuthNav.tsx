"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import type { Profile } from "@/lib/database.types";

export default function AuthNav() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      return;
    }

    const supabase = createClient();

    async function loadProfile() {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (!session?.user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (error) throw error;
        setProfile(data ?? null);
      } catch (err) {
        console.error("AuthNav profile load failed:", err);
        setProfile(null);
      }
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => loadProfile());

    return () => subscription.unsubscribe();
  }, []);

  // Close the dropdown on an outside click.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  if (profile === undefined) {
    return <div className="h-10 w-24 animate-pulse rounded-full bg-forest/5" />;
  }

  if (!profile) {
    return (
      <a
        href="/login"
        className="tap-target inline-flex items-center rounded-full bg-forest px-6 py-2 font-body text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-forest-dark hover:shadow-md"
      >
        Log In
      </a>
    );
  }

  const firstName = profile.full_name.split(" ")[0];
  const initial = profile.full_name.trim().charAt(0).toUpperCase() || "?";
  const dashboardHref = profile.role === "farmer" ? "/farmer/dashboard" : "/buyer/marketplace";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <a
        href={profile.role === "farmer" ? "/farmer/messages" : "/buyer/messages"}
        className="tap-target flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-forest/10 text-lg hover:bg-forest/20"
        title="Messages"
      >
        💬
      </a>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="tap-target flex items-center gap-2 rounded-full border border-forest/15 bg-white pl-1.5 pr-3 py-1.5 shadow-soft hover:border-forest/30"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-forest font-display text-sm font-semibold text-parchment">
            {initial}
          </span>
          <span className="hidden max-w-[7rem] truncate font-body text-sm font-semibold text-forest sm:block">{firstName}</span>
          <svg
            className={`h-3.5 w-3.5 text-forest/50 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-soft"
          >
            <div className="border-b border-forest/10 px-4 py-3">
              <p className="truncate font-body text-sm font-semibold text-ink">{profile.full_name}</p>
              <p className="font-body text-xs capitalize text-ink/50">{profile.role} account</p>
            </div>
            <a
              href={dashboardHref}
              className="block px-4 py-3 font-body text-sm text-ink hover:bg-forest/5"
              onClick={() => setMenuOpen(false)}
            >
              {profile.role === "farmer" ? "My Listings" : "Marketplace"}
            </a>
            <a 
              href={profile.role === "farmer" ? "/farmer/orders" : "/buyer/orders"}
              className="block px-4 py-3 font-body text-sm text-ink hover:bg-forest/5"
              onClick={() => setMenuOpen(false)}
            >
              My Orders
            </a>
            {profile.role === "farmer" && (
              <a
                href="/farmer/settings"
                className="block px-4 py-3 font-body text-sm text-ink hover:bg-forest/5"
                onClick={() => setMenuOpen(false)}
              >
                Payout settings
              </a>
            )}
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-3 text-left font-body text-sm font-semibold text-clay hover:bg-clay/5"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
