"use client";

import { PackageX } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ProductNotFound() {
  const { t } = useTranslation();

  return (
    <Container className="py-10">
      <EmptyState
        icon={<PackageX className="h-7 w-7" />}
        title={t("product.notFound.title")}
        description={t("product.notFound.description")}
        ctaLabel={t("product.notFound.cta")}
        ctaHref="/catalog"
      />
    </Container>
  );
}
