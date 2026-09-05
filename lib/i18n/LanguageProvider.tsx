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

function resolveMessage(messages: Messages, key: string): string {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (typeof current === "object" && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  return typeof current === "string" ? current : key;
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
  t: (key: string) => string;
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

  const t = (key: string) => resolveMessage(messagesByLocale[locale], key);

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
