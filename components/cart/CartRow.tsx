"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useCartStore, type CartItem } from "@/store/cart";

type CartRowProps = {
  item: CartItem;
};

export function CartRow({ item }: CartRowProps) {
  const { t } = useTranslation();
  const setQty = useCartStore((state) => state.setQty);

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-surface-2 text-2xl">
        {item.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">{item.name}</p>
        {item.colorName ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: item.colorHex }}
            />
            <span className="text-xs text-text-muted">{item.colorName}</span>
          </div>
        ) : null}
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-bold text-accent">
            {formatPrice(item.price)}
          </span>
          <span className="text-xs text-text-muted">
            {t("common.currency")}
          </span>
        </div>
        {item.oldPrice ? (
          <span className="text-xs text-text-muted line-through">
            {formatPrice(item.oldPrice)}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty(item.id, item.quantity - 1)}
            aria-label={t("product.decrease")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-danger/10 text-danger"
          >
            {item.quantity === 1 ? (
              <Trash2 className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
          </button>
          <span className="min-w-[1.5ch] text-center text-sm font-semibold text-text">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => setQty(item.id, item.quantity + 1)}
            aria-label={t("product.increase")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-sm font-bold text-accent">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
}
