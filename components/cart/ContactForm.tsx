"use client";

import type { ChangeEvent } from "react";
import { FileText, Home, MapPin, MapPinned, Phone, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
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

const fieldInputClass = (hasError: boolean) =>
  `h-11 w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted ${
    hasError ? "rounded-input border border-danger px-2" : ""
  }`;

export function ContactForm({ errors, onClearError }: ContactFormProps) {
  const { t } = useTranslation();
  const contact = useCartStore((state) => state.contact);
  const setContactField = useCartStore((state) => state.setContactField);

  const selectedRegion = regions.find(
    (region) => region.id === contact.regionId,
  );

  const handleChange =
    (field: keyof ContactInfo) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setContactField(field, event.target.value);
      onClearError(field);
    };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
    setContactField("phone", digits);
    onClearError("phone");
  };

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      <div className="flex items-start gap-3 px-4 py-3">
        <User className="mt-2.5 h-5 w-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <input
            id="contact-fullName"
            type="text"
            value={contact.fullName}
            onChange={handleChange("fullName")}
            aria-label={t("cart.contact.fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName ? "contact-fullName-error" : undefined
            }
            placeholder={t("cart.contact.fullName")}
            className={fieldInputClass(Boolean(errors.fullName))}
          />
          {errors.fullName ? (
            <p
              id="contact-fullName-error"
              className="mt-1 text-xs text-danger"
            >
              {errors.fullName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3">
        <Phone className="mt-2.5 h-5 w-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <div
            className={`flex h-11 items-center gap-2 ${
              errors.phone ? "rounded-input border border-danger px-2" : ""
            }`}
          >
            <span className="shrink-0 text-sm text-text-muted">+998</span>
            <input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              value={formatPhoneDigits(contact.phone)}
              onChange={handlePhoneChange}
              aria-label={t("cart.contact.phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? "contact-phone-error" : undefined
              }
              placeholder="(90) 123-45-67"
              className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
            />
          </div>
          {errors.phone ? (
            <p id="contact-phone-error" className="mt-1 text-xs text-danger">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3">
        <MapPin className="mt-2.5 h-5 w-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <select
            id="contact-regionId"
            value={contact.regionId}
            onChange={handleChange("regionId")}
            aria-label={t("cart.contact.region")}
            aria-invalid={Boolean(errors.regionId)}
            aria-describedby={
              errors.regionId ? "contact-regionId-error" : undefined
            }
            className={`h-11 w-full bg-transparent text-sm outline-none ${
              contact.regionId ? "text-text" : "text-text-muted"
            } ${errors.regionId ? "rounded-input border border-danger px-2" : ""}`}
          >
            <option value="" disabled>
              {t("cart.contact.region")}
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id} className="text-text">
                {region.name}
              </option>
            ))}
          </select>
          {errors.regionId ? (
            <p
              id="contact-regionId-error"
              className="mt-1 text-xs text-danger"
            >
              {errors.regionId}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3">
        <MapPinned className="mt-2.5 h-5 w-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <select
            id="contact-districtId"
            value={contact.districtId}
            onChange={handleChange("districtId")}
            disabled={!selectedRegion}
            aria-label={t("cart.contact.district")}
            aria-invalid={Boolean(errors.districtId)}
            aria-describedby={
              errors.districtId ? "contact-districtId-error" : undefined
            }
            className={`h-11 w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed ${
              contact.districtId ? "text-text" : "text-text-muted"
            } ${errors.districtId ? "rounded-input border border-danger px-2" : ""}`}
          >
            <option value="" disabled>
              {selectedRegion
                ? t("cart.contact.district")
                : t("cart.contact.districtPlaceholder")}
            </option>
            {selectedRegion?.districts.map((district) => (
              <option
                key={district.id}
                value={district.id}
                className="text-text"
              >
                {district.name}
              </option>
            ))}
          </select>
          {errors.districtId ? (
            <p
              id="contact-districtId-error"
              className="mt-1 text-xs text-danger"
            >
              {errors.districtId}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3">
        <Home className="mt-2.5 h-5 w-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <input
            id="contact-address"
            type="text"
            value={contact.address}
            onChange={handleChange("address")}
            aria-label={t("cart.contact.address")}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={
              errors.address ? "contact-address-error" : undefined
            }
            placeholder={t("cart.contact.address")}
            className={fieldInputClass(Boolean(errors.address))}
          />
          {errors.address ? (
            <p id="contact-address-error" className="mt-1 text-xs text-danger">
              {errors.address}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3">
        <FileText className="mt-2.5 h-5 w-5 shrink-0 text-accent" />
        <textarea
          value={contact.comment}
          onChange={handleChange("comment")}
          aria-label={t("cart.contact.comment")}
          placeholder={t("cart.contact.commentPlaceholder")}
          rows={2}
          className="min-w-0 flex-1 resize-none bg-transparent py-2 text-sm text-text outline-none placeholder:text-text-muted"
        />
      </div>
    </div>
  );
}
