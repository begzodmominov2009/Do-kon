"use client";

import { LayoutGrid, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductRail } from "@/components/shared/ProductRail";
import type { Category, Product } from "@/lib/types/product";
import { PromoBanner } from "./PromoBanner";
import { CategoryCircles } from "./CategoryCircles";
import { SaleStrip } from "./SaleStrip";

type HomeContentProps = {
  categories: Category[];
  products: Product[];
  saleProducts: Product[];
};

export function HomeContent({ categories, products, saleProducts }: HomeContentProps) {
  const { t } = useTranslation();

  return (
    <Container className="flex flex-col gap-7 py-4">
      <PromoBanner />

      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<LayoutGrid className="h-5 w-5" />}
          title={t("home.categories.title")}
        />
        <CategoryCircles categories={categories} />
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<Sparkles className="h-5 w-5" />}
          title={t("home.recommended.title")}
          viewAllHref="/catalog"
        />
        <ProductRail products={products} />
      </div>

      <div className="flex flex-col gap-3">
        <SaleStrip />
        <ProductRail products={saleProducts} />
      </div>
    </Container>
  );
}
