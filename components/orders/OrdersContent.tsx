"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChipRow, type ChipItem } from "@/components/catalog/ChipRow";
import { useOrdersStore, type Order } from "@/store/orders";
import { OrderCard } from "./OrderCard";

type FilterId = "all" | "active" | "delivered" | "cancelled";

function matchesFilter(order: Order, filter: FilterId): boolean {
  if (filter === "all") return true;
  if (filter === "delivered") return order.status === "delivered";
  if (filter === "cancelled") return order.status === "cancelled";
  return order.status === "new" || order.status === "accepted" || order.status === "shipping";
}

export function OrdersContent() {
  const { t } = useTranslation();
  const orders = useOrdersStore((state) => state.orders);
  const [filter, setFilter] = useState<FilterId>("all");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const filterItems: ChipItem[] = [
    { id: "all", label: t("profile.orders.filter.all") },
    { id: "active", label: t("profile.orders.filter.active") },
    { id: "delivered", label: t("profile.orders.filter.delivered") },
    { id: "cancelled", label: t("profile.orders.filter.cancelled") },
  ];

  const filteredOrders = orders.filter((order) => matchesFilter(order, filter));

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
        <ChipRow
          items={filterItems}
          activeId={filter}
          onSelect={(id) => setFilter(id as FilterId)}
        />

        {orders.length === 0 ? (
          <EmptyState
            icon={<PackageX className="h-7 w-7" />}
            title={t("profile.orders.empty.title")}
            description={t("profile.orders.empty.description")}
            ctaLabel={t("profile.orders.empty.cta")}
            ctaHref="/catalog"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.map((order) => (
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
        )}
      </Container>
    </div>
  );
}
