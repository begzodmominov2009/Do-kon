"use client";

import { useState } from "react";
import { MapPin, PackageX, Phone, Truck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useTranslation, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useOrdersStore, type Order, type OrderStatus } from "@/store/orders";

const LOCALE_TAG: Record<Locale, string> = {
  uz: "uz-UZ",
  en: "en-US",
  ru: "ru-RU",
};

function formatOrderDate(timestamp: number, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function StatusBadge({
  status,
  label,
}: {
  status: OrderStatus;
  label: string;
}) {
  if (status === "new") return <Badge variant="accent">{label}</Badge>;
  if (status === "delivered") return <Badge variant="success">{label}</Badge>;
  if (status === "cancelled") return <Badge variant="danger">{label}</Badge>;
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center rounded-chip bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-500">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-chip bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black dark:bg-amber-400">
      {label}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { t, locale } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visibleItems = order.items.slice(0, 2);
  const extraCount = order.items.length - visibleItems.length;

  return (
    <div className="rounded-card border border-border bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-3 p-4 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-text">#{order.number}</span>
          <StatusBadge status={order.status} label={t(`profile.orders.status.${order.status}`)} />
        </div>

        <p className="text-xs text-text-muted">{formatOrderDate(order.createdAt, locale)}</p>

        <div className="flex items-center gap-2">
          {visibleItems.map((item, index) => (
            <span
              key={index}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-surface-2 text-xl"
            >
              {item.emoji}
            </span>
          ))}
          <span className="min-w-0 flex-1 truncate text-sm text-text-muted">
            {visibleItems.map((item) => item.name).join(", ")}
            {extraCount > 0 ? ` +${extraCount} ${t("profile.orders.moreItemsSuffix")}` : ""}
          </span>
        </div>

        <p className="text-base font-bold text-accent">
          {formatPrice(order.total)} {t("common.currency")}
        </p>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-[240ms] ease-in-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 border-t border-border p-4">
            <div className="flex flex-col gap-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-surface-2 text-xl">
                    {item.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-text">{item.name}</span>
                  <span className="shrink-0 text-sm text-text-muted">x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 text-sm text-text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{order.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Truck className="h-4 w-4 shrink-0" />
              <span>{order.deliveryLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderHistory() {
  const { t } = useTranslation();
  const orders = useOrdersStore((state) => state.orders);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-card border border-dashed border-border py-8 text-center">
        <PackageX className="h-6 w-6 text-text-muted" />
        <p className="mt-1 text-sm font-medium text-text">{t("profile.orders.empty.title")}</p>
        <p className="text-xs text-text-muted">{t("profile.orders.empty.description")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
