"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import type { Dictionary } from "./dictionaries/en";

// ── Types ──────────────────────────────────────────────────────────────────

export type Locale = "en" | "es";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

const STORAGE_KEY = "choclab_locale";

// ── Context ────────────────────────────────────────────────────────────────

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

// ── Provider ───────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in DICTIONARIES) {
      setLocaleState(stored);
    }
  }, []);

  // Update <html lang> reactively
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t: DICTIONARIES[locale] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

/** Returns `{ t, locale, setLocale }`. Use `t.someKey` to access strings. */
export function useLanguage() {
  return useContext(LanguageContext);
}
