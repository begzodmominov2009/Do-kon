import type { Locale } from "@/lib/i18n";

export type Localized = {
  uz: string;
  en: string | null;
  ru: string | null;
};

// DB text fields are stored per-language, and a locale's value may be empty
// or missing (not every row has an en/ru translation yet) — uz is always
// the fallback so the UI never shows blank text.
export function i18nField(value: Localized, locale: Locale): string {
  const current = value[locale];
  return current && current.trim().length > 0 ? current : value.uz;
}
