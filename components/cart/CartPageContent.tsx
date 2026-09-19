"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShoppingBag } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductRail } from "@/components/shared/ProductRail";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { ToastViewport } from "@/components/ui/Toast";
import { useCartStore, type ContactInfo } from "@/store/cart";
import { useOrdersStore } from "@/store/orders";
import { regions } from "@/lib/data/regions";
import { i18nField } from "@/lib/utils/i18nField";
import type { Product } from "@/lib/types/product";
import { CartRow } from "./CartRow";
import { SectionLabel } from "./SectionLabel";
import { DeliveryMethod } from "./DeliveryMethod";
import { DeliveryMethodSkeleton } from "./DeliveryMethodSkeleton";
import { PaymentMethod } from "./PaymentMethod";
import { ContactForm, validateContact, type ContactErrors } from "./ContactForm";
import { ContactFormSkeleton } from "./ContactFormSkeleton";
import { PromoCode } from "./PromoCode";
import { CartSummary } from "./CartSummary";
import { ClearCartButton } from "./ClearCartButton";

const FIELD_ORDER: (keyof ContactInfo)[] = [
  "fullName",
  "phone",
  "regionId",
  "districtId",
  "address",
];

type OrderApiResponse =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; error: string; detail?: string };

type CartPageContentProps = {
  suggestedProducts: Product[];
};

export function CartPageContent({ suggestedProducts }: CartPageContentProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const contact = useCartStore((state) => state.contact);
  const promo = useCartStore((state) => state.promo);
  const clearCartAfterOrder = useCartStore((state) => state.clearAfterOrder);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCheckoutLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const clearError = (field: keyof ContactInfo) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const mapOrderError = (error: string): string => {
    if (error === "out_of_stock") return t("cart.checkoutErrors.outOfStock");
    if (error === "promo_invalid") return t("cart.checkoutErrors.promoInvalid");
    if (error === "validation") return t("cart.checkoutErrors.validation");
    return t("cart.checkoutErrors.generic");
  };

  const handleCheckout = async () => {
    if (submitting) return;

    const validationErrors = validateContact(contact, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = FIELD_ORDER.find(
        (field) => validationErrors[field],
      );
      if (firstErrorField) {
        document
          .getElementById(`contact-${firstErrorField}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});
    setSubmitError(null);

    const region = regions.find((entry) => entry.id === contact.regionId);
    const district = region?.districts.find((entry) => entry.id === contact.districtId);
    const regionName = region?.name ?? contact.regionId;
    const districtName = district?.name ?? contact.districtId;

    setSubmitting(true);
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            colorId: item.colorId,
            qty: item.quantity,
          })),
          customer: {
            name: contact.fullName,
            phone: contact.phone,
            region: regionName,
            district: districtName,
            street: contact.address,
            note: contact.comment.trim() || undefined,
          },
          promoCode: promo.status === "ok" ? promo.code : undefined,
        }),
      });

      const data = (await response.json()) as OrderApiResponse;

      if (!data.ok) {
        setSubmitError(mapOrderError(data.error));
        return;
      }

      // Full order snapshot for the local order history (see store/orders.ts —
      // web users aren't identifiable, so this stays device-local for now).
      addOrder({
        number: data.orderNumber,
        items: items.map((item) => ({
          productId: item.productId,
          name: i18nField(item.name, locale),
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          colorName: item.colorName ? i18nField(item.colorName, locale) : undefined,
          colorHex: item.colorHex,
        })),
        deliveryPrice: 0,
        promoDiscount: promo.status === "ok" ? promo.discount : undefined,
        fullName: contact.fullName,
        phone: `+998${contact.phone}`,
        regionName,
        districtName,
        address: contact.address,
        deliveryLabel: t("cart.delivery.bts.title"),
        comment: contact.comment.trim() || undefined,
      });

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      clearCartAfterOrder();

      const params = new URLSearchParams({
        number: data.orderNumber,
        total: String(data.total),
        count: String(itemCount),
      });
      router.push(`/order/success?${params.toString()}`);
    } catch {
      setSubmitError(t("cart.checkout.errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="flex flex-col gap-7 py-4">
        <h1 className="text-xl font-bold text-text">{t("cart.title")}</h1>
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title={t("cart.empty.title")}
          description={t("cart.empty.description")}
          ctaLabel={t("cart.empty.cta")}
          ctaHref="/"
        />
        <div className="flex flex-col gap-3">
          <SectionHeader
            icon={<Sparkles className="h-5 w-5" />}
            title={t("cart.suggestions.title")}
          />
          <ProductRail products={suggestedProducts} />
        </div>
        <ToastViewport />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6 py-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-text">{t("cart.title")}</h1>
        <span className="text-sm text-text-muted">
          {items.length} {t("cart.itemsSuffix")}
        </span>
      </div>

      <fieldset
        disabled={submitting}
        className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0"
      >
        <div>
          <SectionLabel>{t("cart.sectionProducts")}</SectionLabel>
          <div className="divide-y divide-border">
            {items.map((item) => (
              <CartRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>{t("cart.sections.delivery")}</SectionLabel>
          {checkoutLoading ? <DeliveryMethodSkeleton /> : <DeliveryMethod />}
        </div>

        <div>
          <SectionLabel>{t("cart.sections.payment")}</SectionLabel>
          {checkoutLoading ? (
            <DeliveryMethodSkeleton showPrice={false} />
          ) : (
            <PaymentMethod />
          )}
        </div>

        <div>
          <SectionLabel>{t("cart.sections.contact")}</SectionLabel>
          {checkoutLoading ? (
            <ContactFormSkeleton />
          ) : (
            <ContactForm errors={errors} onClearError={clearError} />
          )}
        </div>

        <div>
          <SectionLabel>{t("cart.sections.promo")}</SectionLabel>
          <PromoCode />
        </div>
      </fieldset>

      <CartSummary />

      {submitError ? (
        <p className="text-center text-sm text-danger">{submitError}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <ClearCartButton />
        <Button
          type="button"
          size="lg"
          className="flex-1"
          loading={submitting}
          disabled={submitting}
          onClick={handleCheckout}
        >
          {t("cart.checkout")}
        </Button>
      </div>

      <ToastViewport />
    </Container>
  );
}
