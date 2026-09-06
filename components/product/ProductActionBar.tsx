"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useCartStore, useCartItemQuantity, getCartItemKey } from "@/store/cart";
import type { Product } from "@/lib/mock/products";

type ProductActionBarProps = {
  product: Product;
  colorId: string | undefined;
  onRequireColor: () => boolean;
};

export function ProductActionBar({
  product,
  colorId,
  onRequireColor,
}: ProductActionBarProps) {
  const { t } = useTranslation();
  const quantity = useCartItemQuantity(product.id, colorId);
  const addItem = useCartStore((state) => state.addItem);
  const setQty = useCartStore((state) => state.setQty);
  const selectedColor = product.colors?.find((color) => color.id === colorId);
  const cartKey = getCartItemKey(product.id, colorId);

  const handleAdd = () => {
    if (!onRequireColor()) return;
    addItem(product, selectedColor);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="relative w-full max-w-[520px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 h-6"
          style={{ background: "linear-gradient(to top, var(--bg), transparent)" }}
        />
        <div className="bg-bg px-4 pt-3.5 pb-[max(20px,env(safe-area-inset-bottom))]">
          {!product.inStock ? (
            <button
              type="button"
              disabled
              className="flex h-[52px] w-full items-center justify-center rounded-button bg-surface-2 text-base font-medium text-text-muted"
            >
              {t("product.availability.outOfStock")}
            </button>
          ) : (
            <div className="relative h-[52px]">
              <div
                className={`absolute inset-0 transition-opacity duration-[240ms] ${
                  quantity === 0 ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex h-full w-full items-center justify-center gap-2 rounded-button bg-accent text-base font-medium text-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t("product.add")} · {formatPrice(product.price)}{" "}
                  {t("common.currency")}
                </button>
              </div>

              <div
                className={`absolute inset-0 flex gap-2 transition-opacity duration-[240ms] ${
                  quantity > 0 ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="flex flex-1 items-center justify-between rounded-button bg-accent-soft px-1 text-accent">
                  <button
                    type="button"
                    onClick={() => setQty(cartKey, quantity - 1)}
                    aria-label={t("product.decrease")}
                    className="flex h-11 w-11 items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-base font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQty(cartKey, quantity + 1)}
                    aria-label={t("product.increase")}
                    className="flex h-11 w-11 items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Link
                  href="/cart"
                  className="flex flex-1 items-center justify-center rounded-button bg-accent text-base font-medium text-white"
                >
                  {t("product.goToCart")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
