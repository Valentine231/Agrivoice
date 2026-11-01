"use client";

import { LANGUAGES, useI18n } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();

  // Short label for the closed state, e.g. "EN", "HA", "YO"
  const abbr = lang.toUpperCase().slice(0, 2);

  return (
    <div className="relative inline-flex">
      <label className="sr-only" htmlFor="lang-select">
        {t("language")}
      </label>

      {/* Visible pill (what the user sees) */}
      <div
        aria-hidden="true"
        className={`tap-target pointer-events-none flex items-center gap-1 rounded-full border-2 border-forest/20 bg-white/90 font-body text-sm font-bold tracking-wide text-forest shadow-soft ${
          compact ? "px-3 py-2" : "px-4 py-3"
        }`}
      >
        <span>{abbr}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Real select, invisible, covers the pill and opens the native dropdown */}
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}