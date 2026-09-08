"use client";

import { Globe } from "lucide-react";
import { useTranslation, type Locale } from "@/lib/i18n";
import { SettingsPickerRow } from "./SettingsPickerRow";

// Language names are shown in their own language and are intentionally not
// translated.
const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "uz", label: "O'zbekcha" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

export function LanguageSetting() {
  const { t, locale, setLocale } = useTranslation();
  const currentLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === locale)?.label ?? "";

  return (
    <SettingsPickerRow
      icon={<Globe className="h-5 w-5" />}
      title={t("profile.settings.language.title")}
      valueLabel={currentLabel}
      options={LANGUAGE_OPTIONS}
      selectedValue={locale}
      onSelect={(value) => setLocale(value as Locale)}
    />
  );
}
