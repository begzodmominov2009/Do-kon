// Standalone mock data kept only for local comparison while the database is
// empty — intentionally not sharing types with the live app (lib/types/product.ts),
// since that shape now carries per-language DB fields this static data doesn't have.
export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
};

export type ProductSpec = {
  key: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  categoryId: string;
  gallery: string[];
  description: string;
  inStock: boolean;
  specs: ProductSpec[];
  colors?: ProductColor[];
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
    gallery: ["🎧", "🔋", "🎵"],
    description:
      "Faol shovqin bostirish tizimi bilan jihozlangan simsiz quloqchin. Bir marta quvvatlashda 30 soatgacha ishlaydi va tezkor zaryadlash funksiyasiga ega. Sport va kundalik foydalanish uchun qulay, terga chidamli material ishlatilgan. Bluetooth 5.3 orqali barcha zamonaviy qurilmalarga ulanadi.",
    inStock: true,
    specs: [
      { key: "color", value: "Qora" },
      { key: "battery", value: "30 soat" },
      { key: "connection", value: "Bluetooth 5.3" },
    ],
    colors: [
      { id: "black", name: "Qora", hex: "#1a1a1a", inStock: true },
      { id: "white", name: "Oq", hex: "#f5f5f5", inStock: true },
    ],
  },
  {
    id: "p2",
    name: "Aqlli soat",
    price: 890000,
    emoji: "⌚",
    categoryId: "electronics",
    gallery: ["⌚", "💓", "📱"],
    description:
      "Yurak urish tezligi, uyqu sifati va jismoniy faollikni kuzatib boradigan aqlli soat. Suvga chidamli korpus va 7 kungacha ishlaydigan batareya bilan jihozlangan. Ilova orqali bildirishnomalarni to'g'ridan-to'g'ri qo'lingizga yetkazadi.",
    inStock: true,
    specs: [
      { key: "color", value: "Kumush" },
      { key: "battery", value: "7 kun" },
      { key: "material", value: "Alyuminiy" },
    ],
  },
  {
    id: "p3",
    name: "Sport krossovka",
    price: 349000,
    oldPrice: 419000,
    emoji: "👟",
    categoryId: "fashion",
    gallery: ["👟", "🧵", "👣"],
    description:
      "Yengil va nafas oluvchi mesh gazlamadan tayyorlangan sport krossovka. Yugurish va kundalik yurish uchun mo'ljallangan amortizatsion tag bilan. Oyoqni yaxshi ushlab turadigan anatomik dizayn.",
    inStock: true,
    specs: [
      { key: "size", value: "40-44" },
      { key: "material", value: "Mesh gazlama" },
      { key: "color", value: "Oq/Kulrang" },
    ],
    colors: [
      { id: "white", name: "Oq", hex: "#f5f5f5", inStock: true },
      { id: "black", name: "Qora", hex: "#1a1a1a", inStock: true },
      { id: "red", name: "Qizil", hex: "#dc2626", inStock: false },
    ],
  },
  {
    id: "p4",
    name: "Denim kurtka",
    price: 459000,
    emoji: "🧥",
    categoryId: "fashion",
    gallery: ["🧥", "🧵", "👕"],
    description:
      "Klassik kesimli denim kurtka, har qanday kiyimga mos keladi. 100% paxta matodan tikilgan, mustahkam tikuvlar bilan. Barcha fasllarda kiyish uchun qulay, vaqt o'tishi bilan o'ziga xos ko'rinish oladi.",
    inStock: true,
    specs: [
      { key: "size", value: "S-XXL" },
      { key: "material", value: "100% paxta denim" },
      { key: "color", value: "Ko'k" },
    ],
    colors: [
      { id: "blue", name: "Ko'k", hex: "#2c4a6e", inStock: true },
      { id: "black", name: "Qora", hex: "#1a1a1a", inStock: true },
    ],
  },
  {
    id: "p5",
    name: "Kofe demlagich",
    price: 279000,
    oldPrice: 349000,
    emoji: "☕",
    categoryId: "home",
    gallery: ["☕", "🫖", "🔥"],
    description:
      "Qo'lda kofe demlash uchun mo'ljallangan klassik demlagich. Chinni asos va bambuk tutqichga ega. Kofe ta'mini to'liq ochib beruvchi sekin damlash usuli, kundalik nonushta marosimingizga zeb qo'shadi.",
    inStock: true,
    specs: [
      { key: "capacity", value: "1.2 litr" },
      { key: "material", value: "Chinni va bambuk" },
      { key: "color", value: "Terrakota" },
    ],
  },
  {
    id: "p6",
    name: "Aromatik shamlar to'plami",
    price: 129000,
    emoji: "🕯️",
    categoryId: "home",
    gallery: ["🕯️", "🌿", "🎁"],
    description:
      "Vanil va sandal hidli tabiiy mumdan tayyorlangan uch dona shamlar to'plami. Uyingizga issiq va tinchlantiruvchi muhit yaratadi. Sovg'a qutisida yetkaziladi, har qanday bayram uchun mos.",
    inStock: true,
    specs: [
      { key: "count", value: "3 dona" },
      { key: "burnTime", value: "40 soat" },
      { key: "scent", value: "Vanil va sandal" },
    ],
  },
  {
    id: "p7",
    name: "Parfyum to'plami",
    price: 399000,
    oldPrice: 479000,
    emoji: "💐",
    categoryId: "beauty",
    gallery: ["💐", "🌸", "🎀"],
    description:
      "Gulli-sitrus notalariga ega uchta mini parfyum to'plami. Kun davomida yengil va yoqimli hid qoldiradi. Frantsiyada ishlab chiqarilgan, sayohat uchun ham qulay hajmda.",
    inStock: true,
    specs: [
      { key: "volume", value: "3 x 30 ml" },
      { key: "scent", value: "Gulli-sitrus" },
      { key: "origin", value: "Fransiya" },
    ],
  },
  {
    id: "p8",
    name: "Teri parvarish to'plami",
    price: 219000,
    emoji: "🧴",
    categoryId: "beauty",
    gallery: ["🧴", "✨", "🧼"],
    description:
      "Yuz terisini tozalash, namlash va parvarish qilish uchun to'rt bosqichli to'plam. Barcha teri turlariga mos, tabiiy tarkibiy qismlar asosida ishlab chiqarilgan. Hozircha ombordagi zaxira tugagan.",
    inStock: false,
    specs: [
      { key: "count", value: "4 dona" },
      { key: "skinType", value: "Barcha teri turlari" },
      { key: "volume", value: "250 ml" },
    ],
  },
];

export const saleProducts = products.filter(
  (product) => product.oldPrice !== undefined,
);

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getSimilarProducts(product: Product, limit = 6): Product[] {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.categoryId === product.categoryId,
    )
    .slice(0, limit);
}
