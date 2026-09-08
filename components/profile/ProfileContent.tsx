"use client";

import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { ToastViewport } from "@/components/ui/Toast";
import { useOrdersStore } from "@/store/orders";
import { ProfileCard } from "./ProfileCard";
import { ProfileStats } from "./ProfileStats";
import { ProfileSectionLabel } from "./ProfileSectionLabel";
import { LanguageSetting } from "./LanguageSetting";
import { ThemeSetting } from "./ThemeSetting";
import { GeneralSection } from "./GeneralSection";

export function ProfileContent() {
  const { t } = useTranslation();
  const ordersCount = useOrdersStore((state) => state.orders.length);

  return (
    <Container className="flex flex-col gap-7 py-4 pb-8">
      <h1 className="text-xl font-bold text-text">{t("profile.title")}</h1>

      <ProfileCard />
      <ProfileStats />

      <Link
        href="/orders"
        className="flex min-h-11 items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted">
          <FileText className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-text">
            {t("profile.orders.sectionTitle")}
          </span>
          <span className="block text-xs text-text-muted">
            {ordersCount} {t("profile.myOrders.itemsSuffix")}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
      </Link>

      <div>
        <ProfileSectionLabel>{t("profile.settings.sectionTitle")}</ProfileSectionLabel>
        <div className="divide-y divide-border rounded-card border border-border bg-surface">
          <LanguageSetting />
          <ThemeSetting />
        </div>
      </div>

      <div>
        <ProfileSectionLabel>{t("profile.general.sectionTitle")}</ProfileSectionLabel>
        <GeneralSection />
      </div>

      <p className="text-center text-xs text-text-muted">
        {t("common.siteName")} · {t("profile.footer.version")}
      </p>

      <ToastViewport />
    </Container>
  );
}
