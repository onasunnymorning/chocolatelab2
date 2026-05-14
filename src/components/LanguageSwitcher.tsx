"use client";

import { useLanguage, type Locale } from "@/i18n/context";

const FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
};

const LOCALES: Locale[] = ["en", "es"];

function nextLocale(current: Locale): Locale {
  const idx = LOCALES.indexOf(current);
  return LOCALES[(idx + 1) % LOCALES.length];
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const next = nextLocale(locale);

  return (
    <>
      {/* ── Mobile: single compact tap-to-cycle button ─────────────────── */}
      <button
        id="lang-switcher-mobile"
        onClick={() => setLocale(next)}
        aria-label={t.langSwitcher.switchTo}
        className="sm:hidden flex items-center gap-1 px-2 py-1.5 rounded-xl
          bg-secondary/40 border border-border/30
          text-xs font-bold text-amber-300
          hover:bg-secondary/60 transition-all duration-150 select-none"
      >
        <span className="text-sm leading-none">{FLAGS[locale]}</span>
        <span className="tracking-wide">{t.langSwitcher[locale]}</span>
      </button>

      {/* ── Desktop: both options visible ──────────────────────────────── */}
      <div
        className="hidden sm:flex items-center gap-1 rounded-xl bg-secondary/40 border border-border/30 p-1"
        role="group"
        aria-label={t.langSwitcher.switchTo}
      >
        {LOCALES.map((l) => {
          const isActive = locale === l;
          return (
            <button
              key={l}
              id={`lang-switcher-${l}`}
              onClick={() => setLocale(l)}
              aria-pressed={isActive}
              aria-label={`${FLAGS[l]} ${t.langSwitcher[l]}`}
              className={[
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-150 select-none",
                isActive
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60",
              ].join(" ")}
            >
              <span className="text-sm leading-none">{FLAGS[l]}</span>
              <span className="tracking-wide">{t.langSwitcher[l]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
