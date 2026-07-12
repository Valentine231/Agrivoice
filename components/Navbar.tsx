"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthNav from "./AuthNav";

export default function Navbar() {
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest/10 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight text-forest sm:text-2xl transition-transform hover:scale-105">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-harvest shadow-[0_0_10px_rgba(251,191,36,0.6)] sm:h-3 sm:w-3 transition-transform group-hover:scale-110" aria-hidden />
          {t("appName")}
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/categories" className="rounded-full px-4 py-2 font-body text-sm font-medium text-forest/70 transition-all hover:bg-forest/5 hover:text-forest">
            {t("categories")}
          </Link>
          <Link href="/buyer/marketplace" className="rounded-full px-4 py-2 font-body text-sm font-medium text-forest/70 transition-all hover:bg-forest/5 hover:text-forest">
            {t("marketplace")}
          </Link>
          <Link href="/how-it-works" className="rounded-full px-4 py-2 font-body text-sm font-medium text-forest/70 transition-all hover:bg-forest/5 hover:text-forest">
            {t("howItWorks")}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <AuthNav />
          <button 
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-forest/5 text-forest hover:bg-forest/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%+0.5rem)] left-0 w-full px-4 sm:px-6">
          <div className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-lg">
            <Link 
              href="/messages" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-body text-sm font-medium text-forest transition-all hover:bg-forest/5"
            >
              Messages
            </Link>
            <Link 
              href="/categories" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-body text-sm font-medium text-forest transition-all hover:bg-forest/5"
            >
              {t("categories")}
            </Link>
            <Link 
              href="/buyer/marketplace" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-body text-sm font-medium text-forest transition-all hover:bg-forest/5"
            >
              {t("marketplace")}
            </Link>
            <Link 
              href="/how-it-works" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-body text-sm font-medium text-forest transition-all hover:bg-forest/5"
            >
              {t("howItWorks")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
