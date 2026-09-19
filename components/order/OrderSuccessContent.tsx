"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/formatPrice";

type OrderSuccessContentProps = {
  orderNumber: string;
  total: number;
  count: number;
};

export function OrderSuccessContent({ orderNumber, total, count }: OrderSuccessContentProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Container className="flex min-h-screen flex-col items-center justify-center gap-6 py-10 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.7)",
        }}
      >
        <Check className="h-10 w-10" />
      </div>

      <div>
        <h1 className="text-xl font-bold text-text">{t("order.success.title")}</h1>
        {orderNumber ? (
          <p className="mt-3 text-3xl font-bold text-accent">#{orderNumber}</p>
        ) : null}
        <p className="mt-2 text-sm text-text-muted">{t("order.success.subtitle")}</p>
      </div>

      {count > 0 ? (
        <div className="rounded-card border border-border bg-surface px-4 py-3 text-sm">
          <span className="text-text-muted">
            {count} {t("cart.itemsSuffix")}
          </span>
          <span className="mx-2 text-border">·</span>
          <span className="font-semibold text-text">
            {formatPrice(total)} {t("common.currency")}
          </span>
        </div>
      ) : null}

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Link href="/orders" className={buttonClasses()}>
          {t("profile.orders.sectionTitle")}
        </Link>
        <Link href="/" className={buttonClasses({ variant: "secondary" })}>
          {t("order.success.home")}
        </Link>
      </div>
    </Container>
  );
}
