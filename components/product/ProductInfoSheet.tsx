"use client";

import { useState, type RefObject } from "react";
import { Flame, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductRail } from "@/components/shared/ProductRail";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { i18nField } from "@/lib/utils/i18nField";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Product } from "@/lib/types/product";
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
  const { t, locale } = useTranslation();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const oldPrice = product.oldPrice;
  const discountPercent = oldPrice
    ? Math.round((1 - product.price / oldPrice) * 100)
    : null;
  const savedAmount = oldPrice ? oldPrice - product.price : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="relative z-10 -mt-7 rounded-t-[28px] bg-bg pb-[calc(96px+env(safe-area-inset-bottom))]">
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />

      <Container className="pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.category ? (
            <Badge variant="accent" size="tag">
              {i18nField(product.category.name, locale)}
            </Badge>
          ) : null}
          {isOutOfStock ? (
            <Badge variant="danger-soft" size="tag">
              {t("product.availability.outOfStock")}
            </Badge>
          ) : isLowStock ? (
            <Badge
              variant="warning-soft"
              size="tag"
              icon={<Flame className="h-[13px] w-[13px]" aria-hidden />}
            >
              {t("product.lowStock.tag", { count: product.stock })}
            </Badge>
          ) : (
            <Badge variant="success-soft" size="tag">
              {t("product.availability.inStock")}
            </Badge>
          )}
        </div>

        <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.02em] text-text">
          {i18nField(product.name, locale)}
        </h1>

        <div className="mt-2 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-bold tracking-[-0.02em] text-text">
              {formatPrice(product.price)}
            </span>
            <span className="text-[15px] font-medium text-text-muted">
              {t("common.currency")}
            </span>
          </div>

          {oldPrice && discountPercent ? (
            <div className="flex items-center gap-2.5">
              <span className="text-base text-text-muted line-through">
                {formatPrice(oldPrice)}
              </span>
              <Badge variant="danger" size="discount">
                −{discountPercent}%
              </Badge>
            </div>
          ) : null}

          {oldPrice && savedAmount > 0 ? (
            <div className="inline-flex w-fit items-center gap-1.5 rounded-[10px] bg-success/12 px-3 py-2 text-[13.5px] font-medium text-success">
              <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                {t("product.savingsPrefix")} {formatPrice(savedAmount)} {t("common.currency")}{" "}
                {t("product.savingsSuffix")}
              </span>
            </div>
          ) : null}
        </div>

        {isLowStock ? (
          <div className="mt-5 flex items-start gap-3 rounded-[12px] bg-warning/10 px-3.5 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
              <Flame className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">
                {t("product.lowStock.bannerTitle", { count: product.stock })}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {t("product.lowStock.bannerSubtitle")}
              </p>
            </div>
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
            className={`text-[15px] leading-[1.65] text-text ${
              descriptionExpanded ? "" : "line-clamp-4"
            }`}
          >
            {i18nField(product.description, locale)}
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
            <div key={spec.id} className="flex items-baseline gap-2 text-sm">
              <dt className="shrink-0 text-text-muted">
                {i18nField(spec.label, locale)}
              </dt>
              <div className="flex-1 border-b border-dotted border-border" />
              <dd className="shrink-0 text-text">{i18nField(spec.value, locale)}</dd>
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
