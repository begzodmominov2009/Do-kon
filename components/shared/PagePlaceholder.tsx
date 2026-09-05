"use client";

import { Container } from "@/components/layout/Container";
import { useTranslation } from "@/lib/i18n";
import { SkeletonGrid } from "./SkeletonGrid";

type PagePlaceholderProps = {
  titleKey: string;
};

export function PagePlaceholder({ titleKey }: PagePlaceholderProps) {
  const { t } = useTranslation();

  return (
    <Container className="py-6">
      <h1 className="text-2xl font-semibold text-foreground">
        {t(titleKey)}
      </h1>
      <SkeletonGrid />
    </Container>
  );
}
