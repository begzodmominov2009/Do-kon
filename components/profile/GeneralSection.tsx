"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, HelpCircle, Info, Share2, Truck, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/ui/Toast";

// Real support account isn't wired up yet — this just opens Telegram.
const SUPPORT_TELEGRAM_URL = "https://t.me/";

type ModalKey = "delivery" | "about" | null;

function GeneralRow({
  icon,
  title,
  description,
  onClick,
  href,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text">{title}</span>
        <span className="block text-xs text-text-muted">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left"
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left"
    >
      {inner}
    </button>
  );
}

export function GeneralSection() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [modal, setModal] = useState<ModalKey>(null);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const nav = typeof navigator !== "undefined" ? navigator : undefined;

    if (nav?.share) {
      try {
        await nav.share({ title: t("common.siteName"), url });
      } catch {
        // user dismissed the native share sheet — nothing to do
      }
      return;
    }

    if (nav?.clipboard) {
      await nav.clipboard.writeText(url);
      showToast(t("profile.general.share.copiedToast"));
    }
  };

  return (
    <>
      <div className="divide-y divide-border rounded-card border border-border bg-surface">
        <GeneralRow
          icon={<Share2 className="h-5 w-5" />}
          title={t("profile.general.share.title")}
          description={t("profile.general.share.description")}
          onClick={handleShare}
        />
        <GeneralRow
          icon={<HelpCircle className="h-5 w-5" />}
          title={t("profile.general.contact.title")}
          description={t("profile.general.contact.description")}
          href={SUPPORT_TELEGRAM_URL}
        />
        <GeneralRow
          icon={<Truck className="h-5 w-5" />}
          title={t("profile.general.delivery.title")}
          description={t("profile.general.delivery.description")}
          onClick={() => setModal("delivery")}
        />
        <GeneralRow
          icon={<Info className="h-5 w-5" />}
          title={t("profile.general.about.title")}
          description={t("profile.general.about.description")}
          onClick={() => setModal("about")}
        />
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setModal(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-card bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-text">
                {modal === "delivery"
                  ? t("profile.general.delivery.title")
                  : t("profile.general.about.title")}
              </p>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label={t("common.close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-[1.6] text-text-muted">
              {modal === "delivery"
                ? t("profile.general.delivery.body")
                : t("profile.general.about.body")}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
