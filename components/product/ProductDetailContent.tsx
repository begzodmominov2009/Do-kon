"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types/product";
import { ProductGallery } from "./ProductGallery";
import { CompactHeader } from "./CompactHeader";
import { ProductInfoSheet } from "./ProductInfoSheet";
import { ProductActionBar } from "./ProductActionBar";

const COMPACT_HEADER_THRESHOLD = 200;
const OVERLAY_SCROLL_RANGE = 300;
const SHAKE_SEQUENCE = [-8, 8, -6, 6, -3, 3, 0];

function getDefaultColorId(product: Product): string | undefined {
  return product.colors?.find((color) => color.inStock)?.id;
}

type ProductDetailContentProps = {
  product: Product;
  similar: Product[];
};

export function ProductDetailContent({
  product,
  similar,
}: ProductDetailContentProps) {
  const [scrollY, setScrollY] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState(() =>
    getDefaultColorId(product),
  );
  const [shakeX, setShakeX] = useState(0);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const overlayOpacity = Math.min(scrollY / OVERLAY_SCROLL_RANGE, 1) * 0.5;
  const compactHeaderVisible = scrollY > COMPACT_HEADER_THRESHOLD;

  const requireColor = () => {
    if (!product.colors || product.colors.length === 0) return true;
    if (selectedColorId) return true;
    colorPickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    SHAKE_SEQUENCE.forEach((x, index) => {
      window.setTimeout(() => setShakeX(x), index * 50);
    });
    return false;
  };

  return (
    <div>
      <ProductGallery product={product} overlayOpacity={overlayOpacity} />
      <CompactHeader
        product={product}
        visible={compactHeaderVisible}
        colorId={selectedColorId}
        onRequireColor={requireColor}
      />
      <ProductInfoSheet
        product={product}
        similar={similar}
        selectedColorId={selectedColorId}
        onSelectColor={setSelectedColorId}
        colorPickerRef={colorPickerRef}
        shakeX={shakeX}
      />
      <ProductActionBar
        product={product}
        colorId={selectedColorId}
        onRequireColor={requireColor}
      />
    </div>
  );
}
