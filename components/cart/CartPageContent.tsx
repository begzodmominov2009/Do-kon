"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShoppingBag } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductRail } from "@/components/shared/ProductRail";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { ToastViewport, useToast } from "@/components/ui/Toast";
import { useCartStore, useCartTotalCount, type ContactInfo } from "@/store/cart";
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

type CartPageContentProps = {
  suggestedProducts: Product[];
};

export function CartPageContent({ suggestedProducts }: CartPageContentProps) {
  const { t } = useTranslation();
  const items = useCartStore((state) => state.items);
  const contact = useCartStore((state) => state.contact);
  const totalCount = useCartTotalCount();
  const showToast = useToast();
  const [errors, setErrors] = useState<ContactErrors>({});
  const [checkoutLoading, setCheckoutLoading] = useState(true);

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

  const handleCheckout = () => {
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
    showToast(t("cart.checkoutToast"));
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
          {totalCount} {t("cart.itemsSuffix")}
        </span>
      </div>

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

      <CartSummary />

      <div className="flex items-center gap-3">
        <ClearCartButton />
        <Button type="button" size="lg" className="flex-1" onClick={handleCheckout}>
          {t("cart.checkout")}
        </Button>
      </div>

      <ToastViewport />
    </Container>
  );
}
