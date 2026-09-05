export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  categoryId: string;
};

export type Category = {
  id: string;
  icon: "electronics" | "fashion" | "home" | "beauty";
};

export const categories: Category[] = [
  { id: "electronics", icon: "electronics" },
  { id: "fashion", icon: "fashion" },
  { id: "home", icon: "home" },
  { id: "beauty", icon: "beauty" },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Simsiz quloqchin",
    price: 249000,
    oldPrice: 299000,
    emoji: "🎧",
    categoryId: "electronics",
  },
  {
    id: "p2",
    name: "Aqlli soat",
    price: 890000,
    emoji: "⌚",
    categoryId: "electronics",
  },
  {
    id: "p3",
    name: "Sport krossovka",
    price: 349000,
    oldPrice: 419000,
    emoji: "👟",
    categoryId: "fashion",
  },
  {
    id: "p4",
    name: "Denim kurtka",
    price: 459000,
    emoji: "🧥",
    categoryId: "fashion",
  },
  {
    id: "p5",
    name: "Kofe demlagich",
    price: 279000,
    oldPrice: 349000,
    emoji: "☕",
    categoryId: "home",
  },
  {
    id: "p6",
    name: "Aromatik shamlar to'plami",
    price: 129000,
    emoji: "🕯️",
    categoryId: "home",
  },
  {
    id: "p7",
    name: "Parfyum to'plami",
    price: 399000,
    oldPrice: 479000,
    emoji: "💐",
    categoryId: "beauty",
  },
  {
    id: "p8",
    name: "Teri parvarish to'plami",
    price: 219000,
    emoji: "🧴",
    categoryId: "beauty",
  },
];

export const saleProducts = products.filter(
  (product) => product.oldPrice !== undefined,
);
