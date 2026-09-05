"use client";

import { Heart, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import type { Product } from "@/lib/mock/products";

type ProductCardProps = {
  product: Product;
  variant?: "grid" | "rail";
};

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((state) =>
    state.ids.includes(product.id),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const quantity = useCartStore(
    (state) => state.items.find((item) => item.id === product.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((state) => state.addItem);
  const setQty = useCartStore((state) => state.setQty);

  const discountPercent = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className={variant === "rail" ? "w-40 shrink-0" : "w-full"}>
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface-2">
        {discountPercent ? (
          <Badge variant="danger" className="absolute left-2 top-2 z-10">
            -{discountPercent}%
          </Badge>
        ) : null}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={t("product.favoriteToggle")}
          aria-pressed={isFavorite}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white"
        >
          <Heart
            className={
              isFavorite
                ? "h-4 w-4 fill-danger text-danger"
                : "h-4 w-4 text-black/40"
            }
          />
        </button>

        <div className="flex h-full w-full items-center justify-center text-5xl">
          {product.emoji}
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          {quantity > 0 ? (
            <div className="flex items-center gap-2 rounded-chip bg-accent px-1.5 py-1 text-white">
              <button
                type="button"
                onClick={() => setQty(product.id, quantity - 1)}
                aria-label={t("product.decrease")}
                className="flex h-6 w-6 items-center justify-center"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1ch] text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQty(product.id, quantity + 1)}
                aria-label={t("product.increase")}
                className="flex h-6 w-6 items-center justify-center"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addItem(product)}
              aria-label={t("product.add")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        <p className="line-clamp-2 min-h-[2.5em] text-sm text-text">
          {product.name}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-bold text-text">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-text-muted">
            {t("common.currency")}
          </span>
        </div>
        {product.oldPrice ? (
          <span className="text-xs text-text-muted line-through">
            {formatPrice(product.oldPrice)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
