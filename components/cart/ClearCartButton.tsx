"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";

export function ClearCartButton() {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clear = useCartStore((state) => state.clear);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label={t("cart.clear.button")}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-danger/10 text-danger"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cart-title"
        >
          <div className="w-full max-w-xs rounded-card bg-surface p-5 text-center">
            <p id="clear-cart-title" className="font-semibold text-text">
              {t("cart.clear.title")}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {t("cart.clear.description")}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setConfirmOpen(false)}
              >
                {t("cart.clear.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={() => {
                  clear();
                  setConfirmOpen(false);
                }}
              >
                {t("cart.clear.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
