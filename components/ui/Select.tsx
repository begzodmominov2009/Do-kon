"use client";

import { useEffect, useId, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  icon: LucideIcon;
  label: string;
  placeholder: string;
  disabledPlaceholder?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
};

export function Select({
  icon: Icon,
  label,
  placeholder,
  disabledPlaceholder,
  value,
  options,
  onChange,
  disabled = false,
  errorMessage,
}: SelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerId = useId();
  const hasError = Boolean(errorMessage);
  const errorId = hasError ? `${triggerId}-error` : undefined;
  const selectedOption = options.find((option) => option.value === value);

  const openSheet = () => {
    if (disabled) return;
    const index = options.findIndex((option) => option.value === value);
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  };

  const closeSheet = () => setVisible(false);

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    closeSheet();
  };

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
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const option = options[activeIndex];
        if (option) selectOption(option.value);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options, activeIndex]);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        onClick={openSheet}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={errorId}
        className={`flex w-full items-center gap-3 rounded-input px-4 py-3 text-left outline-none transition-colors duration-150 disabled:cursor-not-allowed ${
          hasError ? "bg-danger/8" : open ? "bg-surface-2" : ""
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 transition-colors duration-150 ${
            open ? "text-accent" : "text-text-muted"
          }`}
        />
        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            selectedOption ? "text-text" : "text-text-muted"
          }`}
        >
          {selectedOption
            ? selectedOption.label
            : disabled
              ? disabledPlaceholder
              : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {hasError ? (
        <p id={errorId} className="px-4 pb-1 text-xs text-danger">
          {errorMessage}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            onClick={closeSheet}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            role="presentation"
            onTransitionEnd={() => {
              if (!visible) setOpen(false);
            }}
            className={`relative z-10 flex max-h-[70vh] w-full max-w-[520px] flex-col rounded-t-card border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out ${
              visible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-text">{label}</p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label={t("common.close")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul role="listbox" aria-label={label} className="overflow-y-auto py-2">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOption(option.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex h-12 w-full items-center justify-between px-4 text-left text-sm transition-colors duration-150 ${
                        isSelected
                          ? "bg-accent-soft text-accent"
                          : activeIndex === index
                            ? "bg-surface-2 text-text"
                            : "text-text"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
