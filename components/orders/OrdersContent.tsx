"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrdersStore } from "@/store/orders";
import { OrderCard } from "./OrderCard";

export function OrdersContent() {
  const { t } = useTranslation();
  const orders = useOrdersStore((state) => state.orders);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-border bg-bg">
        <Container className="flex items-center gap-3 py-3.5">
          <Link
            href="/profile"
            aria-label={t("product.back")}
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-text" />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold text-text">
            {t("profile.orders.sectionTitle")}
          </h1>
          <span className="w-11 shrink-0 text-right text-sm text-text-muted">
            {orders.length}
          </span>
        </Container>
      </div>

      <Container className="flex flex-col gap-4 py-4">
        <p className="text-center text-xs text-text-muted">
          {t("profile.orders.deviceNotice")}
        </p>

        {orders.length === 0 ? (
          <EmptyState
            icon={<PackageX className="h-7 w-7" />}
            title={t("profile.orders.empty.title")}
            description={t("profile.orders.empty.description")}
            ctaLabel={t("profile.orders.empty.cta")}
            ctaHref="/catalog"
          />
        ) : (
          <>
            <p className="text-sm text-text-muted">
              {orders.length} {t("profile.myOrders.itemsSuffix")}
            </p>
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isOpen={openOrderId === order.id}
                  onToggle={() =>
                    setOpenOrderId((prev) => (prev === order.id ? null : order.id))
                  }
                />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
