import { useTranslation } from "@/lib/i18n";

export function PromoBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-promo-banner rounded-card px-5 py-5 text-white">
      <p className="text-sm text-white/80">{t("home.promoBanner.label")}</p>
      <p className="mt-1 font-mono text-3xl font-bold tracking-wider">
        DEMO25
      </p>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-4 rounded-full bg-white" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
      </div>
    </div>
  );
}
