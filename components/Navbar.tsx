"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthNav from "./AuthNav";

export default function Navbar() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-parchment/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-forest sm:text-2xl">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-harvest sm:h-3 sm:w-3" aria-hidden />
          {t("appName")}
        </Link>

        <div className="hidden items-center gap-6 md:flex md:gap-8">
          <Link href="/categories" className="font-body text-xs font-medium text-forest/80 hover:text-forest sm:text-sm">
            {t("categories")}
          </Link>
          <Link href="/buyer/marketplace" className="font-body text-xs font-medium text-forest/80 hover:text-forest sm:text-sm">
            {t("marketplace")}
          </Link>
          <Link href="/how-it-works" className="font-body text-xs font-medium text-forest/80 hover:text-forest sm:text-sm">
            {t("howItWorks")}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <AuthNav />
        </div>
      </nav>
    </header>
  );
}
