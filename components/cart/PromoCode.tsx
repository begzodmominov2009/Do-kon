"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";
import { useCartStore } from "@/store/cart";

export function PromoCode() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const promo = useCartStore((state) => state.promo);
  const applyPromo = useCartStore((state) => state.applyPromo);
  const clearPromo = useCartStore((state) => state.clearPromo);

  if (promo.status === "ok") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-input border border-success/30 bg-success/10 px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm text-success">
          <Check className="h-4 w-4" />
          <span className="font-mono font-semibold">{promo.code}</span>
          <span>{t("cart.promo.appliedSuffix")}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            clearPromo();
            setCode("");
          }}
          className="text-sm text-text-muted underline"
        >
          {t("cart.promo.cancel")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={t("cart.promo.placeholder")}
          disabled={promo.status === "loading"}
        />
        <Button
          type="button"
          disabled={promo.status === "loading" || code.trim().length === 0}
          onClick={() => applyPromo(code)}
        >
          {promo.status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("cart.promo.apply")
          )}
        </Button>
      </div>
      {promo.status === "error" ? (
        <p className="mt-1.5 text-sm text-danger">{t("cart.promo.invalid")}</p>
      ) : null}
    </div>
  );
}
