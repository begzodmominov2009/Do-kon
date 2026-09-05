import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  quantity: number;
};

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
  addItem: (product: Omit<CartItem, "quantity">) => void;
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
      addItem: (product) => {
        const existing = get().items.find((item) => item.id === product.id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
          return;
        }
        set({ items: [...get().items, { ...product, quantity: 1 }] });
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

// Distinct product lines in the cart (not the sum of quantities).
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
