import { useTranslation } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatPrice";
import {
  useCartStore,
  useCartSavedAmount,
  useCartSubtotal,
  useCartTotal,
  useCartTotalCount,
} from "@/store/cart";

export function CartSummary() {
  const { t } = useTranslation();
  const totalCount = useCartTotalCount();
  const subtotal = useCartSubtotal();
  const savedAmount = useCartSavedAmount();
  const promo = useCartStore((state) => state.promo);
  const total = useCartTotal();

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4 text-sm">
      <p className="text-text">
        {totalCount} {t("cart.itemsSuffix")}
      </p>

      {savedAmount > 0 ? (
        <p className="text-success">
          {t("cart.summary.saved")}: {formatPrice(savedAmount)}{" "}
          {t("common.currency")}
        </p>
      ) : null}

      <div className="flex items-center justify-between">
        <span className="text-text-muted">{t("cart.summary.products")}</span>
        <span className="text-text">
          {formatPrice(subtotal)} {t("common.currency")}
        </span>
      </div>

      {promo.status === "ok" ? (
        <div className="flex items-center justify-between">
          <span className="text-text-muted">{t("cart.summary.promo")}</span>
          <span className="text-success">
            −{formatPrice(promo.discount)} {t("common.currency")}
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <span className="text-text-muted">{t("cart.summary.delivery")}</span>
        <span className="text-text">0 {t("common.currency")}</span>
      </div>

      <div className="my-1 border-t border-border" />

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-text">
          {t("cart.summary.total")}
        </span>
        <span className="text-lg font-bold text-accent">
          {formatPrice(total)} {t("common.currency")}
        </span>
      </div>
    </div>
  );
}
