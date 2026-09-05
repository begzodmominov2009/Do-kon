"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useCartStore, useCartItemQuantity, getCartItemKey } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import type { Product } from "@/lib/mock/products";

type ProductCardProps = {
  product: Product;
  variant?: "grid" | "rail";
};

function AnimatedQuantity({ value }: { value: number }) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<number | null>(null);
  const [settled, setSettled] = useState(true);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
    setSettled(false);
  }

  useEffect(() => {
    if (settled) return;
    const raf = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(raf);
  }, [settled]);

  useEffect(() => {
    if (previous === null) return;
    const timeout = window.setTimeout(() => setPrevious(null), 150);
    return () => window.clearTimeout(timeout);
  }, [previous]);

  return (
    <span className="relative inline-block h-4 w-[1ch] overflow-hidden text-center align-middle text-sm font-semibold">
      {previous !== null ? (
        <span
          className="absolute inset-0 transition-[transform,opacity] duration-[120ms] ease-out"
          style={{
            transform: settled ? "translateY(-100%)" : "translateY(0)",
            opacity: settled ? 0 : 1,
          }}
        >
          {previous}
        </span>
      ) : null}
      <span
        className="absolute inset-0 transition-[transform,opacity] duration-[120ms] ease-out"
        style={{
          transform: settled ? "translateY(0)" : "translateY(100%)",
          opacity: settled ? 1 : 0,
        }}
      >
        {current}
      </span>
    </span>
  );
}

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((state) =>
    state.ids.includes(product.id),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const defaultColor = product.colors?.find((color) => color.inStock);
  const cartKey = getCartItemKey(product.id, defaultColor?.id);
  const quantity = useCartItemQuantity(product.id, defaultColor?.id);
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

        <Link
          href={`/product/${product.id}`}
          className="flex h-full w-full items-center justify-center text-5xl"
        >
          {product.emoji}
        </Link>

        <div className="absolute bottom-2 right-2 z-10">
          <div
            className="relative h-9 overflow-hidden rounded-[18px] bg-accent transition-[width] duration-[260ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]"
            style={{ width: quantity > 0 ? 104 : 36 }}
          >
            <button
              type="button"
              onClick={() => addItem(product, defaultColor)}
              aria-label={t("product.add")}
              className="absolute inset-0 flex items-center justify-center text-white transition-opacity"
              style={{
                opacity: quantity === 0 ? 1 : 0,
                pointerEvents: quantity === 0 ? "auto" : "none",
                transitionDuration: quantity === 0 ? "150ms" : "100ms",
                transitionDelay: quantity === 0 ? "150ms" : "0ms",
              }}
            >
              <Plus className="h-4 w-4" />
            </button>

            <div
              className="absolute inset-0 flex items-center justify-between px-1.5 text-white transition-opacity"
              style={{
                opacity: quantity > 0 ? 1 : 0,
                pointerEvents: quantity > 0 ? "auto" : "none",
                transitionDuration: quantity > 0 ? "150ms" : "100ms",
                transitionDelay: quantity > 0 ? "150ms" : "0ms",
              }}
            >
              <button
                type="button"
                onClick={() => setQty(cartKey, quantity - 1)}
                aria-label={t("product.decrease")}
                className="flex h-6 w-6 items-center justify-center"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <AnimatedQuantity value={quantity} />
              <button
                type="button"
                onClick={() => setQty(cartKey, quantity + 1)}
                aria-label={t("product.increase")}
                className="flex h-6 w-6 items-center justify-center"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link href={`/product/${product.id}`} className="mt-2 block">
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
      </Link>
    </div>
  );
}
