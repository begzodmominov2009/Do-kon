"use client";

import type { Ref } from "react";
import { useTranslation } from "@/lib/i18n";
import type { ProductColor } from "@/lib/types/product";
import { i18nField } from "@/lib/utils/i18nField";

type ColorPickerProps = {
  colors: ProductColor[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  shakeX: number;
  ref?: Ref<HTMLDivElement>;
};

function isLightColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
}

export function ColorPicker({
  colors,
  selectedId,
  onSelect,
  shakeX,
  ref,
}: ColorPickerProps) {
  const { t, locale } = useTranslation();
  const selectedColor = colors.find((color) => color.id === selectedId);

  return (
    <div
      ref={ref}
      style={{ transform: `translateX(${shakeX}px)`, transition: "transform 50ms" }}
    >
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-sm font-medium text-text">
          {t("product.specs.color")}
        </span>
        {selectedColor ? (
          <span className="text-sm text-text-muted">
            {i18nField(selectedColor.name, locale)}
          </span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label={t("product.specs.color")}
        className="flex flex-wrap gap-2"
      >
        {colors.map((color) => {
          const active = color.id === selectedId;
          const needsBorder = isLightColor(color.hex);
          return (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={i18nField(color.name, locale)}
              disabled={!color.inStock}
              onClick={() => onSelect(color.id)}
              className="flex h-11 w-11 shrink-0 items-center justify-center disabled:cursor-not-allowed"
            >
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
                  !color.inStock ? "opacity-40" : ""
                } ${needsBorder ? "border border-border" : ""} ${
                  active ? "outline outline-2 outline-offset-[3px] outline-accent" : ""
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {!color.inStock ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(45deg, transparent calc(50% - 1px), var(--text) calc(50% - 1px), var(--text) calc(50% + 1px), transparent calc(50% + 1px))",
                    }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
