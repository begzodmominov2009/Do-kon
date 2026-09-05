"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductRail } from "@/components/shared/ProductRail";
import { products, saleProducts } from "@/lib/mock/products";
import { PromoBanner } from "./PromoBanner";
import { CategoryCircles } from "./CategoryCircles";
import { SaleStrip } from "./SaleStrip";

export function HomeContent() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container className="flex flex-col gap-7 py-4">
      <PromoBanner />

      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<LayoutGrid className="h-5 w-5" />}
          title={t("home.categories.title")}
        />
        <CategoryCircles />
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<Sparkles className="h-5 w-5" />}
          title={t("home.recommended.title")}
          viewAllHref="/catalog"
        />
        <ProductRail products={products} loading={loading} />
      </div>

      <div className="flex flex-col gap-3">
        <SaleStrip />
        <ProductRail products={saleProducts} loading={loading} />
      </div>
    </Container>
  );
}
