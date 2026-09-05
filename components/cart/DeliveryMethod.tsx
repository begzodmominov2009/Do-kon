"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";

type DeliveryOption = {
  id: string;
  price: number;
};

const DELIVERY_OPTIONS: DeliveryOption[] = [{ id: "bts", price: 0 }];

export function DeliveryMethod() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(DELIVERY_OPTIONS[0].id);

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {DELIVERY_OPTIONS.map((option) => {
        const selected = option.id === selectedId;
        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Truck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">
                {t(`cart.delivery.${option.id}.title`)}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {t(`cart.delivery.${option.id}.description`)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-text-muted">
                {t("cart.delivery.priceLabel")}
              </p>
              <p className="text-sm font-bold text-text">
                {formatPrice(option.price)} {t("common.currency")}
              </p>
            </div>
            <input
              type="radio"
              name="delivery-method"
              checked={selected}
              onChange={() => setSelectedId(option.id)}
              aria-label={t(`cart.delivery.${option.id}.title`)}
              className="h-5 w-5 shrink-0 accent-accent"
            />
          </label>
        );
      })}
    </div>
  );
}
