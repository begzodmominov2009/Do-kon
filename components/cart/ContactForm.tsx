"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
  FileText,
  Home,
  MapPin,
  MapPinned,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Select } from "@/components/ui/Select";
import { regions } from "@/lib/data/regions";
import { useCartStore, type ContactInfo } from "@/store/cart";

export type ContactErrors = Partial<Record<keyof ContactInfo, string>>;

type ContactFormProps = {
  errors: ContactErrors;
  onClearError: (field: keyof ContactInfo) => void;
};

function formatPhoneDigits(digits: string): string {
  let result = "";
  if (digits.length > 0) result += `(${digits.slice(0, 2)}`;
  if (digits.length >= 2) result += ")";
  if (digits.length > 2) result += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) result += `-${digits.slice(5, 7)}`;
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`;
  return result;
}

export function validateContact(
  contact: ContactInfo,
  t: (key: string) => string,
): ContactErrors {
  const errors: ContactErrors = {};
  if (contact.fullName.trim().length < 2) {
    errors.fullName = t("cart.contact.errors.fullName");
  }
  if (contact.phone.length !== 9) {
    errors.phone = t("cart.contact.errors.phone");
  }
  if (!contact.regionId) {
    errors.regionId = t("cart.contact.errors.region");
  }
  if (!contact.districtId) {
    errors.districtId = t("cart.contact.errors.district");
  }
  if (contact.address.trim().length === 0) {
    errors.address = t("cart.contact.errors.address");
  }
  return errors;
}

// Shared icon + row-highlight-on-focus wrapper for the form's plain text fields.
// Select renders its own row internally, so it doesn't use this wrapper.
function FormField({
  icon: Icon,
  fieldId,
  errorMessage,
  children,
}: {
  icon: LucideIcon;
  fieldId: string;
  errorMessage?: string;
  children: ReactNode;
}) {
  const hasError = Boolean(errorMessage);
  const errorId = hasError ? `${fieldId}-error` : undefined;

  return (
    <div className="flex flex-col">
      <div
        className={`group flex items-center gap-3 rounded-input px-4 py-3 transition-colors duration-150 ${
          hasError ? "bg-danger/8" : "focus-within:bg-surface-2"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 transition-colors duration-150 ${
            hasError ? "text-text-muted" : "text-text-muted group-focus-within:text-accent"
          }`}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {hasError ? (
        <p id={errorId} className="px-4 pb-1 text-xs text-danger">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

const bareFieldClass =
  "w-full appearance-none border-0 bg-transparent text-sm text-text outline-none placeholder:text-text-muted";

export function ContactForm({ errors, onClearError }: ContactFormProps) {
  const { t } = useTranslation();
  const contact = useCartStore((state) => state.contact);
  const setContactField = useCartStore((state) => state.setContactField);

  const selectedRegion = regions.find(
    (region) => region.id === contact.regionId,
  );

  const handleChange =
    (field: keyof ContactInfo) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setContactField(field, event.target.value);
      onClearError(field);
    };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
    setContactField("phone", digits);
    onClearError("phone");
  };

  const handleSelectChange = (field: keyof ContactInfo) => (value: string) => {
    setContactField(field, value);
    onClearError(field);
  };

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      <FormField icon={User} fieldId="contact-fullName" errorMessage={errors.fullName}>
        <input
          id="contact-fullName"
          type="text"
          value={contact.fullName}
          onChange={handleChange("fullName")}
          aria-label={t("cart.contact.fullName")}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "contact-fullName-error" : undefined}
          placeholder={t("cart.contact.fullName")}
          className={`h-6 ${bareFieldClass}`}
        />
      </FormField>

      <FormField icon={Phone} fieldId="contact-phone" errorMessage={errors.phone}>
        <div className="flex h-6 items-center gap-2">
          <span className="shrink-0 text-sm text-text-muted">+998</span>
          <input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            value={formatPhoneDigits(contact.phone)}
            onChange={handlePhoneChange}
            aria-label={t("cart.contact.phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            placeholder="(90) 123-45-67"
            className={`min-w-0 flex-1 ${bareFieldClass}`}
          />
        </div>
      </FormField>

      <Select
        icon={MapPin}
        label={t("cart.contact.region")}
        placeholder={t("cart.contact.region")}
        value={contact.regionId}
        options={regions.map((region) => ({ value: region.id, label: region.name }))}
        onChange={handleSelectChange("regionId")}
        errorMessage={errors.regionId}
      />

      <Select
        icon={MapPinned}
        label={t("cart.contact.district")}
        placeholder={t("cart.contact.district")}
        disabledPlaceholder={t("cart.contact.districtPlaceholder")}
        value={contact.districtId}
        options={(selectedRegion?.districts ?? []).map((district) => ({
          value: district.id,
          label: district.name,
        }))}
        onChange={handleSelectChange("districtId")}
        disabled={!selectedRegion}
        errorMessage={errors.districtId}
      />

      <FormField icon={Home} fieldId="contact-address" errorMessage={errors.address}>
        <input
          id="contact-address"
          type="text"
          value={contact.address}
          onChange={handleChange("address")}
          aria-label={t("cart.contact.address")}
          aria-invalid={Boolean(errors.address)}
          aria-describedby={errors.address ? "contact-address-error" : undefined}
          placeholder={t("cart.contact.address")}
          className={`h-6 ${bareFieldClass}`}
        />
      </FormField>

      <FormField icon={FileText} fieldId="contact-comment">
        <textarea
          value={contact.comment}
          onChange={handleChange("comment")}
          aria-label={t("cart.contact.comment")}
          placeholder={t("cart.contact.commentPlaceholder")}
          rows={2}
          className={`resize-none ${bareFieldClass}`}
        />
      </FormField>
    </div>
  );
}
