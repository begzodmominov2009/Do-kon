import type { Localized } from "@/lib/utils/i18nField";

export type ProductColor = {
  id: string;
  name: Localized;
  hex: string;
  inStock: boolean;
};

export type ProductSpec = {
  id: string;
  label: Localized;
  value: Localized;
};

export type ProductImage = {
  url: string;
};

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  icon: string;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  price: number;
  oldPrice: number | null;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  imageUrl: string | null;
  inStock: boolean;
  specs: ProductSpec[];
  colors: ProductColor[];
};
