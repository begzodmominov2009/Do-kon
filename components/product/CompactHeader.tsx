"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatPrice } from "@/lib/utils/formatPrice";
import { i18nField } from "@/lib/utils/i18nField";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/types/product";

type CompactHeaderProps = {
  product: Product;
  visible: boolean;
  colorId: string | undefined;
  onRequireColor: () => boolean;
};

export function CompactHeader({
  product,
  visible,
  colorId,
  onRequireColor,
}: CompactHeaderProps) {
  const { t, locale } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const selectedColor = product.colors?.find((color) => color.id === colorId);
  const productName = i18nField(product.name, locale);

  const handleAdd = () => {
    if (!onRequireColor()) return;
    addItem(product, selectedColor);
  };

  return (
    <div
      className={`fixed inset-x-0 top-0 z-30 border-b border-border bg-surface/92 backdrop-blur-md transition-transform duration-[240ms] ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[520px] items-center gap-3 px-4 py-2.5">
        <ProductImage
          url={product.imageUrl}
          alt={productName}
          className="h-9 w-9 shrink-0 rounded-input"
          sizes="36px"
        />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-text">
          {productName}
        </p>
        <span className="shrink-0 text-sm font-bold text-text">
          {formatPrice(product.price)} {t("common.currency")}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          aria-label={t("product.add")}
          disabled={!product.inStock}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
