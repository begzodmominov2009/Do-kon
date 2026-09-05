import { Home, Shirt, Smartphone, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { categories } from "@/lib/mock/products";

const iconByCategory = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
} as const;

export function CategoryCircles() {
  const { t } = useTranslation();

  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
      {categories.map((category) => {
        const Icon = iconByCategory[category.icon];
        return (
          <div
            key={category.id}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-text">
              <Icon className="h-5.5 w-5.5" />
            </div>
            <span className="text-center text-xs text-text-muted">
              {t(`home.categories.${category.id}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
