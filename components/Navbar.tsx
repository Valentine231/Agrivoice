"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthNav from "./AuthNav";

export default function Navbar() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-parchment/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-forest">
          <span className="inline-block h-3 w-3 rounded-full bg-harvest" aria-hidden />
          {t("appName")}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/categories" className="font-body text-sm font-medium text-forest/80 hover:text-forest">
            {t("categories")}
          </Link>
          <Link href="/buyer/marketplace" className="font-body text-sm font-medium text-forest/80 hover:text-forest">
            {t("marketplace")}
          </Link>
          <Link href="/how-it-works" className="font-body text-sm font-medium text-forest/80 hover:text-forest">
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
