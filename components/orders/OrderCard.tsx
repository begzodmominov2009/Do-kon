"use client";

import { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Order, OrderStatus } from "@/store/orders";

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

function StatusBadge({ status, label }: { status: OrderStatus; label: string }) {
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

function DetailLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{children}</p>
  );
}

type OrderCardProps = {
  order: Order;
  isOpen: boolean;
  onToggle: () => void;
};

export function OrderCard({ order, isOpen, onToggle }: OrderCardProps) {
  const { t, locale } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const visibleItems = order.items.slice(0, 2);
  const extraCount = order.items.length - visibleItems.length;
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - (order.promoDiscount ?? 0) + order.deliveryPrice;

  const handleClose = () => {
    onToggle();
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={cardRef} className="rounded-card border border-border bg-surface">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className="flex w-full cursor-pointer flex-col gap-3 p-4 text-left"
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

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-bold text-accent">
            {formatPrice(total)} {t("common.currency")}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              {t("profile.orders.details")}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </span>
          </Button>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-[240ms] ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 border-t border-border p-4">
            <div className="flex flex-col gap-3">
              <DetailLabel>{t("profile.orders.detail.products")}</DetailLabel>
              <div className="flex flex-col gap-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-surface-2 text-xl">
                      {item.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{item.name}</p>
                      {item.colorName ? (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border border-border"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="text-xs text-text-muted">{item.colorName}</span>
                        </div>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm text-text-muted">x{item.quantity}</span>
                    <span className="shrink-0 text-sm font-medium text-text">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-1.5">
              <DetailLabel>{t("profile.orders.detail.delivery")}</DetailLabel>
              <p className="text-sm text-text">{order.deliveryLabel}</p>
              <p className="text-sm text-text-muted">
                {order.regionName}, {order.districtName}
              </p>
              <p className="text-sm text-text-muted">{order.address}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <DetailLabel>{t("profile.orders.detail.contact")}</DetailLabel>
              <p className="text-sm text-text">{order.fullName}</p>
              <p className="text-sm text-text-muted">{order.phone}</p>
            </div>

            {order.comment ? (
              <div className="flex flex-col gap-1.5">
                <DetailLabel>{t("profile.orders.detail.comment")}</DetailLabel>
                <p className="text-sm text-text-muted">{order.comment}</p>
              </div>
            ) : null}

            <div className="border-t border-border" />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{t("profile.orders.detail.subtotal")}</span>
                <span className="text-text">
                  {formatPrice(subtotal)} {t("common.currency")}
                </span>
              </div>
              {order.promoDiscount ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{t("profile.orders.detail.promo")}</span>
                  <span className="text-success">
                    -{formatPrice(order.promoDiscount)} {t("common.currency")}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">
                  {t("profile.orders.detail.deliveryPrice")}
                </span>
                <span className="text-text">
                  {order.deliveryPrice > 0
                    ? `${formatPrice(order.deliveryPrice)} ${t("common.currency")}`
                    : t("profile.orders.detail.free")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-text">{t("profile.orders.detail.total")}</span>
                <span className="text-accent">
                  {formatPrice(total)} {t("common.currency")}
                </span>
              </div>
            </div>

            <Button type="button" variant="ghost" fullWidth onClick={handleClose}>
              <span className="inline-flex items-center gap-1.5">
                {t("profile.orders.close")}
                <ChevronUp className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
