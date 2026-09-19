"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useCartStore, type PromoErrorReason } from "@/store/cart";

function useReasonMessage(reason: PromoErrorReason | null, minOrder: number | null) {
  const { t } = useTranslation();
  if (!reason) return "";
  if (reason === "not_found") return t("cart.promo.errors.notFound");
  if (reason === "inactive") return t("cart.promo.errors.inactive");
  if (reason === "expired") return t("cart.promo.errors.expired");
  if (reason === "limit") return t("cart.promo.errors.limit");
  if (reason === "min_order") {
    return [
      t("cart.promo.errors.minOrderPrefix"),
      `${formatPrice(minOrder ?? 0)} ${t("common.currency")}`,
      t("cart.promo.errors.minOrderSuffix"),
    ]
      .filter(Boolean)
      .join(" ");
  }
  return t("cart.promo.invalid");
}

export function PromoCode() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [code, setCode] = useState("");
  const promo = useCartStore((state) => state.promo);
  const applyPromo = useCartStore((state) => state.applyPromo);
  const clearPromo = useCartStore((state) => state.clearPromo);
  const reasonMessage = useReasonMessage(promo.reason, promo.minOrder);
  const previousStatusRef = useRef(promo.status);

  useEffect(() => {
    if (previousStatusRef.current === "ok" && promo.status === "error") {
      showToast(`${t("cart.promo.removedToast")}: ${reasonMessage}`);
    }
    previousStatusRef.current = promo.status;
  }, [promo.status, reasonMessage, showToast, t]);

  if (promo.status === "ok") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-input border border-success/30 bg-success/10 px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm text-success">
          <Check className="h-4 w-4" />
          <span className="font-mono font-semibold">{promo.code}</span>
          <span>{t("cart.promo.appliedSuffix")}</span>
          <span className="font-semibold">
            · −{formatPrice(promo.discount)} {t("common.currency")}
          </span>
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
          onChange={(event) => setCode(event.target.value.toUpperCase())}
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
        <p className="mt-1.5 text-sm text-danger">{reasonMessage}</p>
      ) : null}
    </div>
  );
}
