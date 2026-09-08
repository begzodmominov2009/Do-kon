// Raw row shapes, matching the Supabase tables column-for-column
// (snake_case). Used only at the data-access boundary (lib/api, lib/supabase)
// — UI code works with the hydrated types in lib/types/product.ts instead.

export type Category = {
  id: string;
  slug: string;
  name_uz: string;
  name_en: string | null;
  name_ru: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name_uz: string;
  name_en: string | null;
  name_ru: string | null;
  desc_uz: string;
  desc_en: string | null;
  desc_ru: string | null;
  price: number;
  old_price: number | null;
  category_id: string;
  stock: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
};

export type ProductColor = {
  id: string;
  product_id: string;
  name_uz: string;
  name_en: string | null;
  name_ru: string | null;
  hex: string;
  in_stock: boolean;
  sort_order: number;
};

export type ProductSpec = {
  id: string;
  product_id: string;
  label_uz: string;
  label_en: string | null;
  label_ru: string | null;
  value_uz: string;
  value_en: string | null;
  value_ru: string | null;
  sort_order: number;
};

export type OrderStatus = "new" | "accepted" | "shipping" | "delivered" | "cancelled";

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  full_name: string;
  phone: string;
  region_name: string;
  district_name: string;
  address: string;
  delivery_label: string;
  delivery_price: number;
  promo_code_id: string | null;
  promo_discount: number | null;
  comment: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  image_url: string | null;
  color_name: string | null;
  price: number;
  quantity: number;
};

export type PromoCode = {
  id: string;
  code: string;
  discount: number;
  is_active: boolean;
  expires_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
        Relationships: [];
      };
      product_images: {
        Row: ProductImage;
        Insert: Partial<ProductImage>;
        Update: Partial<ProductImage>;
        Relationships: [];
      };
      product_colors: {
        Row: ProductColor;
        Insert: Partial<ProductColor>;
        Update: Partial<ProductColor>;
        Relationships: [];
      };
      product_specs: {
        Row: ProductSpec;
        Insert: Partial<ProductSpec>;
        Update: Partial<ProductSpec>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order>;
        Update: Partial<Order>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem>;
        Update: Partial<OrderItem>;
        Relationships: [];
      };
      promo_codes: {
        Row: PromoCode;
        Insert: Partial<PromoCode>;
        Update: Partial<PromoCode>;
        Relationships: [];
      };
    };
  };
};
