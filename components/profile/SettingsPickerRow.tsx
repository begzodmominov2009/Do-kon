"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type SettingsPickerOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
};

type SettingsPickerRowProps = {
  icon: ReactNode;
  title: string;
  valueLabel: string;
  options: SettingsPickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

// Shared by every profile settings row that opens a bottom-sheet picker
// (language, theme, ...) so the trigger row and the sheet stay identical.
export function SettingsPickerRow({
  icon,
  title,
  valueLabel,
  options,
  selectedValue,
  onSelect,
}: SettingsPickerRowProps) {
  const { t } = useTranslation();
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
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-text">{title}</span>
          <span className="block text-sm text-text-muted">{valueLabel}</span>
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
              <p className="text-sm font-semibold text-text">{title}</p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label={t("common.close")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul role="listbox" aria-label={title} className="py-2">
              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelect(option.value);
                        closeSheet();
                      }}
                      className={`flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                        isSelected ? "bg-accent-soft text-accent" : "text-text"
                      }`}
                    >
                      {option.icon ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block">{option.label}</span>
                        {option.description ? (
                          <span className="block text-xs text-text-muted">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
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
