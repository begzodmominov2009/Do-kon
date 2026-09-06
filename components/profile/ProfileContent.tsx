"use client";

import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { ToastViewport } from "@/components/ui/Toast";
import { ProfileCard } from "./ProfileCard";
import { ProfileStats } from "./ProfileStats";
import { ProfileSectionLabel } from "./ProfileSectionLabel";
import { LanguageSetting } from "./LanguageSetting";
import { ThemeSetting } from "./ThemeSetting";
import { OrderHistory } from "./OrderHistory";
import { GeneralSection } from "./GeneralSection";

export function ProfileContent() {
  const { t } = useTranslation();

  return (
    <Container className="flex flex-col gap-7 py-4 pb-8">
      <h1 className="text-xl font-bold text-text">{t("profile.title")}</h1>

      <ProfileCard />
      <ProfileStats />

      <div>
        <ProfileSectionLabel>{t("profile.settings.sectionTitle")}</ProfileSectionLabel>
        <div className="divide-y divide-border rounded-card border border-border bg-surface">
          <LanguageSetting />
          <ThemeSetting />
        </div>
      </div>

      <div>
        <ProfileSectionLabel>{t("profile.orders.sectionTitle")}</ProfileSectionLabel>
        <OrderHistory />
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
