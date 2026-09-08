"use client";

import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { buttonClasses } from "@/components/ui/Button";

type DataErrorProps = {
  onRetry: () => void;
};

// Shared "couldn't load data" state — used by route-level error boundaries
// and by client components that fetch from the API route themselves.
export function DataError({ onRetry }: DataErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div>
        <p className="font-semibold text-text">{t("common.error.title")}</p>
        <p className="mt-1 text-sm text-text-muted">{t("common.error.description")}</p>
      </div>
      <button type="button" onClick={onRetry} className={buttonClasses()}>
        {t("common.error.retry")}
      </button>
    </div>
  );
}
