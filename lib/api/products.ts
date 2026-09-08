import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/db";
import type { Category, Product, ProductColor, ProductImage, ProductSpec } from "@/lib/types/product";

const CATEGORY_COLUMNS = "id, slug, name_uz, name_en, name_ru, icon, sort_order, is_active";

const PRODUCT_COLUMNS =
  "id, slug, name_uz, name_en, name_ru, desc_uz, desc_en, desc_ru, price, old_price, category_id, stock, is_active, sort_order, created_at, product_images(url, sort_order)";

const PRODUCT_DETAIL_COLUMNS =
  "id, slug, name_uz, name_en, name_ru, desc_uz, desc_en, desc_ru, price, old_price, category_id, stock, is_active, sort_order, created_at, " +
  "product_images(url, sort_order), " +
  "product_colors(id, name_uz, name_en, name_ru, hex, in_stock, sort_order), " +
  "product_specs(id, label_uz, label_en, label_ru, value_uz, value_en, value_ru, sort_order), " +
  "category:categories(id, slug, name_uz, name_en, name_ru, icon, sort_order, is_active)";

type CategoryRow = {
  id: string;
  slug: string;
  name_uz: string;
  name_en: string | null;
  name_ru: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

type ProductImageRow = { url: string; sort_order: number };
type ProductColorRow = {
  id: string;
  name_uz: string;
  name_en: string | null;
  name_ru: string | null;
  hex: string;
  in_stock: boolean;
  sort_order: number;
};
type ProductSpecRow = {
  id: string;
  label_uz: string;
  label_en: string | null;
  label_ru: string | null;
  value_uz: string;
  value_en: string | null;
  value_ru: string | null;
  sort_order: number;
};

type ProductRow = {
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
  product_images: ProductImageRow[];
};

type ProductDetailRow = ProductRow & {
  product_colors: ProductColorRow[];
  product_specs: ProductSpecRow[];
  category: CategoryRow | null;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: { uz: row.name_uz, en: row.name_en, ru: row.name_ru },
    icon: row.icon,
  };
}

function mapImages(rows: ProductImageRow[]): ProductImage[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({ url: row.url }));
}

function mapColor(row: ProductColorRow): ProductColor {
  return {
    id: row.id,
    name: { uz: row.name_uz, en: row.name_en, ru: row.name_ru },
    hex: row.hex,
    inStock: row.in_stock,
  };
}

function mapSpec(row: ProductSpecRow): ProductSpec {
  return {
    id: row.id,
    label: { uz: row.label_uz, en: row.label_en, ru: row.label_ru },
    value: { uz: row.value_uz, en: row.value_en, ru: row.value_ru },
  };
}

function mapProduct(row: ProductRow): Product {
  const images = mapImages(row.product_images ?? []);
  return {
    id: row.id,
    slug: row.slug,
    name: { uz: row.name_uz, en: row.name_en, ru: row.name_ru },
    description: { uz: row.desc_uz, en: row.desc_en, ru: row.desc_ru },
    price: row.price,
    oldPrice: row.old_price,
    categoryId: row.category_id,
    images,
    imageUrl: images[0]?.url ?? null,
    inStock: row.stock > 0,
    specs: [],
    colors: [],
  };
}

function mapProductDetail(row: ProductDetailRow): Product {
  const base = mapProduct(row);
  return {
    ...base,
    category: row.category ? mapCategory(row.category) : undefined,
    specs: [...(row.product_specs ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapSpec),
    colors: [...(row.product_colors ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapColor),
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapCategory(row as CategoryRow));
}

export type ProductSort = "newest" | "cheap" | "expensive";

export type ProductFilter = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  discountOnly?: boolean;
  inStockOnly?: boolean;
  search?: string;
  sort?: ProductSort;
  limit?: number;
  offset?: number;
};

export type ProductPage = {
  products: Product[];
  total: number;
};

// Accepts an injectable client so the anon-key API route (app/api/products)
// can reuse this exact filter logic instead of duplicating it.
export async function getProducts(
  filter: ProductFilter = {},
  client: SupabaseClient<Database> = getSupabaseServerClient(),
): Promise<ProductPage> {
  const {
    categorySlug,
    minPrice,
    maxPrice,
    discountOnly,
    inStockOnly,
    search,
    sort = "newest",
    limit = 20,
    offset = 0,
  } = filter;

  let query = client
    .from("products")
    .select(PRODUCT_COLUMNS, { count: "exact" })
    .eq("is_active", true);

  if (categorySlug) {
    const { data: categoryRow, error: categoryError } = await client
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (categoryError) throw new Error(categoryError.message);
    if (!categoryRow) return { products: [], total: 0 };
    const category = categoryRow as { id: string };
    query = query.eq("category_id", category.id);
  }

  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (discountOnly) query = query.not("old_price", "is", null);
  if (inStockOnly) query = query.gt("stock", 0);
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name_uz.ilike.${term},name_en.ilike.${term},name_ru.ilike.${term}`);
  }

  if (sort === "cheap") query = query.order("price", { ascending: true });
  else if (sort === "expensive") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    products: ((data ?? []) as ProductRow[]).map(mapProduct),
    total: count ?? 0,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("products")
    .select(PRODUCT_DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapProductDetail(data as unknown as ProductDetailRow);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 6,
): Promise<Product[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}
