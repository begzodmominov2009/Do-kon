"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

export type FilterState = {
  minPrice: string;
  maxPrice: string;
  discountOnly: boolean;
  inStockOnly: boolean;
};

export const EMPTY_FILTER: FilterState = {
  minPrice: "",
  maxPrice: "",
  discountOnly: false,
  inStockOnly: false,
};

type FilterPanelProps = {
  open: boolean;
  value: FilterState;
  onApply: (value: FilterState) => void;
  onClose: () => void;
};

export function FilterPanel({ open, value, onApply, onClose }: FilterPanelProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [visible, setVisible] = useState(false);

  // Re-seed the draft from the applied value each time the sheet opens,
  // computed during render rather than in an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

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
      if (event.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleClear = () => setDraft(EMPTY_FILTER);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        onClick={() => setVisible(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        onTransitionEnd={() => {
          if (!visible) onClose();
        }}
        className={`relative z-10 flex w-full max-w-[520px] flex-col rounded-t-card border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text">{t("catalog.filter.title")}</p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label={t("common.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">
          <div>
            <p className="mb-2 text-sm font-medium text-text">
              {t("catalog.filter.priceRange")}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={draft.minPrice}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, minPrice: event.target.value }))
                }
                placeholder={t("catalog.filter.priceFrom")}
                aria-label={t("catalog.filter.priceFrom")}
                className="h-11 w-full rounded-input bg-surface-2 px-3 text-sm text-text outline-none placeholder:text-text-muted"
              />
              <input
                type="number"
                inputMode="numeric"
                value={draft.maxPrice}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, maxPrice: event.target.value }))
                }
                placeholder={t("catalog.filter.priceTo")}
                aria-label={t("catalog.filter.priceTo")}
                className="h-11 w-full rounded-input bg-surface-2 px-3 text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex min-h-11 w-full items-center justify-between">
            <span className="text-sm text-text">{t("catalog.filter.discountOnly")}</span>
            <Switch
              checked={draft.discountOnly}
              onChange={(next) => setDraft((prev) => ({ ...prev, discountOnly: next }))}
              label={t("catalog.filter.discountOnly")}
            />
          </div>
          <div className="flex min-h-11 w-full items-center justify-between">
            <span className="text-sm text-text">{t("catalog.filter.inStockOnly")}</span>
            <Switch
              checked={draft.inStockOnly}
              onChange={(next) => setDraft((prev) => ({ ...prev, inStockOnly: next }))}
              label={t("catalog.filter.inStockOnly")}
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border px-4 py-4">
          <Button type="button" variant="ghost" fullWidth onClick={handleClear}>
            {t("catalog.filter.clear")}
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={() => {
              onApply(draft);
              setVisible(false);
            }}
          >
            {t("catalog.filter.apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}
