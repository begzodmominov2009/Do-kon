import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  viewAllHref?: string;
};

export function SectionHeader({
  icon,
  title,
  description,
  viewAllHref,
}: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-text">{title}</p>
          {description ? (
            <p className="text-sm text-text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="flex shrink-0 items-center gap-0.5 text-sm text-text-muted"
        >
          {t("common.viewAll")}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
