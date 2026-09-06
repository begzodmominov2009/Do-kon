import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "new" | "accepted" | "shipping" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  emoji: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  createdAt: number;
  items: OrderItem[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  deliveryLabel: string;
};

export type NewOrderInput = Omit<Order, "id" | "number" | "createdAt" | "status">;

// Seed data so the order-history UI has something real to render before
// checkout is wired up to actually create orders.
const MOCK_ORDERS: Order[] = [
  {
    id: "order-1024",
    number: 1024,
    status: "shipping",
    createdAt: new Date("2026-09-06T09:15:00").getTime(),
    items: [
      { productId: "p1", name: "Simsiz quloqchin", emoji: "🎧", price: 249000, quantity: 1 },
      { productId: "p5", name: "Kofe demlagich", emoji: "☕", price: 279000, quantity: 1 },
    ],
    total: 528000,
    fullName: "Aziz Karimov",
    phone: "(90) 123-45-67",
    address: "Chilonzor tumani, 12-uy",
    deliveryLabel: "BTS pochta orqali",
  },
  {
    id: "order-1023",
    number: 1023,
    status: "delivered",
    createdAt: new Date("2026-09-02T14:40:00").getTime(),
    items: [
      { productId: "p3", name: "Sport krossovka", emoji: "👟", price: 349000, quantity: 1 },
    ],
    total: 349000,
    fullName: "Aziz Karimov",
    phone: "(90) 123-45-67",
    address: "Chilonzor tumani, 12-uy",
    deliveryLabel: "BTS pochta orqali",
  },
  {
    id: "order-1022",
    number: 1022,
    status: "cancelled",
    createdAt: new Date("2026-08-28T18:05:00").getTime(),
    items: [
      { productId: "p7", name: "Parfyum to'plami", emoji: "💐", price: 399000, quantity: 1 },
      { productId: "p8", name: "Teri parvarish to'plami", emoji: "🧴", price: 219000, quantity: 1 },
    ],
    total: 618000,
    fullName: "Aziz Karimov",
    phone: "(90) 123-45-67",
    address: "Chilonzor tumani, 12-uy",
    deliveryLabel: "BTS pochta orqali",
  },
];

type OrdersState = {
  orders: Order[];
  addOrder: (input: NewOrderInput) => void;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: MOCK_ORDERS,
      addOrder: (input) => {
        const orders = get().orders;
        const nextNumber = (orders[0]?.number ?? 1000) + 1;
        const order: Order = {
          ...input,
          id: `order-${nextNumber}`,
          number: nextNumber,
          status: "new",
          createdAt: Date.now(),
        };
        set({ orders: [order, ...orders] });
      },
    }),
    { name: "orders-storage" },
  ),
);
