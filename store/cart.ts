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

type Promo = {
  code: string;
  discount: number;
  status: PromoStatus;
};

export type ContactInfo = {
  fullName: string;
  phone: string;
  regionId: string;
  districtId: string;
  address: string;
  comment: string;
};

type CartState = {
  items: CartItem[];
  promo: Promo;
  contact: ContactInfo;
  addItem: (product: AddItemInput, color?: ProductColor) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
  applyPromo: (code: string) => Promise<void>;
  clearPromo: () => void;
  setContactField: (field: keyof ContactInfo, value: string) => void;
};

const IDLE_PROMO: Promo = { code: "", discount: 0, status: "idle" };

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
    (set, get) => ({
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
          return;
        }
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
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
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
      },
      clear: () => set({ items: [], promo: IDLE_PROMO }),
      applyPromo: async (code) => {
        set((state) => ({ promo: { ...state.promo, status: "loading" } }));
        await new Promise((resolve) => setTimeout(resolve, 800));
        const normalized = code.trim().toUpperCase();
        if (normalized === "DEMO25") {
          set({ promo: { code: normalized, discount: 25000, status: "ok" } });
        } else {
          set({ promo: { code: normalized, discount: 0, status: "error" } });
        }
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
    }),
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
