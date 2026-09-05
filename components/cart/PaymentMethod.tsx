"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Placeholder until wired to real account settings.
const CARD_LAST_DIGITS = "9248";

type PaymentOption = {
  id: string;
};

const PAYMENT_OPTIONS: PaymentOption[] = [{ id: "card" }];

export function PaymentMethod() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(PAYMENT_OPTIONS[0].id);

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {PAYMENT_OPTIONS.map((option) => {
        const selected = option.id === selectedId;
        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">
                {t(`cart.payment.${option.id}.title`)}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                •••• {CARD_LAST_DIGITS}
              </p>
            </div>
            <input
              type="radio"
              name="payment-method"
              checked={selected}
              onChange={() => setSelectedId(option.id)}
              aria-label={t(`cart.payment.${option.id}.title`)}
              className="h-5 w-5 shrink-0 accent-accent"
            />
          </label>
        );
      })}
    </div>
  );
}
