"use client";

import { useState, type RefObject } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductRail } from "@/components/shared/ProductRail";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Product } from "@/lib/mock/products";
import { ColorPicker } from "./ColorPicker";

type ProductInfoSheetProps = {
  product: Product;
  similar: Product[];
  selectedColorId: string | undefined;
  onSelectColor: (id: string) => void;
  colorPickerRef: RefObject<HTMLDivElement | null>;
  shakeX: number;
};

export function ProductInfoSheet({
  product,
  similar,
  selectedColorId,
  onSelectColor,
  colorPickerRef,
  shakeX,
}: ProductInfoSheetProps) {
  const { t } = useTranslation();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const discountPercent = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;
  const savedAmount = product.oldPrice ? product.oldPrice - product.price : 0;

  return (
    <div className="relative z-10 -mt-7 rounded-t-[28px] bg-bg pb-[calc(96px+env(safe-area-inset-bottom))]">
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />

      <Container className="pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">
            {t(`home.categories.${product.categoryId}`)}
          </Badge>
          <Badge variant={product.inStock ? "success" : "danger"}>
            {t(
              product.inStock
                ? "product.availability.inStock"
                : "product.availability.outOfStock",
            )}
          </Badge>
        </div>

        <h1 className="mt-3 text-[26px] font-bold leading-tight text-text">
          {product.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-[30px] font-bold text-text">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-text-muted">{t("common.currency")}</span>
          {product.oldPrice ? (
            <span className="text-sm text-text-muted line-through">
              {formatPrice(product.oldPrice)}
            </span>
          ) : null}
          {discountPercent ? <Badge variant="danger">-{discountPercent}%</Badge> : null}
        </div>

        {savedAmount > 0 ? (
          <div className="mt-3 inline-flex items-center rounded-chip bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
            {t("product.savingsPrefix")} {formatPrice(savedAmount)}{" "}
            {t("common.currency")} {t("product.savingsSuffix")}
          </div>
        ) : null}

        {product.colors && product.colors.length > 0 ? (
          <div className="mt-5">
            <ColorPicker
              ref={colorPickerRef}
              colors={product.colors}
              selectedId={selectedColorId}
              onSelect={onSelectColor}
              shakeX={shakeX}
            />
          </div>
        ) : null}

        <div className="my-5 border-t border-border" />

        <div>
          <p
            className={`text-[15px] leading-[1.6] text-text ${
              descriptionExpanded ? "" : "line-clamp-4"
            }`}
          >
            {product.description}
          </p>
          <button
            type="button"
            onClick={() => setDescriptionExpanded((prev) => !prev)}
            className="mt-1 text-sm font-medium text-accent"
          >
            {t(descriptionExpanded ? "product.showLess" : "product.showMore")}
          </button>
        </div>

        <div className="my-5 border-t border-border" />

        <dl className="flex flex-col gap-3">
          {product.specs.map((spec) => (
            <div key={spec.key} className="flex items-baseline gap-2 text-sm">
              <dt className="shrink-0 text-text-muted">
                {t(`product.specs.${spec.key}`)}
              </dt>
              <div className="flex-1 border-b border-dotted border-border" />
              <dd className="shrink-0 text-text">{spec.value}</dd>
            </div>
          ))}
        </dl>

        {similar.length > 0 ? (
          <>
            <div className="my-5 border-t border-border" />
            <div className="flex flex-col gap-3">
              <SectionHeader
                icon={<Sparkles className="h-5 w-5" />}
                title={t("product.similar.title")}
              />
              <ProductRail products={similar} />
            </div>
          </>
        ) : null}
      </Container>
    </div>
  );
}
