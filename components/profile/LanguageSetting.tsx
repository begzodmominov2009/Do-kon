"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, Globe, X } from "lucide-react";
import { useTranslation, type Locale } from "@/lib/i18n";

// Language names are shown in their own language and are intentionally not
// translated.
const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "uz", label: "O'zbekcha" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

export function LanguageSetting() {
  const { t, locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openSheet = () => setOpen(true);
  const closeSheet = () => setVisible(false);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const currentLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === locale)?.label ?? "";

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Globe className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-text">
            {t("profile.settings.language.title")}
          </span>
          <span className="block text-sm text-text-muted">{currentLabel}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            onClick={closeSheet}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            onTransitionEnd={() => {
              if (!visible) setOpen(false);
            }}
            className={`relative z-10 flex w-full max-w-[520px] flex-col rounded-t-card border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out ${
              visible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-text">
                {t("profile.settings.language.title")}
              </p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label={t("common.close")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul
              role="listbox"
              aria-label={t("profile.settings.language.title")}
              className="py-2"
            >
              {LANGUAGE_OPTIONS.map((option) => {
                const isSelected = option.value === locale;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setLocale(option.value);
                        closeSheet();
                      }}
                      className={`flex h-12 w-full items-center justify-between px-4 text-left text-sm transition-colors duration-150 ${
                        isSelected ? "bg-accent-soft text-accent" : "text-text"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
