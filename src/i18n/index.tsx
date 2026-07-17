import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";

export type Locale = "pt-BR" | "en";

type Messages = typeof ptBR;

const catalogs: Record<Locale, Messages> = {
  "pt-BR": ptBR,
  en,
};

const STORAGE_KEY = "svg2rc:locale";
const DEFAULT_LOCALE: Locale = "pt-BR";

type Params = Record<string, string | number>;

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Params) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt-BR" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Read localStorage on the first client render so a returning visitor
  // keeps their language without waiting for an effect.
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === "undefined" ? DEFAULT_LOCALE : readStoredLocale(),
  );

  useEffect(() => {
    document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Params) => {
      const fromActive = getByPath(catalogs[locale], key);
      const fromFallback = getByPath(catalogs[DEFAULT_LOCALE], key);
      const template = fromActive ?? fromFallback ?? key;
      return interpolate(template, params);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
