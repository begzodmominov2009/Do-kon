"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import uz from "./locales/uz.json";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

export type Locale = "uz" | "en" | "ru";

type Messages = typeof uz;

const messagesByLocale: Record<Locale, Messages> = { uz, en, ru };

const STORAGE_KEY = "locale";
const DEFAULT_LOCALE: Locale = "uz";

function isLocale(value: string): value is Locale {
  return value === "uz" || value === "en" || value === "ru";
}

type TranslateParams = Record<string, string | number>;

// Replaces "{{name}}" placeholders in a resolved message with values from
// params — e.g. resolveMessage(messages, "product.lowStock.card", { count: 3 }).
// Existing single-argument callers are unaffected: without params, a message
// with no placeholders is returned as-is.
function resolveMessage(messages: Messages, key: string, params?: TranslateParams): string {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (typeof current === "object" && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof current !== "string") return key;
  if (!params) return current;

  return current.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

type Listener = () => void;
let listeners: Listener[] = [];

function subscribe(listener: Listener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  for (const listener of listeners) listener();
}

function getSnapshot(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function storeLocale(next: Locale) {
  localStorage.setItem(STORAGE_KEY, next);
  emitChange();
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslateParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string, params?: TranslateParams) =>
    resolveMessage(messagesByLocale[locale], key, params);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: storeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
