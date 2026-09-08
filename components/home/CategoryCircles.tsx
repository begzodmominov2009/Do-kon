"use client";

import { Home, Shirt, Smartphone, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { i18nField } from "@/lib/utils/i18nField";
import type { Category } from "@/lib/types/product";

const iconByCategory: Record<string, LucideIcon> = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
};

type CategoryCirclesProps = {
  categories: Category[];
};

export function CategoryCircles({ categories }: CategoryCirclesProps) {
  const { locale } = useTranslation();

  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
      {categories.map((category) => {
        const Icon = iconByCategory[category.icon] ?? Sparkles;
        return (
          <div
            key={category.id}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-text">
              <Icon className="h-5.5 w-5.5" />
            </div>
            <span className="text-center text-xs text-text-muted">
              {i18nField(category.name, locale)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
