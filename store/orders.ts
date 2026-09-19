import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  colorName?: string;
  colorHex?: string;
};

// Order status is an admin-only concept — the customer only ever sees their
// order history, never a status. (Admin still manages status server-side;
// this app just doesn't display or store it here.)
export type Order = {
  id: string;
  number: string;
  createdAt: number;
  items: OrderItem[];
  deliveryPrice: number;
  promoDiscount?: number;
  fullName: string;
  phone: string;
  regionName: string;
  districtName: string;
  address: string;
  deliveryLabel: string;
  comment?: string;
};

// The order number is server-authoritative (assigned by the DB trigger) —
// callers pass it in rather than the store inventing one.
export type NewOrderInput = Omit<Order, "id" | "createdAt">;

type OrdersState = {
  orders: Order[];
  addOrder: (input: NewOrderInput) => void;
  clearAll: () => void;
};

// Bumped once (dropping the old status field and the demo/mock seed data) —
// this forces existing localStorage installs to start from a clean, empty
// order list instead of keeping stale demo orders around.
const STORE_VERSION = 2;

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (input) => {
        const order: Order = {
          ...input,
          id: `order-${input.number}`,
          createdAt: Date.now(),
        };
        set({ orders: [order, ...get().orders] });
      },
      clearAll: () => set({ orders: [] }),
    }),
    {
      name: "orders-storage",
      version: STORE_VERSION,
      migrate: () => ({ orders: [] }),
    },
  ),
);
