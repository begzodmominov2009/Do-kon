import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductColor } from "@/lib/types/product";
import type { Localized } from "@/lib/utils/i18nField";

export type CartItem = {
  id: string;
  productId: string;
  colorId?: string;
  colorName?: Localized;
  colorHex?: string;
  name: Localized;
  price: number;
  oldPrice?: number | null;
  imageUrl: string | null;
  quantity: number;
};

export type AddItemInput = {
  id: string;
  name: Localized;
  price: number;
  oldPrice?: number | null;
  imageUrl: string | null;
};

export function getCartItemKey(productId: string, colorId?: string): string {
  return colorId ? `${productId}:${colorId}` : productId;
}

type PromoStatus = "idle" | "loading" | "ok" | "error";

export type PromoErrorReason =
  | "not_found"
  | "inactive"
  | "expired"
  | "limit"
  | "min_order"
  | "invalid_request"
  | "rate_limited"
  | "server_error";

type Promo = {
  code: string;
  discount: number;
  discountType: "fixed" | "percent" | null;
  discountValue: number | null;
  status: PromoStatus;
  reason: PromoErrorReason | null;
  minOrder: number | null;
};

export type ContactInfo = {
  fullName: string;
  phone: string;
  regionId: string;
  districtId: string;
  address: string;
  comment: string;
};

type PromoValidateSuccess = {
  ok: true;
  code: string;
  discount: number;
  discountType: "fixed" | "percent";
  discountValue: number;
};

type PromoValidateFailure = {
  ok: false;
  reason: PromoErrorReason;
  minOrder?: number;
};

type PromoValidateResponse = PromoValidateSuccess | PromoValidateFailure;

async function requestPromoValidation(
  code: string,
  items: CartItem[],
): Promise<PromoValidateResponse> {
  try {
    const response = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        items: items.map((item) => ({ productId: item.productId, qty: item.quantity })),
      }),
    });
    return (await response.json()) as PromoValidateResponse;
  } catch {
    return { ok: false, reason: "server_error" };
  }
}

type CartState = {
  items: CartItem[];
  promo: Promo;
  contact: ContactInfo;
  addItem: (product: AddItemInput, color?: ProductColor) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
  clearAfterOrder: () => void;
  applyPromo: (code: string) => Promise<void>;
  revalidatePromo: () => Promise<void>;
  clearPromo: () => void;
  setContactField: (field: keyof ContactInfo, value: string) => void;
};

const IDLE_PROMO: Promo = {
  code: "",
  discount: 0,
  discountType: null,
  discountValue: null,
  status: "idle",
  reason: null,
  minOrder: null,
};

const EMPTY_CONTACT: ContactInfo = {
  fullName: "",
  phone: "",
  regionId: "",
  districtId: "",
  address: "",
  comment: "",
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const applyValidationResult = (result: PromoValidateResponse, fallbackCode: string) => {
        if (result.ok) {
          set({
            promo: {
              code: result.code,
              discount: result.discount,
              discountType: result.discountType,
              discountValue: result.discountValue,
              status: "ok",
              reason: null,
              minOrder: null,
            },
          });
        } else {
          set({
            promo: {
              code: fallbackCode,
              discount: 0,
              discountType: null,
              discountValue: null,
              status: "error",
              reason: result.reason,
              minOrder: result.minOrder ?? null,
            },
          });
        }
      };

      return {
        items: [],
        promo: IDLE_PROMO,
        contact: EMPTY_CONTACT,
        addItem: (product, color) => {
          const key = getCartItemKey(product.id, color?.id);
          const existing = get().items.find((item) => item.id === key);
          if (existing) {
            set({
              items: get().items.map((item) =>
                item.id === key ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            });
          } else {
            set({
              items: [
                ...get().items,
                {
                  id: key,
                  productId: product.id,
                  colorId: color?.id,
                  colorName: color?.name,
                  colorHex: color?.hex,
                  name: product.name,
                  price: product.price,
                  oldPrice: product.oldPrice,
                  imageUrl: product.imageUrl,
                  quantity: 1,
                },
              ],
            });
          }
          void get().revalidatePromo();
        },
        removeItem: (id) => {
          set({ items: get().items.filter((item) => item.id !== id) });
          void get().revalidatePromo();
        },
        setQty: (id, quantity) => {
          set({
            items:
              quantity <= 0
                ? get().items.filter((item) => item.id !== id)
                : get().items.map((item) =>
                    item.id === id ? { ...item, quantity } : item,
                  ),
          });
          void get().revalidatePromo();
        },
        clear: () => set({ items: [], promo: IDLE_PROMO }),
        // Called after a successful order, not the manual "clear cart"
        // button: keeps name/phone/region/district/address so the next
        // order is pre-filled, but drops the comment and promo — those are
        // specific to the order that was just placed.
        clearAfterOrder: () =>
          set((state) => ({
            items: [],
            promo: IDLE_PROMO,
            contact: { ...state.contact, comment: "" },
          })),
        applyPromo: async (code) => {
          const normalized = code.trim().toUpperCase();
          if (!normalized) return;
          set((state) => ({
            promo: { ...state.promo, code: normalized, status: "loading", reason: null },
          }));
          const result = await requestPromoValidation(normalized, get().items);
          applyValidationResult(result, normalized);
        },
        // Re-checks the currently applied promo against the latest cart
        // contents (min-order threshold may now fail, or a percent discount
        // may need recomputing). No-ops unless a promo is actually applied.
        revalidatePromo: async () => {
          const { promo, items } = get();
          if (promo.status !== "ok") return;
          const result = await requestPromoValidation(promo.code, items);
          applyValidationResult(result, promo.code);
        },
        clearPromo: () => set({ promo: IDLE_PROMO }),
        setContactField: (field, value) => {
          set((state) => ({
            contact: {
              ...state.contact,
              [field]: value,
              ...(field === "regionId" ? { districtId: "" } : {}),
            },
          }));
        },
      };
    },
    { name: "cart-storage" },
  ),
);

// Distinct cart lines (each product+color combination counts separately).
export function useCartTotalCount() {
  return useCartStore((state) => state.items.length);
}

// Sum of all item quantities, for when the total unit count is actually needed.
export function useCartTotalQty() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
}

export function useCartSubtotal() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}

export function useCartSavedAmount() {
  return useCartStore((state) =>
    state.items.reduce(
      (sum, item) =>
        sum + Math.max(0, (item.oldPrice ?? item.price) - item.price) * item.quantity,
      0,
    ),
  );
}

export function useCartTotal() {
  const subtotal = useCartSubtotal();
  const discount = useCartStore((state) => state.promo.discount);
  return Math.max(0, subtotal - discount);
}

// For quantity lookups keyed by product+color, e.g. on ProductCard / action bars.
export function useCartItemQuantity(productId: string, colorId?: string) {
  const key = getCartItemKey(productId, colorId);
  return useCartStore(
    (state) => state.items.find((item) => item.id === key)?.quantity ?? 0,
  );
}
