import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function SaleStrip() {
  const { t } = useTranslation();

  return (
    <div className="bg-sale-strip flex items-center justify-between gap-3 rounded-card px-4 py-3.5 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{t("home.sale.title")}</p>
          <p className="text-sm text-white/80">{t("home.sale.subtitle")}</p>
        </div>
      </div>
      <Link
        href="/catalog"
        className="flex shrink-0 items-center gap-0.5 rounded-chip bg-white px-3 py-1.5 text-sm font-medium text-text"
      >
        {t("common.viewAll")}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
